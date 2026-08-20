-- ============================================================
-- Migration 006: Add favicon_url to event_settings
-- ============================================================

ALTER TABLE event_settings
ADD COLUMN IF NOT EXISTS favicon_url TEXT;
