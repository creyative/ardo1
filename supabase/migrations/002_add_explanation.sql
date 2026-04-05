-- Add explanation column to questions table
ALTER TABLE questions ADD COLUMN IF NOT EXISTS explanation TEXT;

-- Add primary_color column to company_settings table
ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS primary_color VARCHAR(50) DEFAULT 'blue';

-- Add favicon_url column to company_settings table
ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS favicon_url TEXT;
