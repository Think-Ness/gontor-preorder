-- ============================================================
-- Migration 003: Row Level Security (RLS)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE event_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE package_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- PUBLIC READ policies (catalog, settings)
-- ============================================================

-- Anyone can read active event settings
CREATE POLICY "public_read_event_settings"
  ON event_settings FOR SELECT
  TO anon, authenticated
  USING (true);

-- Anyone can read active payment methods
CREATE POLICY "public_read_payment_methods"
  ON payment_methods FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

-- Anyone can read active products
CREATE POLICY "public_read_products"
  ON products FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

-- Anyone can read active variants
CREATE POLICY "public_read_variants"
  ON product_variants FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

-- Anyone can read active packages
CREATE POLICY "public_read_packages"
  ON packages FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

-- Anyone can read package items
CREATE POLICY "public_read_package_items"
  ON package_items FOR SELECT
  TO anon, authenticated
  USING (true);

-- ============================================================
-- ORDER policies
-- Orders are created via service_role (server actions only)
-- Public cannot read orders (only via order number + whatsapp lookup server-side)
-- ============================================================

-- Service role has full access (no RLS needed — bypasses RLS by default)
-- We rely on server-side service_role for all order mutations

-- ============================================================
-- ADMIN policies
-- Admin operations use service_role key — bypasses RLS
-- These policies are for authenticated admin users (Supabase Auth)
-- ============================================================

CREATE POLICY "admin_read_own_profile"
  ON admin_profiles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- ============================================================
-- SERVICE ROLE NOTE
-- All server actions use SUPABASE_SERVICE_ROLE_KEY which bypasses RLS.
-- RLS policies above protect against direct anon/authenticated API abuse.
-- ============================================================
