-- Add all missing columns to user_settings
ALTER TABLE public.user_settings
  ADD COLUMN IF NOT EXISTS dhan_verified_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS dhan_enabled BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS dhan_account_name TEXT,
  ADD COLUMN IF NOT EXISTS dhan_token_expiry TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS telegram_verified_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS telegram_enabled BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS telegram_link_code TEXT,
  ADD COLUMN IF NOT EXISTS telegram_link_expires_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS ra_public_mode BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS ra_disclaimer TEXT,
  ADD COLUMN IF NOT EXISTS starting_capital DECIMAL(15,2),
  ADD COLUMN IF NOT EXISTS dashboard_layout JSONB,
  ADD COLUMN IF NOT EXISTS webhook_url TEXT;
