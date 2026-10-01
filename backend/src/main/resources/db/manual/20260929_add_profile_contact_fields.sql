-- Run this migration once before deploying the profile contact fields.
-- The statements are idempotent for PostgreSQL and preserve existing rows.

ALTER TABLE IF EXISTS attendance_info
    ADD COLUMN IF NOT EXISTS phone VARCHAR(255),
    ADD COLUMN IF NOT EXISTS location VARCHAR(255),
    ADD COLUMN IF NOT EXISTS profession VARCHAR(255),
    ADD COLUMN IF NOT EXISTS linkedin VARCHAR(255),
    ADD COLUMN IF NOT EXISTS portfolio VARCHAR(255),
    ADD COLUMN IF NOT EXISTS github VARCHAR(255);

ALTER TABLE IF EXISTS partner_info
    ADD COLUMN IF NOT EXISTS phone VARCHAR(255),
    ADD COLUMN IF NOT EXISTS location VARCHAR(255),
    ADD COLUMN IF NOT EXISTS profession VARCHAR(255),
    ADD COLUMN IF NOT EXISTS linkedin VARCHAR(255),
    ADD COLUMN IF NOT EXISTS portfolio VARCHAR(255),
    ADD COLUMN IF NOT EXISTS github VARCHAR(255);

