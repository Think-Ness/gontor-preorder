-- ============================================================
-- Migration 013: Cart Stock Reservation & Soft Hold System
-- ============================================================

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create cart_reservations table
CREATE TABLE IF NOT EXISTS cart_reservations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,gyeDWZFFSWRA5DXW  QW22W23E4Q
  variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for fast lookup & expiration cleanup
CREATE INDEX IF NOT EXISTS idx_cart_reservations_session ON cart_reservations(session_id);
CREATE INDEX IF NOT EXISTS idx_cart_reservations_expires ON cart_reservations(expires_at);
CREATE INDEX IF NOT EXISTS idx_cart_reservations_product ON cart_reservations(product_id);
CREATE INDEX IF NOT EXISTS idx_cart_reservations_variant ON cart_reservations(variant_id);

-- Enable RLS
ALTER TABLE cart_reservations ENABLE ROW LEVEL SECURITY;

-- Public RLS Policies for cart_reservations
CREATE POLICY "Allow public select cart_reservations"
  ON cart_reservations FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert cart_reservations"
  ON cart_reservations FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public delete cart_reservations"
  ON cart_reservations FOR DELETE
  USING (true);


-- 2. Helper function: Get available product stock
CREATE OR REPLACE FUNCTION get_available_product_stock(
  p_product_id UUID,
  p_exclude_session_id UUID DEFAULT NULL
) RETURNS INTEGER AS $$
DECLARE
  v_stock INTEGER;
  v_stock_enabled BOOLEAN;
  v_reserved INTEGER;
BEGIN
  SELECT stock, stock_enabled INTO v_stock, v_stock_enabled
  FROM products WHERE id = p_product_id AND is_active = true;

  IF NOT FOUND OR NOT v_stock_enabled OR v_stock IS NULL THEN
    RETURN 999999;
  END IF;

  SELECT COALESCE(SUM(quantity), 0) INTO v_reserved
  FROM cart_reservations
  WHERE product_id = p_product_id
    AND expires_at > NOW()
    AND (p_exclude_session_id IS NULL OR session_id != p_exclude_session_id);

  RETURN GREATEST(0, v_stock - v_reserved);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 3. Helper function: Get available variant stock
CREATE OR REPLACE FUNCTION get_available_variant_stock(
  p_variant_id UUID,
  p_exclude_session_id UUID DEFAULT NULL
) RETURNS INTEGER AS $$
DECLARE
  v_stock INTEGER;
  v_reserved INTEGER;
BEGIN
  SELECT stock INTO v_stock
  FROM product_variants WHERE id = p_variant_id AND is_active = true;

  IF NOT FOUND OR v_stock IS NULL THEN
    RETURN 999999;
  END IF;

  SELECT COALESCE(SUM(quantity), 0) INTO v_reserved
  FROM cart_reservations
  WHERE variant_id = p_variant_id
    AND expires_at > NOW()
    AND (p_exclude_session_id IS NULL OR session_id != p_exclude_session_id);

  RETURN GREATEST(0, v_stock - v_reserved);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 4. RPC: Reserve Cart Stock (Soft Hold for 15 mins)
CREATE OR REPLACE FUNCTION reserve_cart_stock(
  p_session_id UUID,
  p_items JSONB,
  p_ttl_minutes INTEGER DEFAULT 15
) RETURNS JSONB AS $$
DECLARE
  v_item JSONB;
  v_product_id UUID;
  v_variant_id UUID;
  v_quantity INTEGER;
  v_avail INTEGER;
  v_expires_at TIMESTAMPTZ;
  v_item_type TEXT;
  v_product_name TEXT;
  v_variant_name TEXT;
