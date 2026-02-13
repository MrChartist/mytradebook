-- Add token expiry tracking to user_settings
ALTER TABLE public.user_settings 
ADD COLUMN IF NOT EXISTS dhan_token_expiry timestamp with time zone DEFAULT NULL;