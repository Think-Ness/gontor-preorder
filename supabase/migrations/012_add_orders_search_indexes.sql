-- Migration 012: Add performance indexes for order lookup & tracking
CREATE INDEX IF NOT EXISTS idx_orders_search ON orders (order_number, stambuk, whatsapp_number);
CREATE INDEX IF NOT EXISTS idx_orders_map_pins ON orders (shipping_latitude, shipping_longitude) WHERE order_status NOT IN ('CANCELLED', 'REJECTED', 'DRAFT');
CREATE INDEX IF NOT EXISTS idx_products_display_order ON products (display_order);
CREATE INDEX IF NOT EXISTS idx_products_size_chart ON products (size_chart_id);