BEGIN
  -- 1. Clean up expired reservations across all sessions
  DELETE FROM cart_reservations WHERE expires_at <= NOW();

  -- 2. Clear previous reservations for this specific session
  DELETE FROM cart_reservations WHERE session_id = p_session_id;

  -- Calculate expiration timestamp
  v_expires_at := NOW() + (p_ttl_minutes || ' minutes')::INTERVAL;

  -- 3. Verify available stock for each item in cart
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_item_type := v_item->>'itemType';
    v_quantity := (v_item->>'quantity')::INTEGER;

    IF v_item_type = 'VARIANT' THEN
      v_variant_id := (v_item->>'variantId')::UUID;
      v_avail := get_available_variant_stock(v_variant_id, p_session_id);

      SELECT pv.name, p.name INTO v_variant_name, v_product_name
      FROM product_variants pv
      JOIN products p ON p.id = pv.product_id
      WHERE pv.id = v_variant_id;

      IF v_avail < v_quantity THEN
        RETURN jsonb_build_object(
          'success', false,
          'error', 'Stok tidak mencukupi untuk ' || COALESCE(v_product_name, 'produk') || ' (' || COALESCE(v_variant_name, '') || '). Tersedia: ' || v_avail
        );
      END IF;

    ELSIF v_item_type = 'PRODUCT' THEN
      v_product_id := (v_item->>'productId')::UUID;
      v_avail := get_available_product_stock(v_product_id, p_session_id);

      SELECT name INTO v_product_name FROM products WHERE id = v_product_id;

      IF v_avail < v_quantity THEN
        RETURN jsonb_build_object(
          'success', false,
          'error', 'Stok tidak mencukupi untuk ' || COALESCE(v_product_name, 'produk') || '. Tersedia: ' || v_avail
        );
      END IF;
    END IF;
  END LOOP;

  -- 4. All stock checks passed -> Insert reservation records
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_item_type := v_item->>'itemType';
    v_quantity := (v_item->>'quantity')::INTEGER;

    IF v_item_type = 'VARIANT' THEN
      v_variant_id := (v_item->>'variantId')::UUID;
      INSERT INTO cart_reservations (session_id, variant_id, quantity, expires_at)
      VALUES (p_session_id, v_variant_id, v_quantity, v_expires_at);

    ELSIF v_item_type = 'PRODUCT' THEN
      v_product_id := (v_item->>'productId')::UUID;
      INSERT INTO cart_reservations (session_id, product_id, quantity, expires_at)
      VALUES (p_session_id, v_product_id, v_quantity, v_expires_at);
    END IF;
  END LOOP;

  RETURN jsonb_build_object(
    'success', true,
    'expires_at', v_expires_at
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 5. RPC: Release Cart Stock
CREATE OR REPLACE FUNCTION release_cart_stock(
  p_session_id UUID
) RETURNS JSONB AS $$
BEGIN
  DELETE FROM cart_reservations WHERE session_id = p_session_id;
  RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 6. Updated create_order_idempotent to clear reservations on successful order creation
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
  v_avail INTEGER;
BEGIN
  -- Clean expired reservations
  DELETE FROM cart_reservations WHERE expires_at <= NOW();

  -- Check for existing order with same session
  SELECT * INTO v_existing_order
  FROM orders
  WHERE checkout_session_id = p_checkout_session_id;

  IF FOUND THEN
    -- Clear reservations if order already exists
    DELETE FROM cart_reservations WHERE session_id = p_checkout_session_id;

    RETURN jsonb_build_object(
      'order_id', v_existing_order.id,
      'order_number', v_existing_order.order_number,
      'total_amount', v_existing_order.total_amount,
      'already_exists', true
    );
  END IF;

  -- Generate order number
  v_order_number := generate_order_number();

  -- Calculate subtotal & verify stock
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

      -- Check stock against actual stock (excluding user's own reservation)
      IF v_variant.stock IS NOT NULL THEN
        v_avail := get_available_variant_stock(v_variant.id, p_checkout_session_id);
        IF v_avail < (v_item->>'quantity')::INTEGER THEN
          RAISE EXCEPTION 'Stok tidak mencukupi untuk variant: %', v_variant.name;
        END IF;
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

      -- Check stock
      IF v_product.stock_enabled AND v_product.stock IS NOT NULL THEN
        v_avail := get_available_product_stock(v_product.id, p_checkout_session_id);
        IF v_avail < (v_item->>'quantity')::INTEGER THEN
          RAISE EXCEPTION 'Stok tidak mencukupi untuk produk: %', v_product.name;
        END IF;
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
    is_alumni, email,
    stambuk, full_name, district, generation_year, whatsapp,
    fulfillment_method,
    shipping_address, shipping_village, shipping_district,
    shipping_city, shipping_province, shipping_postal_code,
    shipping_latitude, shipping_longitude,
    subtotal, shipping_cost, total_amount,
    payment_status, order_status,
    payment_proof_file_id, payment_proof_url,
    payment_proof_filename, payment_proof_mime_type,
    payment_proof_size, payment_proof_uploaded_at
  ) VALUES (
    v_order_number, p_checkout_session_id,
    COALESCE((p_order_data->>'is_alumni')::BOOLEAN, true),
    p_order_data->>'email',
    p_order_data->>'stambuk', p_order_data->>'full_name',
    p_order_data->>'district',
    (p_order_data->>'generation_year')::INTEGER,
    p_order_data->>'whatsapp',
    (p_order_data->>'fulfillment_method')::fulfillment_method,
    p_order_data->>'shipping_address', p_order_data->>'shipping_village',
    p_order_data->>'shipping_district', p_order_data->>'shipping_city',
    p_order_data->>'shipping_province', p_order_data->>'shipping_postal_code',
    (p_order_data->>'shipping_latitude')::NUMERIC, (p_order_data->>'shipping_longitude')::NUMERIC,
    v_subtotal,
    COALESCE((p_order_data->>'shipping_cost')::NUMERIC, 0),
    v_subtotal + COALESCE((p_order_data->>'shipping_cost')::NUMERIC, 0),
    'PROOF_UPLOADED', 'PAYMENT_REVIEW',
    p_order_data->>'payment_proof_file_id', p_order_data->>'payment_proof_url',
    p_order_data->>'payment_proof_filename', p_order_data->>'payment_proof_mime_type',
    (p_order_data->>'payment_proof_size')::BIGINT,
    NOW()
  ) RETURNING id INTO v_order_id;

  -- Insert order items & decrement actual stock
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

      -- Decrement stock
      IF v_variant.stock IS NOT NULL THEN
        UPDATE product_variants
        SET stock = stock - (v_item->>'quantity')::INTEGER
        WHERE id = v_variant.id;
      END IF;

    ELSE -- PRODUCT (SIMPLE)
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

      -- Decrement stock
      IF v_product.stock_enabled AND v_product.stock IS NOT NULL THEN
        UPDATE products
        SET stock = stock - (v_item->>'quantity')::INTEGER
        WHERE id = v_product.id;
      END IF;
    END IF;
  END LOOP;

  -- 7. Release session reservation after successful order creation
  DELETE FROM cart_reservations WHERE session_id = p_checkout_session_id;

  RETURN jsonb_build_object(
    'order_id', v_order_id,
    'order_number', v_order_number,
    'total_amount', v_subtotal + COALESCE((p_order_data->>'shipping_cost')::NUMERIC, 0),
    'already_exists', false
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
