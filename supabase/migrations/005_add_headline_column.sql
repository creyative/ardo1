-- Add headline column to company_settings for customizable landing page headline
ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS headline TEXT DEFAULT 'Assessment digital untuk rekrutmen dan evaluasi karyawan.';
ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS headline_size VARCHAR(20) DEFAULT 'text-4xl';