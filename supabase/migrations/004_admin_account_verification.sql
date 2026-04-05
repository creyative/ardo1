-- Add email and verification columns to admins table
ALTER TABLE admins 
  ADD COLUMN IF NOT EXISTS email VARCHAR(255),
  ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;

-- Create verification codes table
CREATE TABLE IF NOT EXISTS admin_verification_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
  code VARCHAR(6) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('email_verification', 'password_reset')),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_verification_admin_id ON admin_verification_codes(admin_id);
CREATE INDEX IF NOT EXISTS idx_verification_code ON admin_verification_codes(code);
