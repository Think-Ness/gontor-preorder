-- ============================================================
-- Migration 004: Admin RLS Policies (Full CRUD for Authenticated Users)
-- ============================================================

CREATE POLICY "admin_all_products" ON products FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "admin_all_variants" ON product_variants FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "admin_all_packages" ON packages FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "admin_all_package_items" ON package_items FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "admin_all_orders" ON orders FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "admin_all_order_items" ON order_items FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "admin_all_event_settings" ON event_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "admin_all_payment_methods" ON payment_methods FOR ALL TO authenticated USING (true) WITH CHECK (true);
