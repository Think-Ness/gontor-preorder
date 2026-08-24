-- Migration 011: Create master size_charts table and link to products
CREATE TABLE IF NOT EXISTS size_charts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category TEXT,
  unit TEXT NOT NULL DEFAULT 'cm',
  sizes JSONB NOT NULL DEFAULT '[]'::jsonb,
  measurements JSONB NOT NULL DEFAULT '[]'::jsonb,
  image_drive_file_id TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Link size_chart_id column to products table
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS size_chart_id UUID REFERENCES size_charts(id) ON DELETE SET NULL;

-- Insert default size chart templates
INSERT INTO size_charts (name, category, unit, sizes, measurements)
VALUES 
(
  'Size Chart Kaos Lengan Pendek',
  'T-Shirt',
  'cm',
  '["XS", "S", "M", "L", "XL", "XXL"]'::jsonb,
  '[
    {"label": "Panjang Lengan", "values": {"XS": "19.5", "S": "20.5", "M": "22", "L": "23", "XL": "24.5", "XXL": "26"}},
    {"label": "Tinggi Badan", "values": {"XS": "64", "S": "66", "M": "68.5", "L": "70", "XL": "74", "XXL": "76"}},
    {"label": "Lebar Badan", "values": {"XS": "41.5", "S": "45.5", "M": "49.5", "L": "52.5", "XL": "57.5", "XXL": "61.5"}}
  ]'::jsonb
),
(
  'Size Chart Kaos Lengan Panjang',
  'T-Shirt Long Sleeve',
  'cm',
  '["XS", "S", "M", "L", "XL", "XXL"]'::jsonb,
  '[
    {"label": "Panjang Lengan", "values": {"XS": "52", "S": "52.5", "M": "54", "L": "55.5", "XL": "59", "XXL": "61"}},
    {"label": "Tinggi Badan", "values": {"XS": "64", "S": "66", "M": "68.5", "L": "70", "XL": "74", "XXL": "76"}},
    {"label": "Lebar Badan", "values": {"XS": "41.5", "S": "45.5", "M": "49.5", "L": "52.5", "XL": "57.5", "XXL": "61.5"}}
  ]'::jsonb
),
(
  'Size Chart Jaket Bomber',
  'Jacket',
  'cm',
  '["S", "M", "L", "XL", "XXL"]'::jsonb,
  '[
    {"label": "Panjang Lengan", "values": {"S": "58", "M": "60", "L": "62", "XL": "64", "XXL": "66"}},
    {"label": "Tinggi Badan", "values": {"S": "66", "M": "68", "L": "70", "XL": "72", "XXL": "74"}},
    {"label": "Lebar Dada", "values": {"S": "52", "M": "55", "L": "58", "XL": "61", "XXL": "64"}}
  ]'::jsonb
)
ON CONFLICT DO NOTHING;
