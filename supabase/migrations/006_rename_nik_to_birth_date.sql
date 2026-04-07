-- Rename nik column to birth_date for better privacy
ALTER TABLE participants ADD COLUMN IF NOT EXISTS birth_date DATE;
UPDATE participants SET birth_date = CASE WHEN nik ~ '^\d{4}-\d{2}-\d{2}$' THEN nik::date ELSE NULL END WHERE nik IS NOT NULL;
ALTER TABLE participants DROP COLUMN IF EXISTS nik;