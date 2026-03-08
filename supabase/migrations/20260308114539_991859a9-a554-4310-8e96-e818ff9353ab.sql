-- Phase 4: Add last_checked_at column and priority to alerts table
ALTER TABLE public.alerts ADD COLUMN IF NOT EXISTS last_checked_at timestamp with time zone;
ALTER TABLE public.alerts ADD COLUMN IF NOT EXISTS priority text DEFAULT 'normal';
ALTER TABLE public.alerts ADD COLUMN IF NOT EXISTS evaluation_metrics jsonb DEFAULT '{}'::jsonb;

-- Add index for staggered checking
CREATE INDEX IF NOT EXISTS idx_alerts_last_checked ON public.alerts (last_checked_at NULLS FIRST) WHERE active = true;

-- Add notification preferences to user_settings
ALTER TABLE public.user_settings ADD COLUMN IF NOT EXISTS notification_preferences jsonb DEFAULT '{
  "quiet_hours_enabled": false,
  "quiet_hours_start": "15:30",
  "quiet_hours_end": "09:15",
  "dnd_enabled": false,
  "dnd_until": null,
  "digest_enabled": false,
  "importance_threshold": "normal"
}'::jsonb;