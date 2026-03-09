ALTER TABLE public.user_settings
ADD COLUMN IF NOT EXISTS dashboard_focus_mode boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS dashboard_density text DEFAULT 'comfortable';