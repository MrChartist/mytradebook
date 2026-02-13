
-- Trade Templates table
CREATE TABLE public.trade_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  segment TEXT NOT NULL,
  trade_type TEXT NOT NULL DEFAULT 'BUY',
  timeframe TEXT,
  holding_period TEXT,
  default_sl_percent NUMERIC,
  trailing_sl_enabled BOOLEAN DEFAULT false,
  trailing_sl_percent NUMERIC,
  trailing_sl_points NUMERIC,
  auto_track_enabled BOOLEAN DEFAULT false,
  telegram_post_enabled BOOLEAN DEFAULT false,
  tags TEXT[] DEFAULT '{}',
  notes_template TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.trade_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own templates" ON public.trade_templates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own templates" ON public.trade_templates FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own templates" ON public.trade_templates FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own templates" ON public.trade_templates FOR DELETE USING (auth.uid() = user_id);

-- Add dashboard_layout to user_settings for widget customization
ALTER TABLE public.user_settings ADD COLUMN IF NOT EXISTS dashboard_layout JSONB DEFAULT NULL;
