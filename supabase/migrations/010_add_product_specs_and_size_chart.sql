-- Migration 010: Add material_description and size_chart fields to products table
ALTER TABLE products 
  ADD COLUMN IF NOT EXISTS material_description TEXT,
  ADD COLUMN IF NOT EXISTS size_chart_drive_file_id TEXT,
  ADD COLUMN IF NOT EXISTS size_chart_image_url TEXT,
  ADD COLUMN IF NOT EXISTS size_chart_filename TEXT;
