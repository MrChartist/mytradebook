
-- Add RA Public Mode column to user_settings
ALTER TABLE public.user_settings 
ADD COLUMN IF NOT EXISTS ra_public_mode boolean DEFAULT false;

-- Add RA disclaimer text column
ALTER TABLE public.user_settings 
ADD COLUMN IF NOT EXISTS ra_disclaimer text DEFAULT NULL;
