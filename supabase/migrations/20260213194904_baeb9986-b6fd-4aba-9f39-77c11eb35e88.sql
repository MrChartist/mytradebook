
-- Add V2 alert fields
ALTER TABLE public.alerts ADD COLUMN IF NOT EXISTS cooldown_minutes integer DEFAULT 15;
ALTER TABLE public.alerts ADD COLUMN IF NOT EXISTS active_hours_only boolean DEFAULT true;
ALTER TABLE public.alerts ADD COLUMN IF NOT EXISTS snooze_until timestamp with time zone DEFAULT NULL;
ALTER TABLE public.alerts ADD COLUMN IF NOT EXISTS webhook_enabled boolean DEFAULT false;
ALTER TABLE public.alerts ADD COLUMN IF NOT EXISTS delivery_in_app boolean DEFAULT true;

-- Add webhook settings to user_settings
ALTER TABLE public.user_settings ADD COLUMN IF NOT EXISTS webhook_url text DEFAULT NULL;
ALTER TABLE public.user_settings ADD COLUMN IF NOT EXISTS webhook_secret text DEFAULT NULL;
