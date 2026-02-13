
-- Add API Key and Secret columns for Dhan OAuth flow
ALTER TABLE public.user_settings
ADD COLUMN IF NOT EXISTS dhan_api_key text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS dhan_api_secret text DEFAULT NULL;
