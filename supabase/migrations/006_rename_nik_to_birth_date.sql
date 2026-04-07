-- Rename nik column to birth_date for better privacy
-- Note: birth_date column already exists from initial schema
-- Migrate any data from nik to birth_date if needed
UPDATE participants SET birth_date = CASE WHEN nik ~ '^\d{4}-\d{2}-\d{2}$' THEN nik::date ELSE NULL END WHERE nik IS NOT NULL AND birth_date IS NULL;
-- Drop the nik column
ALTER TABLE participants DROP COLUMN IF EXISTS nik;