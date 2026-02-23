
-- Add TrueData columns to user_settings
ALTER TABLE public.user_settings
  ADD COLUMN IF NOT EXISTS truedata_username text,
  ADD COLUMN IF NOT EXISTS truedata_password text,
  ADD COLUMN IF NOT EXISTS truedata_enabled boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS truedata_verified_at timestamp with time zone;
