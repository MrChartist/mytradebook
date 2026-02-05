-- Add per-user Telegram integration columns
ALTER TABLE public.user_settings
ADD COLUMN IF NOT EXISTS telegram_link_code VARCHAR(12),
ADD COLUMN IF NOT EXISTS telegram_link_expires_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS telegram_verified_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS telegram_enabled BOOLEAN DEFAULT true;

-- Add per-user Dhan integration columns
ALTER TABLE public.user_settings
ADD COLUMN IF NOT EXISTS dhan_access_token TEXT,
ADD COLUMN IF NOT EXISTS dhan_verified_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS dhan_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS dhan_account_name VARCHAR(100);

-- Clean up garbage data from instrument_master (fake security IDs and ISINs as instrument_type)
DELETE FROM public.instrument_master 
WHERE security_id LIKE 'NSE_EQ_%' 
   OR security_id LIKE 'NSE_FNO_%'
   OR instrument_type LIKE 'IN%';