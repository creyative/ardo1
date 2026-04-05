-- Add company_settings columns for admin theme and favicon
ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS primary_color VARCHAR(50) DEFAULT 'blue';
ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS favicon_url TEXT;
