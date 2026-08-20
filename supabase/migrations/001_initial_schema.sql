-- ============================================================
-- Migration 001: Initial Schema
-- Reunion Kit 100 Tahun Gontor Pre-Order System
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE product_type AS ENUM ('SIMPLE', 'VARIABLE', 'PACKAGE');
CREATE TYPE fulfillment_method AS ENUM ('PICKUP', 'DELIVERY');
CREATE TYPE order_status AS ENUM (
  'DRAFT',
  'PROOF_UPLOADED',
  'PAYMENT_REVIEW',
  'PAID',
  'PROCESSING',
  'READY_FOR_PICKUP',
  'SHIPPED',
  'COMPLETED',
  'REJECTED',
  'CANCELLED'
);
CREATE TYPE payment_status AS ENUM (
  'UNPAID',
  'PROOF_UPLOADED',
  'UNDER_REVIEW',
  'PAID',
  'REJECTED'
);
CREATE TYPE automated_validation_status AS ENUM (
  'AUTO_VALID',
  'NEEDS_REVIEW',
  'AMOUNT_MISMATCH',
  'DATE_MISMATCH',
  'ACCOUNT_MISMATCH',
  'OCR_FAILED',
  'INVALID_FILE'
);
CREATE TYPE admin_role AS ENUM ('super_admin', 'admin', 'finance', 'operator');
CREATE TYPE item_type AS ENUM ('PRODUCT', 'VARIANT', 'PACKAGE');

-- ============================================================
-- EVENT SETTINGS
-- ============================================================

CREATE TABLE event_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_name TEXT NOT NULL DEFAULT 'Reunion Kit 100 Tahun Gontor',
  event_description TEXT,
  preorder_start TIMESTAMPTZ,
  preorder_end TIMESTAMPTZ,
  timezone TEXT NOT NULL DEFAULT 'Asia/Jakarta',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Default event settings
INSERT INTO event_settings (event_name, event_description, preorder_start, preorder_end, timezone, is_active)
VALUES (
  'Reunion Kit 100 Tahun Gontor',
  'Official Merchandise Peringatan 100 Tahun Gontor',
  '2026-08-20 00:00:00+07',
  '2026-09-19 23:59:59+07',
  'Asia/Jakarta',
  true
);

-- ============================================================
-- PAYMENT METHODS
-- ============================================================

CREATE TABLE payment_methods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bank_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  account_holder TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- PRODUCTS
-- ============================================================

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  product_type product_type NOT NULL DEFAULT 'SIMPLE',
  price NUMERIC(12,2) NOT NULL DEFAULT 0,
  image_drive_file_id TEXT,
  image_url TEXT,
  image_filename TEXT,
  has_variants BOOLEAN NOT NULL DEFAULT false,
  stock_enabled BOOLEAN NOT NULL DEFAULT false,
  stock INTEGER,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- PRODUCT VARIANTS
-- ============================================================

CREATE TABLE product_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  sku TEXT,
  name TEXT NOT NULL,
  price NUMERIC(12,2) NOT NULL DEFAULT 0,
  stock INTEGER,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- PACKAGES
-- ============================================================

CREATE TABLE packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  package_code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(12,2) NOT NULL DEFAULT 0,
  image_drive_file_id TEXT,
  image_url TEXT,
  image_filename TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- PACKAGE ITEMS
-- ============================================================

CREATE TABLE package_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  package_id UUID NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  variant_id UUID REFERENCES product_variants(id),
  quantity INTEGER NOT NULL DEFAULT 1
);

-- ============================================================
-- ADMIN PROFILES
-- ============================================================

CREATE TABLE admin_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role admin_role NOT NULL DEFAULT 'operator',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ORDERS
-- ============================================================

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT UNIQUE NOT NULL,
  checkout_session_id UUID UNIQUE NOT NULL,

  -- Customer
  stambuk TEXT NOT NULL,
  full_name TEXT NOT NULL,
  district TEXT NOT NULL,
  generation_year INTEGER NOT NULL,
  whatsapp TEXT NOT NULL,

  -- Fulfillment
  fulfillment_method fulfillment_method NOT NULL,

  -- Shipping address (for DELIVERY)
  shipping_address TEXT,
  shipping_village TEXT,
  shipping_district TEXT,
  shipping_city TEXT,
  shipping_province TEXT,
  shipping_postal_code TEXT,

  -- Amounts
  subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
  shipping_cost NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,

  -- Status
  payment_status payment_status NOT NULL DEFAULT 'UNPAID',
  order_status order_status NOT NULL DEFAULT 'DRAFT',

  -- Payment proof
  payment_proof_file_id TEXT,
  payment_proof_url TEXT,
  payment_proof_filename TEXT,
  payment_proof_mime_type TEXT,
  payment_proof_size BIGINT,
  payment_proof_uploaded_at TIMESTAMPTZ,

  -- OCR results (for future use, now manual only)
  detected_payment_date DATE,
  detected_payment_amount NUMERIC(12,2),
  detected_recipient_name TEXT,
  detected_recipient_account TEXT,
  ocr_confidence NUMERIC(5,2),
  automated_validation_status automated_validation_status,

  -- Admin
  admin_note TEXT,
  validated_by UUID REFERENCES admin_profiles(id),
  validated_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ORDER ITEMS
-- ============================================================

CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,

  product_id UUID REFERENCES products(id),
  variant_id UUID REFERENCES product_variants(id),
  package_id UUID REFERENCES packages(id),

  item_type item_type NOT NULL,

  -- Snapshots (immutable after order creation)
  item_name_snapshot TEXT NOT NULL,
  variant_name_snapshot TEXT,
  unit_price_snapshot NUMERIC(12,2) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  subtotal NUMERIC(12,2) NOT NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- AUDIT LOGS
-- ============================================================

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID REFERENCES admin_profiles(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  old_data JSONB,
  new_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
