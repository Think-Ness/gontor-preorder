-- ============================================================
-- Migration 002: Indexes, Triggers, Functions
-- ============================================================

-- ============================================================
-- INDEXES
-- ============================================================

-- Orders
CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_stambuk ON orders(stambuk);
CREATE INDEX idx_orders_whatsapp ON orders(whatsapp);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_order_status ON orders(order_status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_orders_checkout_session ON orders(checkout_session_id);

-- Order Items
CREATE INDEX idx_order_items_order_id ON order_items(order_id);

-- Products
CREATE INDEX idx_products_is_active ON products(is_active);
CREATE INDEX idx_products_display_order ON products(display_order);

-- Product Variants
CREATE INDEX idx_variants_product_id ON product_variants(product_id);

-- Packages
CREATE INDEX idx_packages_is_active ON packages(is_active);

-- Audit Logs
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- ============================================================
-- updated_at TRIGGER FUNCTION
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tables with updated_at
CREATE TRIGGER update_event_settings_updated_at
  BEFORE UPDATE ON event_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_methods_updated_at
  BEFORE UPDATE ON payment_methods
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_variants_updated_at
  BEFORE UPDATE ON product_variants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_packages_updated_at
  BEFORE UPDATE ON packages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_profiles_updated_at
  BEFORE UPDATE ON admin_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- ORDER NUMBER GENERATOR
-- Format: MCH-2026-XXXXX (zero-padded sequential)
-- ============================================================

CREATE SEQUENCE order_number_seq START 1;

CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
  seq_val BIGINT;
BEGIN
  seq_val := nextval('order_number_seq');
  RETURN 'MCH-' || EXTRACT(YEAR FROM NOW())::TEXT || '-' || LPAD(seq_val::TEXT, 5, '0');
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- IDEMPOTENT ORDER CREATION
-- Prevents duplicate orders from double-submit
-- ============================================================

CREATE OR REPLACE FUNCTION create_order_idempotent(
  p_checkout_session_id UUID,
  p_order_data JSONB,
  p_items JSONB
) RETURNS JSONB AS $$
DECLARE
  v_order_id UUID;
  v_order_number TEXT;
  v_existing_order orders%ROWTYPE;
  v_item JSONB;
  v_product products%ROWTYPE;
  v_variant product_variants%ROWTYPE;
  v_package packages%ROWTYPE;
  v_subtotal NUMERIC := 0;
  v_item_subtotal NUMERIC;
  v_unit_price NUMERIC;
  v_item_name TEXT;
  v_variant_name TEXT;
BEGIN
  -- Check for existing order with same session
  SELECT * INTO v_existing_order
  FROM orders
  WHERE checkout_session_id = p_checkout_session_id;

  IF FOUND THEN
    RETURN jsonb_build_object(
      'order_id', v_existing_order.id,
      'order_number', v_existing_order.order_number,
      'total_amount', v_existing_order.total_amount,
      'already_exists', true
    );
  END IF;

  -- Generate order number
  v_order_number := generate_order_number();

  -- Calculate subtotal server-side from DB prices
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    IF v_item->>'itemType' = 'PACKAGE' THEN
      SELECT * INTO v_package FROM packages
      WHERE id = (v_item->>'packageId')::UUID AND is_active = true;

      IF NOT FOUND THEN
        RAISE EXCEPTION 'Package not found or inactive: %', v_item->>'packageId';
      END IF;

      v_unit_price := v_package.price;
      v_item_name := v_package.name;
      v_variant_name := NULL;

    ELSIF v_item->>'itemType' = 'VARIANT' THEN
      SELECT * INTO v_variant FROM product_variants
      WHERE id = (v_item->>'variantId')::UUID AND is_active = true;

      IF NOT FOUND THEN
        RAISE EXCEPTION 'Variant not found or inactive: %', v_item->>'variantId';
      END IF;

      SELECT * INTO v_product FROM products
      WHERE id = v_variant.product_id AND is_active = true;

      IF NOT FOUND THEN
        RAISE EXCEPTION 'Product not found or inactive';
      END IF;

      -- Check stock if enabled
      IF v_variant.stock IS NOT NULL AND v_variant.stock < (v_item->>'quantity')::INTEGER THEN
        RAISE EXCEPTION 'Stok tidak mencukupi untuk variant: %', v_variant.name;
      END IF;

      v_unit_price := v_variant.price;
      v_item_name := v_product.name;
      v_variant_name := v_variant.name;

    ELSE -- PRODUCT (SIMPLE)
      SELECT * INTO v_product FROM products
      WHERE id = (v_item->>'productId')::UUID AND is_active = true;

      IF NOT FOUND THEN
        RAISE EXCEPTION 'Product not found or inactive: %', v_item->>'productId';
      END IF;

      -- Check stock if enabled
      IF v_product.stock_enabled AND v_product.stock IS NOT NULL AND v_product.stock < (v_item->>'quantity')::INTEGER THEN
        RAISE EXCEPTION 'Stok tidak mencukupi untuk produk: %', v_product.name;
      END IF;

      v_unit_price := v_product.price;
      v_item_name := v_product.name;
      v_variant_name := NULL;
    END IF;

    v_item_subtotal := v_unit_price * (v_item->>'quantity')::INTEGER;
    v_subtotal := v_subtotal + v_item_subtotal;
  END LOOP;

  -- Create order
  INSERT INTO orders (
    order_number, checkout_session_id,
    stambuk, full_name, district, generation_year, whatsapp,
    fulfillment_method,
    shipping_address, shipping_village, shipping_district,
    shipping_city, shipping_province, shipping_postal_code,
    subtotal, shipping_cost, total_amount,
    payment_status, order_status,
    payment_proof_file_id, payment_proof_url,
    payment_proof_filename, payment_proof_mime_type,
    payment_proof_size, payment_proof_uploaded_at
  ) VALUES (
    v_order_number, p_checkout_session_id,
    p_order_data->>'stambuk', p_order_data->>'full_name',
    p_order_data->>'district',
    (p_order_data->>'generation_year')::INTEGER,
    p_order_data->>'whatsapp',
    (p_order_data->>'fulfillment_method')::fulfillment_method,
    p_order_data->>'shipping_address', p_order_data->>'shipping_village',
    p_order_data->>'shipping_district', p_order_data->>'shipping_city',
    p_order_data->>'shipping_province', p_order_data->>'shipping_postal_code',
    v_subtotal,
    COALESCE((p_order_data->>'shipping_cost')::NUMERIC, 0),
    v_subtotal + COALESCE((p_order_data->>'shipping_cost')::NUMERIC, 0),
    'PROOF_UPLOADED', 'PAYMENT_REVIEW',
    p_order_data->>'payment_proof_file_id', p_order_data->>'payment_proof_url',
    p_order_data->>'payment_proof_filename', p_order_data->>'payment_proof_mime_type',
    (p_order_data->>'payment_proof_size')::BIGINT,
    NOW()
  ) RETURNING id INTO v_order_id;

  -- Insert order items & decrement stock
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    IF v_item->>'itemType' = 'PACKAGE' THEN
      SELECT * INTO v_package FROM packages WHERE id = (v_item->>'packageId')::UUID;
      v_unit_price := v_package.price;
      v_item_name := v_package.name;
      v_variant_name := NULL;

      INSERT INTO order_items (
        order_id, package_id, item_type,
        item_name_snapshot, unit_price_snapshot, quantity, subtotal
      ) VALUES (
        v_order_id, (v_item->>'packageId')::UUID, 'PACKAGE',
        v_item_name, v_unit_price,
        (v_item->>'quantity')::INTEGER,
        v_unit_price * (v_item->>'quantity')::INTEGER
      );

    ELSIF v_item->>'itemType' = 'VARIANT' THEN
      SELECT * INTO v_variant FROM product_variants WHERE id = (v_item->>'variantId')::UUID;
      SELECT * INTO v_product FROM products WHERE id = v_variant.product_id;
      v_unit_price := v_variant.price;
      v_item_name := v_product.name;
      v_variant_name := v_variant.name;

      INSERT INTO order_items (
        order_id, product_id, variant_id, item_type,
        item_name_snapshot, variant_name_snapshot, unit_price_snapshot, quantity, subtotal
      ) VALUES (
        v_order_id, v_product.id, v_variant.id, 'VARIANT',
        v_item_name, v_variant_name, v_unit_price,
        (v_item->>'quantity')::INTEGER,
        v_unit_price * (v_item->>'quantity')::INTEGER
      );

      -- Decrement variant stock
      IF v_variant.stock IS NOT NULL THEN
        UPDATE product_variants
        SET stock = stock - (v_item->>'quantity')::INTEGER
        WHERE id = v_variant.id;
      END IF;

    ELSE -- PRODUCT
      SELECT * INTO v_product FROM products WHERE id = (v_item->>'productId')::UUID;
      v_unit_price := v_product.price;
      v_item_name := v_product.name;
      v_variant_name := NULL;

      INSERT INTO order_items (
        order_id, product_id, item_type,
        item_name_snapshot, unit_price_snapshot, quantity, subtotal
      ) VALUES (
        v_order_id, v_product.id, 'PRODUCT',
        v_item_name, v_unit_price,
        (v_item->>'quantity')::INTEGER,
        v_unit_price * (v_item->>'quantity')::INTEGER
      );

      -- Decrement product stock
      IF v_product.stock_enabled AND v_product.stock IS NOT NULL THEN
        UPDATE products
        SET stock = stock - (v_item->>'quantity')::INTEGER
        WHERE id = v_product.id;
      END IF;
    END IF;
  END LOOP;

  RETURN jsonb_build_object(
    'order_id', v_order_id,
    'order_number', v_order_number,
    'total_amount', v_subtotal + COALESCE((p_order_data->>'shipping_cost')::NUMERIC, 0),
    'already_exists', false
  );
END;
$$ LANGUAGE plpgsql;
