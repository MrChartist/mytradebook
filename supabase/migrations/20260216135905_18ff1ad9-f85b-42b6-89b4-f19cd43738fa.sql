
-- Add configurable check interval per alert (default 5 minutes matching current cron)
ALTER TABLE public.alerts ADD COLUMN IF NOT EXISTS check_interval_minutes integer DEFAULT 5;

-- Add comment for clarity
COMMENT ON COLUMN public.alerts.check_interval_minutes IS 'How often this alert should be checked (in minutes). The evaluate-alerts cron runs every 5 min, so intervals < 5 are treated as 5.';
