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
    {"label": "Panjang Jaket (PJ)", "values": {"S": "64", "M": "68", "L": "72", "XL": "75", "XXL": "78"}},
    {"label": "Lingkar Dada (LD)", "values": {"S": "114", "M": "116", "L": "118", "XL": "120", "XXL": "122"}},
    {"label": "Panjang Tangan (PT)", "values": {"S": "60", "M": "62", "L": "64", "XL": "66", "XXL": "68"}}
  ]'::jsonb
),
(
  'Size Chart Moslem Cloth',
  'Moslem Wear',
  'cm',
  '["13", "13.5", "14", "14.5", "15", "15.5", "16", "16.5", "17"]'::jsonb,
  '[
    {"label": "Panjang Lengan", "values": {"13": "54", "13.5": "55.5", "14": "57.5", "14.5": "58", "15": "59.5", "15.5": "60", "16": "57.5", "16.5": "59.5", "17": "61"}},
    {"label": "Tinggi Badan", "values": {"13": "70.5", "13.5": "72.5", "14": "74", "14.5": "76.5", "15": "77.5", "15.5": "79", "16": "81", "16.5": "82", "17": "78"}},
    {"label": "Lebar Badan", "values": {"13": "27.5", "13.5": "28", "14": "32", "14.5": "32.5", "15": "34", "15.5": "35.5", "16": "37.5", "16.5": "38.5", "17": "39.5"}}
  ]'::jsonb
)
ON CONFLICT DO NOTHING;
