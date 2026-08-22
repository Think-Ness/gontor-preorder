-- Add missing columns to event_settings table
ALTER TABLE event_settings
  ADD COLUMN IF NOT EXISTS allow_pickup BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS allow_delivery BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS default_shipping_fee NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS pickup_location_note TEXT DEFAULT 'Stand Merchandise Utama 100 Tahun Gontor (Depan Balai Pertemuan)',
  ADD COLUMN IF NOT EXISTS allowed_couriers TEXT DEFAULT '{"pos":true,"jne":true,"jnt":true,"sicepat":true,"wahana":true}',
  ADD COLUMN IF NOT EXISTS pin_vendor TEXT DEFAULT '1234',
  ADD COLUMN IF NOT EXISTS pin_stand TEXT DEFAULT '1234',
  ADD COLUMN IF NOT EXISTS pin_delivery TEXT DEFAULT '1234',
  ADD COLUMN IF NOT EXISTS footer_tagline TEXT,
  ADD COLUMN IF NOT EXISTS footer_hashtags TEXT,
  ADD COLUMN IF NOT EXISTS contact_whatsapp TEXT,
  ADD COLUMN IF NOT EXISTS social_instagram TEXT;
