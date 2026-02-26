-- =============================================
-- ENUMS
-- =============================================
CREATE TYPE public.app_role AS ENUM ('admin', 'client');
CREATE TYPE public.study_category AS ENUM ('Technical', 'Fundamental', 'News', 'Sentiment', 'Other');
CREATE TYPE public.alert_condition AS ENUM ('PRICE_GT', 'PRICE_LT', 'PERCENT_CHANGE_GT', 'PERCENT_CHANGE_LT', 'VOLUME_SPIKE', 'CUSTOM');
CREATE TYPE public.alert_recurrence AS ENUM ('ONCE', 'DAILY', 'CONTINUOUS');
CREATE TYPE public.market_segment AS ENUM ('Equity_Intraday', 'Equity_Positional', 'Futures', 'Options', 'Commodities');
CREATE TYPE public.trade_type AS ENUM ('BUY', 'SELL');
CREATE TYPE public.trade_status AS ENUM ('PENDING', 'OPEN', 'CLOSED', 'CANCELLED');
CREATE TYPE public.trade_event_type AS ENUM ('ENTRY', 'SL_HIT', 'TARGET1_HIT', 'TARGET2_HIT', 'TARGET3_HIT', 'PARTIAL_EXIT', 'SL_MODIFIED', 'TARGET_MODIFIED', 'CLOSED');

-- =============================================
-- PROFILES TABLE (linked to auth.users)
-- =============================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(100),
  email VARCHAR(255),
  phone VARCHAR(15),
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- =============================================
-- USER ROLES TABLE (separate for security)
-- =============================================
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL DEFAULT 'client',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- USER SETTINGS TABLE
-- =============================================
CREATE TABLE public.user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  default_sl_percent DECIMAL(5,2) DEFAULT 2.00,
  telegram_chat_id VARCHAR(100),
  alert_frequency_minutes INT DEFAULT 5,
  auto_sync_portfolio BOOLEAN DEFAULT true,
  theme VARCHAR(20) DEFAULT 'dark',
  timezone VARCHAR(50) DEFAULT 'Asia/Kolkata',
  dhan_client_id VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own settings"
  ON public.user_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
  ON public.user_settings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings"
  ON public.user_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- =============================================
-- STUDIES TABLE
-- =============================================
CREATE TABLE public.studies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  symbol VARCHAR(20) NOT NULL,
  category public.study_category DEFAULT 'Technical',
  notes TEXT,
  attachments JSONB DEFAULT '[]'::jsonb,
  tags TEXT[] DEFAULT '{}',
  analysis_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.studies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own studies"
  ON public.studies FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own studies"
  ON public.studies FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own studies"
  ON public.studies FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own studies"
  ON public.studies FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX idx_studies_user ON public.studies(user_id);
CREATE INDEX idx_studies_symbol ON public.studies(symbol);
CREATE INDEX idx_studies_date ON public.studies(analysis_date);

-- =============================================
-- ALERTS TABLE
-- =============================================
CREATE TABLE public.alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  symbol VARCHAR(20) NOT NULL,
  condition_type public.alert_condition NOT NULL,
  threshold DECIMAL(10,2),
  parameters JSONB,
  recurrence public.alert_recurrence DEFAULT 'ONCE',
  active BOOLEAN DEFAULT true,
  last_triggered TIMESTAMP WITH TIME ZONE,
  trigger_count INT DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own alerts"
  ON public.alerts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own alerts"
  ON public.alerts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own alerts"
  ON public.alerts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own alerts"
  ON public.alerts FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX idx_alerts_user ON public.alerts(user_id);
CREATE INDEX idx_alerts_active ON public.alerts(active) WHERE active = true;
CREATE INDEX idx_alerts_symbol ON public.alerts(symbol);

-- =============================================
-- TRADES TABLE
-- =============================================
CREATE TABLE public.trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  study_id UUID REFERENCES public.studies(id) ON DELETE SET NULL,
  dhan_order_id VARCHAR(100),
  symbol VARCHAR(20) NOT NULL,
  segment public.market_segment NOT NULL,
  trade_type public.trade_type NOT NULL,
  quantity INT NOT NULL CHECK (quantity > 0),
  entry_price DECIMAL(12,2) NOT NULL,
  entry_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  stop_loss DECIMAL(12,2),
  targets JSONB DEFAULT '[]'::jsonb,
  current_price DECIMAL(12,2),
  status public.trade_status DEFAULT 'PENDING',
  rating INT CHECK (rating >= 1 AND rating <= 10),
  confidence_score INT CHECK (confidence_score >= 1 AND confidence_score <= 5),
  pnl DECIMAL(12,2) DEFAULT 0,
  pnl_percent DECIMAL(8,2) DEFAULT 0,
  closed_at TIMESTAMP WITH TIME ZONE,
  closure_reason VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own trades"
  ON public.trades FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own trades"
  ON public.trades FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own trades"
  ON public.trades FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own trades"
  ON public.trades FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX idx_trades_user ON public.trades(user_id);
CREATE INDEX idx_trades_status ON public.trades(status);
CREATE INDEX idx_trades_symbol ON public.trades(symbol);
CREATE INDEX idx_trades_entry_time ON public.trades(entry_time);

-- =============================================
-- TRADE EVENTS TABLE
-- =============================================
CREATE TABLE public.trade_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trade_id UUID NOT NULL REFERENCES public.trades(id) ON DELETE CASCADE,
  event_type public.trade_event_type NOT NULL,
  price DECIMAL(12,2) NOT NULL,
  quantity INT,
  pnl_realized DECIMAL(12,2),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.trade_events ENABLE ROW LEVEL SECURITY;

-- Users can view trade events for their own trades
CREATE POLICY "Users can view own trade events"
  ON public.trade_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.trades
      WHERE trades.id = trade_events.trade_id
        AND trades.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own trade events"
  ON public.trade_events FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.trades
      WHERE trades.id = trade_events.trade_id
        AND trades.user_id = auth.uid()
    )
  );

CREATE INDEX idx_trade_events_trade ON public.trade_events(trade_id);

-- =============================================
-- JOURNAL TAGGING TABLES
-- =============================================
CREATE TABLE public.pattern_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  category VARCHAR(50)
);

CREATE TABLE public.mistake_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) UNIQUE NOT NULL,
  severity VARCHAR(20)
);

-- Many-to-many: trades to patterns
CREATE TABLE public.trade_patterns (
  trade_id UUID REFERENCES public.trades(id) ON DELETE CASCADE,
  pattern_id UUID REFERENCES public.pattern_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (trade_id, pattern_id)
);

-- Many-to-many: trades to mistakes
CREATE TABLE public.trade_mistakes (
  trade_id UUID REFERENCES public.trades(id) ON DELETE CASCADE,
  mistake_id UUID REFERENCES public.mistake_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (trade_id, mistake_id)
);

-- RLS for tag tables (read-only for authenticated users)
ALTER TABLE public.pattern_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mistake_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trade_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trade_mistakes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view pattern tags"
  ON public.pattern_tags FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can view mistake tags"
  ON public.mistake_tags FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can view own trade patterns"
  ON public.trade_patterns FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.trades
      WHERE trades.id = trade_patterns.trade_id
        AND trades.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage own trade patterns"
  ON public.trade_patterns FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.trades
      WHERE trades.id = trade_patterns.trade_id
        AND trades.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view own trade mistakes"
  ON public.trade_mistakes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.trades
      WHERE trades.id = trade_mistakes.trade_id
        AND trades.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage own trade mistakes"
  ON public.trade_mistakes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.trades
      WHERE trades.id = trade_mistakes.trade_id
        AND trades.user_id = auth.uid()
    )
  );

-- =============================================
-- WEEKLY REPORTS TABLE
-- =============================================
CREATE TABLE public.weekly_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  segment public.market_segment NOT NULL,
  total_trades INT DEFAULT 0,
  winning_trades INT DEFAULT 0,
  losing_trades INT DEFAULT 0,
  total_pnl DECIMAL(12,2) DEFAULT 0,
  win_rate DECIMAL(5,2),
  avg_gain DECIMAL(12,2),
  avg_loss DECIMAL(12,2),
  best_trade_pnl DECIMAL(12,2),
  worst_trade_pnl DECIMAL(12,2),
  common_mistakes JSONB,
  top_setups JSONB,
  data JSONB,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, week_start, segment)
);

ALTER TABLE public.weekly_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reports"
  ON public.weekly_reports FOR SELECT
  USING (auth.uid() = user_id);

CREATE INDEX idx_weekly_reports_user ON public.weekly_reports(user_id);
CREATE INDEX idx_weekly_reports_week ON public.weekly_reports(week_start);

-- =============================================
-- TRIGGER: Auto-create profile on signup
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (user_id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  );
  
  -- Create default settings
  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.id);
  
  -- Assign default role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'client');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- TRIGGER: Update updated_at timestamps
-- =============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_studies_updated_at
  BEFORE UPDATE ON public.studies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_trades_updated_at
  BEFORE UPDATE ON public.trades
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- SEED DATA: Common pattern and mistake tags
-- =============================================
INSERT INTO public.pattern_tags (name, description, category) VALUES
  ('Double Bottom', 'Bullish reversal pattern', 'Reversal'),
  ('Double Top', 'Bearish reversal pattern', 'Reversal'),
  ('Head and Shoulders', 'Bearish reversal pattern', 'Reversal'),
  ('Inverse Head and Shoulders', 'Bullish reversal pattern', 'Reversal'),
  ('Bull Flag', 'Bullish continuation pattern', 'Continuation'),
  ('Bear Flag', 'Bearish continuation pattern', 'Continuation'),
  ('Triangle Breakout', 'Breakout pattern', 'Breakout'),
  ('Channel Breakout', 'Breakout pattern', 'Breakout'),
  ('Support Bounce', 'Price bouncing off support', 'Support/Resistance'),
  ('Resistance Rejection', 'Price rejected at resistance', 'Support/Resistance');

INSERT INTO public.mistake_tags (name, severity) VALUES
  ('Entered Too Early', 'Medium'),
  ('No Stop Loss', 'High'),
  ('Moved Stop Loss', 'High'),
  ('Over-leveraged', 'High'),
  ('FOMO Entry', 'Medium'),
  ('Revenge Trading', 'High'),
  ('Ignored Plan', 'Medium'),
  ('Exited Too Early', 'Low'),
  ('Held Too Long', 'Medium'),
  ('Wrong Position Size', 'Medium');
-- Fix search_path for update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;
-- Create missing candlestick_tags and volume_tags tables
CREATE TABLE public.candlestick_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  bullish BOOLEAN
);

CREATE TABLE public.volume_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT
);

-- Enable RLS
ALTER TABLE public.candlestick_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.volume_tags ENABLE ROW LEVEL SECURITY;

-- Public read access for authenticated users
CREATE POLICY "Authenticated users can view candlestick tags"
  ON public.candlestick_tags FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can view volume tags"
  ON public.volume_tags FOR SELECT
  TO authenticated
  USING (true);

-- Many-to-many for trades to candlesticks
CREATE TABLE public.trade_candlesticks (
  trade_id UUID REFERENCES public.trades(id) ON DELETE CASCADE,
  candlestick_id UUID REFERENCES public.candlestick_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (trade_id, candlestick_id)
);

-- Many-to-many for trades to volume
CREATE TABLE public.trade_volume (
  trade_id UUID REFERENCES public.trades(id) ON DELETE CASCADE,
  volume_id UUID REFERENCES public.volume_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (trade_id, volume_id)
);

ALTER TABLE public.trade_candlesticks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trade_volume ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own trade candlesticks"
  ON public.trade_candlesticks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.trades
      WHERE trades.id = trade_candlesticks.trade_id
        AND trades.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage own trade candlesticks"
  ON public.trade_candlesticks FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.trades
      WHERE trades.id = trade_candlesticks.trade_id
        AND trades.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view own trade volume"
  ON public.trade_volume FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.trades
      WHERE trades.id = trade_volume.trade_id
        AND trades.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage own trade volume"
  ON public.trade_volume FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.trades
      WHERE trades.id = trade_volume.trade_id
        AND trades.user_id = auth.uid()
    )
  );
-- Create storage bucket for trade chart images
INSERT INTO storage.buckets (id, name, public)
VALUES ('trade-charts', 'trade-charts', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for study attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('study-attachments', 'study-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for trade-charts bucket
CREATE POLICY "Users can view trade chart images"
ON storage.objects FOR SELECT
USING (bucket_id = 'trade-charts');

CREATE POLICY "Authenticated users can upload trade charts"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'trade-charts' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update own trade charts"
ON storage.objects FOR UPDATE
USING (bucket_id = 'trade-charts' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own trade charts"
ON storage.objects FOR DELETE
USING (bucket_id = 'trade-charts' AND auth.uid()::text = (storage.foldername(name))[1]);

-- RLS policies for study-attachments bucket
CREATE POLICY "Users can view study attachments"
ON storage.objects FOR SELECT
USING (bucket_id = 'study-attachments');

CREATE POLICY "Authenticated users can upload study attachments"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'study-attachments' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update own study attachments"
ON storage.objects FOR UPDATE
USING (bucket_id = 'study-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own study attachments"
ON storage.objects FOR DELETE
USING (bucket_id = 'study-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Add chart_images column to trades table for storing image URLs
ALTER TABLE trades ADD COLUMN IF NOT EXISTS chart_images jsonb DEFAULT '[]'::jsonb;
-- Add trailing stop loss and research trade columns to trades table
ALTER TABLE public.trades
ADD COLUMN IF NOT EXISTS trailing_sl_enabled boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS trailing_sl_percent numeric,
ADD COLUMN IF NOT EXISTS trailing_sl_points numeric,
ADD COLUMN IF NOT EXISTS trailing_sl_current numeric,
ADD COLUMN IF NOT EXISTS trailing_sl_trigger_price numeric,
ADD COLUMN IF NOT EXISTS trailing_sl_active boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS timeframe varchar(20),
ADD COLUMN IF NOT EXISTS holding_period varchar(50);

-- Add TSL_UPDATED and TSL_HIT to trade_event_type enum
ALTER TYPE public.trade_event_type ADD VALUE IF NOT EXISTS 'TSL_UPDATED';
ALTER TYPE public.trade_event_type ADD VALUE IF NOT EXISTS 'TSL_HIT';
-- Add new fields for auto tracking and telegram posting
ALTER TABLE public.trades
ADD COLUMN IF NOT EXISTS auto_track_enabled boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS telegram_post_enabled boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS instrument_token varchar(50),
ADD COLUMN IF NOT EXISTS contract_key varchar(100);

-- Add index for faster lookups of trades that need auto tracking
CREATE INDEX IF NOT EXISTS idx_trades_auto_track ON public.trades(auto_track_enabled, status) WHERE auto_track_enabled = true;
-- Add new columns to alerts table for enhanced alert creation
ALTER TABLE public.alerts 
ADD COLUMN IF NOT EXISTS notes text,
ADD COLUMN IF NOT EXISTS telegram_enabled boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS instrument_id character varying,
ADD COLUMN IF NOT EXISTS exchange character varying DEFAULT 'NSE';

-- Add comment for documentation
COMMENT ON COLUMN public.alerts.notes IS 'User notes/reason for the alert';
COMMENT ON COLUMN public.alerts.telegram_enabled IS 'Whether to send Telegram notification when alert triggers';
COMMENT ON COLUMN public.alerts.instrument_id IS 'Unique instrument identifier from instrument master';
COMMENT ON COLUMN public.alerts.exchange IS 'Exchange: NSE, NFO, MCX';
-- Create instrument_master table for storing Dhan scrip master data
CREATE TABLE IF NOT EXISTS public.instrument_master (
  security_id TEXT PRIMARY KEY,
  exchange_segment TEXT NOT NULL,
  exchange TEXT NOT NULL,
  instrument_type TEXT NOT NULL,
  trading_symbol TEXT NOT NULL,
  display_name TEXT,
  underlying_symbol TEXT,
  expiry DATE,
  strike NUMERIC,
  option_type TEXT,
  lot_size INTEGER,
  tick_size NUMERIC,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for fast searching
CREATE INDEX IF NOT EXISTS idx_instrument_master_trading_symbol 
ON public.instrument_master USING btree (trading_symbol);

CREATE INDEX IF NOT EXISTS idx_instrument_master_display_name 
ON public.instrument_master USING btree (display_name);

CREATE INDEX IF NOT EXISTS idx_instrument_master_exchange 
ON public.instrument_master USING btree (exchange);

CREATE INDEX IF NOT EXISTS idx_instrument_master_instrument_type 
ON public.instrument_master USING btree (instrument_type);

-- Composite index for derivatives lookup
CREATE INDEX IF NOT EXISTS idx_instrument_master_derivatives 
ON public.instrument_master (underlying_symbol, expiry, instrument_type);

CREATE INDEX IF NOT EXISTS idx_instrument_master_options 
ON public.instrument_master (underlying_symbol, expiry, strike, option_type);

-- Enable RLS
ALTER TABLE public.instrument_master ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to SELECT (read-only)
CREATE POLICY "Authenticated users can view instruments"
ON public.instrument_master
FOR SELECT
TO authenticated
USING (true);

-- Create instrument_sync_log table for tracking sync operations
CREATE TABLE IF NOT EXISTS public.instrument_sync_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'running',
  total_rows INTEGER,
  inserted_rows INTEGER,
  updated_rows INTEGER,
  error_message TEXT,
  sync_type TEXT DEFAULT 'manual'
);

-- Enable RLS on sync log
ALTER TABLE public.instrument_sync_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view sync logs
CREATE POLICY "Admins can view sync logs"
ON public.instrument_sync_log
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Alter trades table to make entry_price nullable for PENDING drafts
ALTER TABLE public.trades 
ALTER COLUMN entry_price DROP NOT NULL;

-- Add security_id and exchange_segment columns to trades if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'trades' 
                 AND column_name = 'security_id') THEN
    ALTER TABLE public.trades ADD COLUMN security_id TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'trades' 
                 AND column_name = 'exchange_segment') THEN
    ALTER TABLE public.trades ADD COLUMN exchange_segment TEXT;
  END IF;
END $$;

-- Add security_id and exchange_segment columns to alerts if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'alerts' 
                 AND column_name = 'security_id') THEN
    ALTER TABLE public.alerts ADD COLUMN security_id TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'alerts' 
                 AND column_name = 'exchange_segment') THEN
    ALTER TABLE public.alerts ADD COLUMN exchange_segment TEXT;
  END IF;
END $$;
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

-- Add RA Public Mode column to user_settings
ALTER TABLE public.user_settings 
ADD COLUMN IF NOT EXISTS ra_public_mode boolean DEFAULT false;

-- Add RA disclaimer text column
ALTER TABLE public.user_settings 
ADD COLUMN IF NOT EXISTS ra_disclaimer text DEFAULT NULL;


-- Add new fields to studies table for enhanced study tracking
ALTER TABLE public.studies ADD COLUMN IF NOT EXISTS status text DEFAULT 'Draft';
ALTER TABLE public.studies ADD COLUMN IF NOT EXISTS pattern_duration text DEFAULT NULL;
ALTER TABLE public.studies ADD COLUMN IF NOT EXISTS pattern_start_date date DEFAULT NULL;
ALTER TABLE public.studies ADD COLUMN IF NOT EXISTS pattern_end_date date DEFAULT NULL;
ALTER TABLE public.studies ADD COLUMN IF NOT EXISTS links jsonb DEFAULT '[]'::jsonb;

-- Create study_categories table for custom pattern duration categories
CREATE TABLE IF NOT EXISTS public.study_duration_categories (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  name text NOT NULL,
  is_system boolean DEFAULT false,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.study_duration_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own categories" ON public.study_duration_categories
  FOR SELECT USING (auth.uid() = user_id OR is_system = true);

CREATE POLICY "Users can insert own categories" ON public.study_duration_categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own categories" ON public.study_duration_categories
  FOR DELETE USING (auth.uid() = user_id AND is_system = false);


-- Add V2 alert fields
ALTER TABLE public.alerts ADD COLUMN IF NOT EXISTS cooldown_minutes integer DEFAULT 15;
ALTER TABLE public.alerts ADD COLUMN IF NOT EXISTS active_hours_only boolean DEFAULT true;
ALTER TABLE public.alerts ADD COLUMN IF NOT EXISTS snooze_until timestamp with time zone DEFAULT NULL;
ALTER TABLE public.alerts ADD COLUMN IF NOT EXISTS webhook_enabled boolean DEFAULT false;
ALTER TABLE public.alerts ADD COLUMN IF NOT EXISTS delivery_in_app boolean DEFAULT true;

-- Add webhook settings to user_settings
ALTER TABLE public.user_settings ADD COLUMN IF NOT EXISTS webhook_url text DEFAULT NULL;
ALTER TABLE public.user_settings ADD COLUMN IF NOT EXISTS webhook_secret text DEFAULT NULL;


-- Watchlists table
CREATE TABLE IF NOT EXISTS public.watchlists (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  color text DEFAULT '#6366f1',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.watchlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own watchlists" ON public.watchlists FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own watchlists" ON public.watchlists FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own watchlists" ON public.watchlists FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own watchlists" ON public.watchlists FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_watchlists_updated_at BEFORE UPDATE ON public.watchlists
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Watchlist items table
CREATE TABLE IF NOT EXISTS public.watchlist_items (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  watchlist_id uuid NOT NULL REFERENCES public.watchlists(id) ON DELETE CASCADE,
  symbol text NOT NULL,
  exchange text DEFAULT 'NSE',
  security_id text,
  exchange_segment text,
  notes text,
  sort_order integer DEFAULT 0,
  added_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.watchlist_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own watchlist items" ON public.watchlist_items FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.watchlists WHERE id = watchlist_items.watchlist_id AND user_id = auth.uid()));
CREATE POLICY "Users can insert own watchlist items" ON public.watchlist_items FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.watchlists WHERE id = watchlist_items.watchlist_id AND user_id = auth.uid()));
CREATE POLICY "Users can update own watchlist items" ON public.watchlist_items FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.watchlists WHERE id = watchlist_items.watchlist_id AND user_id = auth.uid()));
CREATE POLICY "Users can delete own watchlist items" ON public.watchlist_items FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.watchlists WHERE id = watchlist_items.watchlist_id AND user_id = auth.uid()));

-- Scanner definitions table (predefined scanners)
CREATE TABLE IF NOT EXISTS public.scanner_definitions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  scan_type text NOT NULL DEFAULT 'custom',
  conditions jsonb NOT NULL DEFAULT '[]'::jsonb,
  exchange text DEFAULT 'NSE',
  is_system boolean DEFAULT false,
  last_run_at timestamp with time zone,
  last_result_count integer DEFAULT 0,
  active boolean DEFAULT true,
  run_interval_minutes integer DEFAULT 15,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.scanner_definitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own scanners" ON public.scanner_definitions FOR SELECT USING (auth.uid() = user_id OR is_system = true);
CREATE POLICY "Users can insert own scanners" ON public.scanner_definitions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own scanners" ON public.scanner_definitions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own scanners" ON public.scanner_definitions FOR DELETE USING (auth.uid() = user_id AND is_system = false);

CREATE TRIGGER update_scanners_updated_at BEFORE UPDATE ON public.scanner_definitions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Scanner results (symbols matched by a scanner run)
CREATE TABLE IF NOT EXISTS public.scanner_results (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  scanner_id uuid NOT NULL REFERENCES public.scanner_definitions(id) ON DELETE CASCADE,
  symbol text NOT NULL,
  exchange text DEFAULT 'NSE',
  security_id text,
  metadata jsonb,
  matched_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.scanner_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own scanner results" ON public.scanner_results FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.scanner_definitions WHERE id = scanner_results.scanner_id AND (user_id = auth.uid() OR is_system = true)));

-- Add previous_ltp to alerts for cross detection
ALTER TABLE public.alerts ADD COLUMN IF NOT EXISTS previous_ltp numeric DEFAULT NULL;

-- Add alert_condition enum values for cross detection
ALTER TYPE public.alert_condition ADD VALUE IF NOT EXISTS 'PRICE_CROSS_ABOVE';
ALTER TYPE public.alert_condition ADD VALUE IF NOT EXISTS 'PRICE_CROSS_BELOW';

-- Add scope fields to alerts for watchlist/scanner linking
ALTER TABLE public.alerts ADD COLUMN IF NOT EXISTS scope text DEFAULT 'single';
ALTER TABLE public.alerts ADD COLUMN IF NOT EXISTS watchlist_id uuid REFERENCES public.watchlists(id) ON DELETE SET NULL;
ALTER TABLE public.alerts ADD COLUMN IF NOT EXISTS scanner_id uuid REFERENCES public.scanner_definitions(id) ON DELETE SET NULL;
ALTER TABLE public.alerts ADD COLUMN IF NOT EXISTS batch_id uuid DEFAULT NULL;


-- Add starting_capital to user_settings
ALTER TABLE public.user_settings
ADD COLUMN IF NOT EXISTS starting_capital numeric DEFAULT 500000;

-- Create strategy_trades table for multi-leg options strategies
CREATE TABLE public.strategy_trades (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  name text NOT NULL,
  strategy_type text NOT NULL DEFAULT 'custom',
  segment text NOT NULL DEFAULT 'Options',
  symbol text NOT NULL,
  status text NOT NULL DEFAULT 'OPEN',
  combined_pnl numeric DEFAULT 0,
  combined_pnl_percent numeric DEFAULT 0,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  closed_at timestamp with time zone
);

ALTER TABLE public.strategy_trades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own strategies" ON public.strategy_trades FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own strategies" ON public.strategy_trades FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own strategies" ON public.strategy_trades FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own strategies" ON public.strategy_trades FOR DELETE USING (auth.uid() = user_id);

-- Add strategy_id to trades for linking legs
ALTER TABLE public.trades
ADD COLUMN IF NOT EXISTS strategy_id uuid REFERENCES public.strategy_trades(id) ON DELETE SET NULL;

-- Add trade review fields to trades
ALTER TABLE public.trades
ADD COLUMN IF NOT EXISTS review_rating integer,
ADD COLUMN IF NOT EXISTS review_what_worked text,
ADD COLUMN IF NOT EXISTS review_what_failed text,
ADD COLUMN IF NOT EXISTS review_rules_followed boolean,
ADD COLUMN IF NOT EXISTS review_execution_quality integer,
ADD COLUMN IF NOT EXISTS reviewed_at timestamp with time zone;

-- Add linked study/alert references
ALTER TABLE public.trades
ADD COLUMN IF NOT EXISTS created_from_alert_id uuid REFERENCES public.alerts(id) ON DELETE SET NULL;

-- alerts linked to studies
ALTER TABLE public.alerts
ADD COLUMN IF NOT EXISTS linked_study_id uuid REFERENCES public.studies(id) ON DELETE SET NULL;

-- Trigger for strategy updated_at
CREATE TRIGGER update_strategy_trades_updated_at
BEFORE UPDATE ON public.strategy_trades
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();


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


-- Alert chains: store child alert definitions to create when parent triggers
ALTER TABLE public.alerts ADD COLUMN IF NOT EXISTS chain_children JSONB DEFAULT NULL;
-- chain_children format: [{ "symbol": "BANKNIFTY", "condition_type": "PRICE_GT", "threshold": 48000, "recurrence": "ONCE", "notes": "Chained from NIFTY alert", "telegram_enabled": true }]


-- Trading rules checklist
CREATE TABLE public.trading_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  rule_text TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.trading_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own rules" ON public.trading_rules FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own rules" ON public.trading_rules FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own rules" ON public.trading_rules FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own rules" ON public.trading_rules FOR DELETE USING (auth.uid() = user_id);


-- Table for multiple Telegram chat destinations per user with segment routing
CREATE TABLE public.telegram_chats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  chat_id TEXT NOT NULL,
  label TEXT NOT NULL DEFAULT '',
  segments TEXT[] NOT NULL DEFAULT ARRAY['Equity_Intraday','Equity_Positional','Futures','Options','Commodities'],
  bot_token TEXT, -- NULL = use default bot token from env
  bot_username TEXT,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.telegram_chats ENABLE ROW LEVEL SECURITY;

-- Users can only manage their own chat destinations
CREATE POLICY "Users can view their own telegram chats"
  ON public.telegram_chats FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own telegram chats"
  ON public.telegram_chats FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own telegram chats"
  ON public.telegram_chats FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own telegram chats"
  ON public.telegram_chats FOR DELETE USING (auth.uid() = user_id);

-- Index for fast lookups
CREATE INDEX idx_telegram_chats_user_id ON public.telegram_chats(user_id);

-- Allow service role full access for edge functions
CREATE POLICY "Service role can manage all telegram chats"
  ON public.telegram_chats FOR ALL USING (true) WITH CHECK (true);


DROP POLICY "Service role can manage all telegram chats" ON public.telegram_chats;


-- Add chart_link column to trades table
ALTER TABLE public.trades ADD COLUMN chart_link text;

-- Add chart_link column to alerts table  
ALTER TABLE public.alerts ADD COLUMN chart_link text;

-- Add token expiry tracking to user_settings
ALTER TABLE public.user_settings 
ADD COLUMN IF NOT EXISTS dhan_token_expiry timestamp with time zone DEFAULT NULL;

-- Add API Key and Secret columns for Dhan OAuth flow
ALTER TABLE public.user_settings
ADD COLUMN IF NOT EXISTS dhan_api_key text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS dhan_api_secret text DEFAULT NULL;

ALTER TABLE public.trades ALTER COLUMN symbol TYPE text;
-- ============================================
-- Performance Optimization: Add Missing Indexes
-- Created: 2026-02-16
-- Purpose: Add foreign key indexes and composite indexes for common queries
-- ============================================

-- ============================================
-- 1. FOREIGN KEY INDEXES (Critical for JOIN performance)
-- ============================================

-- trades table foreign keys
CREATE INDEX IF NOT EXISTS idx_trades_strategy_id ON public.trades(strategy_id) WHERE strategy_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_trades_study_id ON public.trades(study_id) WHERE study_id IS NOT NULL;

-- alerts table foreign keys
CREATE INDEX IF NOT EXISTS idx_alerts_linked_study_id ON public.alerts(linked_study_id) WHERE linked_study_id IS NOT NULL;

-- trade_patterns junction table
CREATE INDEX IF NOT EXISTS idx_trade_patterns_pattern_id ON public.trade_patterns(pattern_id);
CREATE INDEX IF NOT EXISTS idx_trade_patterns_trade_id ON public.trade_patterns(trade_id);

-- trade_mistakes junction table
CREATE INDEX IF NOT EXISTS idx_trade_mistakes_mistake_id ON public.trade_mistakes(mistake_id);
CREATE INDEX IF NOT EXISTS idx_trade_mistakes_trade_id ON public.trade_mistakes(trade_id);

-- strategy_trades foreign keys (if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'strategy_trades') THEN
    CREATE INDEX IF NOT EXISTS idx_strategy_trades_user_id ON public.strategy_trades(user_id);
  END IF;
END $$;

-- watchlist_items foreign keys
CREATE INDEX IF NOT EXISTS idx_watchlist_items_watchlist_id ON public.watchlist_items(watchlist_id);

-- trade_events foreign key
CREATE INDEX IF NOT EXISTS idx_trade_events_trade_id ON public.trade_events(trade_id);

-- telegram_chats foreign key
CREATE INDEX IF NOT EXISTS idx_telegram_chats_user_id ON public.telegram_chats(user_id);

-- ============================================
-- 2. COMPOSITE INDEXES (Common query patterns)
-- ============================================

-- Dashboard queries: Get user's trades by status and date
CREATE INDEX IF NOT EXISTS idx_trades_user_status_date ON public.trades(user_id, status, entry_time DESC);

-- Open trades query (frequently filtered)
CREATE INDEX IF NOT EXISTS idx_trades_open ON public.trades(user_id, entry_time DESC) WHERE status = 'OPEN';

-- Closed trades for analytics
CREATE INDEX IF NOT EXISTS idx_trades_closed_date ON public.trades(user_id, exit_time DESC) WHERE status = 'CLOSED';

-- Trades by segment (for Telegram routing)
CREATE INDEX IF NOT EXISTS idx_trades_user_segment ON public.trades(user_id, segment, created_at DESC);

-- Active alerts query
CREATE INDEX IF NOT EXISTS idx_alerts_active ON public.alerts(user_id, is_active) WHERE is_active = true;

-- Alerts with recurrence (for evaluation scheduler)
CREATE INDEX IF NOT EXISTS idx_alerts_recurrence ON public.alerts(is_active, recurrence, next_check_after) WHERE is_active = true;

-- Studies by user and date
CREATE INDEX IF NOT EXISTS idx_studies_user_date ON public.studies(user_id, created_at DESC);

-- Instrument master lookup (symbol to security_id)
CREATE INDEX IF NOT EXISTS idx_instrument_symbol_exchange ON public.instrument_master(trading_symbol, exchange);

-- Instrument master by type and expiry (for derivatives)
CREATE INDEX IF NOT EXISTS idx_instrument_type_expiry ON public.instrument_master(instrument_type, expiry) WHERE expiry IS NOT NULL;

-- Weekly reports lookup
CREATE INDEX IF NOT EXISTS idx_weekly_reports_user_week ON public.weekly_reports(user_id, year DESC, week_number DESC);

-- Telegram chats by segment (for routing)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'telegram_chats' AND column_name = 'segments') THEN
    CREATE INDEX IF NOT EXISTS idx_telegram_chats_segments ON public.telegram_chats USING GIN(segments);
  END IF;
END $$;

-- ============================================
-- 3. CREATED_AT INDEXES (Audit and time-based queries)
-- ============================================

CREATE INDEX IF NOT EXISTS idx_trades_created_at ON public.trades(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON public.alerts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_trade_events_created_at ON public.trade_events(created_at DESC);

-- ============================================
-- 4. OPTIMIZE EXISTING TABLES
-- ============================================

-- Analyze tables to update statistics for query planner
ANALYZE public.trades;
ANALYZE public.alerts;
ANALYZE public.studies;
ANALYZE public.trade_events;
ANALYZE public.trade_patterns;
ANALYZE public.trade_mistakes;
ANALYZE public.instrument_master;
ANALYZE public.telegram_chats;
ANALYZE public.watchlists;
ANALYZE public.watchlist_items;
ANALYZE public.weekly_reports;

-- ============================================
-- NOTES
-- ============================================
-- 1. All indexes use IF NOT EXISTS to prevent errors on re-run
-- 2. Partial indexes (WHERE clauses) reduce index size and improve write performance
-- 3. GIN index on telegram_chats.segments supports array containment queries
-- 4. ANALYZE updates table statistics for optimal query planning
-- 5. Indexes on foreign keys prevent N+1 query problems
-- 6. Composite indexes follow left-prefix rule (user_id first for RLS filtering)

-- ============================================
-- Data Integrity: Add Audit Fields and Soft Delete
-- Created: 2026-02-16
-- Purpose: Add tracking fields for data auditing and compliance
-- ============================================

-- ============================================
-- 1. ADD AUDIT FIELDS TO CRITICAL TABLES
-- ============================================

-- Add updated_at to tables that don't have it
ALTER TABLE public.trades ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.alerts ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.studies ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.user_settings ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Add soft delete capability
ALTER TABLE public.trades ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.alerts ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.studies ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- ============================================
-- 2. CREATE UPDATED_AT TRIGGER FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 3. APPLY UPDATED_AT TRIGGERS
-- ============================================

DROP TRIGGER IF EXISTS set_updated_at ON public.trades;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.trades
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS set_updated_at ON public.alerts;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.alerts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS set_updated_at ON public.studies;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.studies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS set_updated_at ON public.user_settings;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 4. CREATE AUDIT LOG TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.audit_log (
  id BIGSERIAL PRIMARY KEY,
  table_name TEXT NOT NULL,
  record_id TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  old_values JSONB,
  new_values JSONB,
  user_id UUID REFERENCES auth.users(id),
  changed_at TIMESTAMPTZ DEFAULT NOW(),
  changed_by_function TEXT
);

-- Add indexes for audit log queries
CREATE INDEX IF NOT EXISTS idx_audit_log_table_record ON public.audit_log(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_date ON public.audit_log(user_id, changed_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON public.audit_log(action, changed_at DESC);

-- Enable RLS on audit log
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Users can only view their own audit logs
CREATE POLICY "Users can view own audit logs"
  ON public.audit_log FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can insert audit logs
CREATE POLICY "Service role can insert audit logs"
  ON public.audit_log FOR INSERT
  WITH CHECK (true);

-- Admins can view all audit logs
CREATE POLICY "Admins can view all audit logs"
  ON public.audit_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- 5. CREATE AUDIT TRIGGER FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION public.audit_trigger_function()
RETURNS TRIGGER AS $$
DECLARE
  user_id_val UUID;
BEGIN
  -- Get user_id from the record (works for tables with user_id column)
  IF TG_OP = 'DELETE' THEN
    user_id_val := OLD.user_id;
  ELSE
    user_id_val := NEW.user_id;
  END IF;

  -- Log the change
  IF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_log (table_name, record_id, action, old_values, user_id, changed_by_function)
    VALUES (TG_TABLE_NAME, OLD.id::TEXT, TG_OP, row_to_json(OLD), user_id_val, TG_ARGV[0]);
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.audit_log (table_name, record_id, action, old_values, new_values, user_id, changed_by_function)
    VALUES (TG_TABLE_NAME, NEW.id::TEXT, TG_OP, row_to_json(OLD), row_to_json(NEW), user_id_val, TG_ARGV[0]);
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_log (table_name, record_id, action, new_values, user_id, changed_by_function)
    VALUES (TG_TABLE_NAME, NEW.id::TEXT, TG_OP, row_to_json(NEW), user_id_val, TG_ARGV[0]);
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 6. APPLY AUDIT TRIGGERS TO CRITICAL TABLES
-- ============================================

-- Trades audit (track all changes)
DROP TRIGGER IF EXISTS audit_trades ON public.trades;
CREATE TRIGGER audit_trades
  AFTER INSERT OR UPDATE OR DELETE ON public.trades
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_trigger_function('trades');

-- Alerts audit
DROP TRIGGER IF EXISTS audit_alerts ON public.alerts;
CREATE TRIGGER audit_alerts
  AFTER INSERT OR UPDATE OR DELETE ON public.alerts
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_trigger_function('alerts');

-- User settings audit (track integration changes)
DROP TRIGGER IF EXISTS audit_user_settings ON public.user_settings;
CREATE TRIGGER audit_user_settings
  AFTER INSERT OR UPDATE OR DELETE ON public.user_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_trigger_function('user_settings');

-- ============================================
-- 7. UPDATE RLS POLICIES FOR SOFT DELETE
-- ============================================

-- Drop and recreate trades SELECT policy to exclude soft-deleted
DROP POLICY IF EXISTS "Users can view own trades" ON public.trades;
CREATE POLICY "Users can view own trades"
  ON public.trades FOR SELECT
  USING (auth.uid() = user_id AND deleted_at IS NULL);

-- Drop and recreate alerts SELECT policy to exclude soft-deleted
DROP POLICY IF EXISTS "Users can view own alerts" ON public.alerts;
CREATE POLICY "Users can view own alerts"
  ON public.alerts FOR SELECT
  USING (auth.uid() = user_id AND deleted_at IS NULL);

-- Drop and recreate studies SELECT policy to exclude soft-deleted
DROP POLICY IF EXISTS "Users can view own studies" ON public.studies;
CREATE POLICY "Users can view own studies"
  ON public.studies FOR SELECT
  USING (auth.uid() = user_id AND deleted_at IS NULL);

-- ============================================
-- 8. CREATE HELPER FUNCTIONS FOR SOFT DELETE
-- ============================================

-- Function to soft delete a trade
CREATE OR REPLACE FUNCTION public.soft_delete_trade(trade_id BIGINT)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.trades
  SET deleted_at = NOW()
  WHERE id = trade_id AND user_id = auth.uid() AND deleted_at IS NULL;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to restore a soft-deleted trade
CREATE OR REPLACE FUNCTION public.restore_trade(trade_id BIGINT)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.trades
  SET deleted_at = NULL
  WHERE id = trade_id AND user_id = auth.uid() AND deleted_at IS NOT NULL;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to permanently delete old soft-deleted records (cleanup)
CREATE OR REPLACE FUNCTION public.cleanup_old_deleted_records(days_old INTEGER DEFAULT 90)
RETURNS TABLE(trades_deleted BIGINT, alerts_deleted BIGINT, studies_deleted BIGINT) AS $$
DECLARE
  cutoff_date TIMESTAMPTZ;
  trades_count BIGINT;
  alerts_count BIGINT;
  studies_count BIGINT;
BEGIN
  cutoff_date := NOW() - (days_old || ' days')::INTERVAL;

  -- Delete old trades
  WITH deleted_trades AS (
    DELETE FROM public.trades
    WHERE deleted_at < cutoff_date
    RETURNING *
  )
  SELECT COUNT(*) INTO trades_count FROM deleted_trades;

  -- Delete old alerts
  WITH deleted_alerts AS (
    DELETE FROM public.alerts
    WHERE deleted_at < cutoff_date
    RETURNING *
  )
  SELECT COUNT(*) INTO alerts_count FROM deleted_alerts;

  -- Delete old studies
  WITH deleted_studies AS (
    DELETE FROM public.studies
    WHERE deleted_at < cutoff_date
    RETURNING *
  )
  SELECT COUNT(*) INTO studies_count FROM deleted_studies;

  RETURN QUERY SELECT trades_count, alerts_count, studies_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- NOTES
-- ============================================
-- 1. updated_at automatically updates on every UPDATE via trigger
-- 2. deleted_at = NULL means record is active, NOT NULL means soft-deleted
-- 3. RLS policies automatically filter out soft-deleted records
-- 4. audit_log table tracks all changes for compliance
-- 5. Soft delete functions can be called from edge functions
-- 6. cleanup_old_deleted_records should be run monthly (manual or scheduled)
-- 7. Service role can bypass RLS to view/restore deleted records if needed

-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
-- Telegram Delivery Log and Enhanced Routing
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
--
-- This migration adds:
-- 1. Delivery log table to track all Telegram notification attempts
-- 2. Enhanced routing with notification types (trades, alerts, studies)
-- 3. Change default segments behavior to OFF (empty array)
--
-- Author: Claude
-- Date: 2026-02-16
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
-- 1. Create telegram_delivery_log table
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

CREATE TABLE IF NOT EXISTS public.telegram_delivery_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  chat_id TEXT NOT NULL,
  notification_type TEXT NOT NULL, -- 'trade', 'alert', 'study', 'test', 'report'
  segment TEXT, -- For trades: 'Equity_Intraday', 'Futures', etc. NULL for alerts/studies
  success BOOLEAN NOT NULL,
  error_message TEXT,
  response_data JSONB, -- Full Telegram API response for debugging
  attempt_number INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.telegram_delivery_log ENABLE ROW LEVEL SECURITY;

-- Users can only view their own delivery logs
CREATE POLICY "Users can view their own telegram delivery logs"
  ON public.telegram_delivery_log FOR SELECT USING (auth.uid() = user_id);

-- Service role can insert logs (from edge functions)
CREATE POLICY "Service role can insert telegram delivery logs"
  ON public.telegram_delivery_log FOR INSERT WITH CHECK (true);

-- Indexes for fast queries
CREATE INDEX idx_telegram_delivery_log_user_id ON public.telegram_delivery_log(user_id);
CREATE INDEX idx_telegram_delivery_log_created_at ON public.telegram_delivery_log(created_at DESC);
CREATE INDEX idx_telegram_delivery_log_user_created ON public.telegram_delivery_log(user_id, created_at DESC);

-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
-- 2. Update telegram_chats table for notification type routing
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

-- Add notification_types column (JSON object mapping notification types to segment arrays)
-- Structure: { "trades": ["Equity_Intraday", "Futures"], "alerts": ["*"], "studies": [] }
-- "*" means all segments, [] means none

DO $$
BEGIN
  -- Add notification_types column if it doesn't exist
  IF NOT EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'telegram_chats'
    AND column_name = 'notification_types'
  ) THEN
    ALTER TABLE public.telegram_chats
    ADD COLUMN notification_types JSONB NOT NULL DEFAULT '{}'::jsonb;

    -- Migrate existing data: Convert segments array to new format
    -- Old: segments = ["Equity_Intraday", "Futures"]
    -- New: notification_types = { "trades": ["Equity_Intraday", "Futures"] }
    UPDATE public.telegram_chats
    SET notification_types = jsonb_build_object('trades', to_jsonb(segments))
    WHERE notification_types = '{}'::jsonb;

  END IF;
END $$;

-- Create index on notification_types for fast queries
CREATE INDEX IF NOT EXISTS idx_telegram_chats_notification_types
  ON public.telegram_chats USING GIN(notification_types);

-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
-- 3. Helper function to check if chat should receive notification
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

CREATE OR REPLACE FUNCTION public.should_notify_chat(
  notification_types_json JSONB,
  notif_type TEXT,
  notif_segment TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  segments_array JSONB;
BEGIN
  -- Get the segments array for this notification type
  segments_array := notification_types_json -> notif_type;

  -- If notification type not configured, return false
  IF segments_array IS NULL OR jsonb_array_length(segments_array) = 0 THEN
    RETURN FALSE;
  END IF;

  -- If wildcard "*" is present, allow all
  IF segments_array ? '*' THEN
    RETURN TRUE;
  END IF;

  -- For alerts and studies (no segment), check if any segments are enabled
  IF notif_segment IS NULL THEN
    RETURN jsonb_array_length(segments_array) > 0;
  END IF;

  -- For trades (with segment), check if specific segment is enabled
  RETURN segments_array ? notif_segment;
END;
$$;

-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
-- 4. Update default behavior: Change default segments to empty array
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

-- Change default for segments column (for backward compatibility)
ALTER TABLE public.telegram_chats
  ALTER COLUMN segments SET DEFAULT ARRAY[]::TEXT[];

-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
-- 5. Add comment for documentation
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

COMMENT ON TABLE public.telegram_delivery_log IS
'Tracks all Telegram notification delivery attempts for debugging and monitoring. Stores last 1000 entries per user (auto-pruned).';

COMMENT ON COLUMN public.telegram_chats.notification_types IS
'JSON mapping of notification types to segment arrays. Format: {"trades": ["Equity_Intraday"], "alerts": ["*"], "studies": []}. "*" = all segments, [] = disabled.';

COMMENT ON FUNCTION public.should_notify_chat IS
'Helper function to determine if a chat should receive a specific notification based on type and segment.';

-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
-- 6. Create function to clean old delivery logs (keep last 1000 per user)
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

CREATE OR REPLACE FUNCTION public.cleanup_old_telegram_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete logs older than 30 days OR keep only last 1000 per user
  WITH ranked_logs AS (
    SELECT id,
           ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) as rn
    FROM public.telegram_delivery_log
  )
  DELETE FROM public.telegram_delivery_log
  WHERE id IN (
    SELECT id FROM ranked_logs WHERE rn > 1000
  )
  OR created_at < NOW() - INTERVAL '30 days';
END;
$$;

-- Schedule cleanup (optional - can be called from edge function or cron)
COMMENT ON FUNCTION public.cleanup_old_telegram_logs IS
'Cleans up old telegram delivery logs. Keeps last 1000 per user or logs from last 30 days.';


-- Add user_id to pattern_tags (nullable so existing system tags remain)
ALTER TABLE public.pattern_tags ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) DEFAULT NULL;

-- Add user_id to candlestick_tags
ALTER TABLE public.candlestick_tags ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) DEFAULT NULL;

-- Add user_id to volume_tags
ALTER TABLE public.volume_tags ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) DEFAULT NULL;

-- Add user_id to mistake_tags
ALTER TABLE public.mistake_tags ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) DEFAULT NULL;

-- Update SELECT policies to include user's own tags + system tags (user_id IS NULL)
DROP POLICY IF EXISTS "Authenticated users can view pattern tags" ON public.pattern_tags;
CREATE POLICY "Authenticated users can view pattern tags" ON public.pattern_tags FOR SELECT USING (user_id IS NULL OR user_id = auth.uid());

DROP POLICY IF EXISTS "Authenticated users can view candlestick tags" ON public.candlestick_tags;
CREATE POLICY "Authenticated users can view candlestick tags" ON public.candlestick_tags FOR SELECT USING (user_id IS NULL OR user_id = auth.uid());

DROP POLICY IF EXISTS "Authenticated users can view volume tags" ON public.volume_tags;
CREATE POLICY "Authenticated users can view volume tags" ON public.volume_tags FOR SELECT USING (user_id IS NULL OR user_id = auth.uid());

DROP POLICY IF EXISTS "Authenticated users can view mistake tags" ON public.mistake_tags;
CREATE POLICY "Authenticated users can view mistake tags" ON public.mistake_tags FOR SELECT USING (user_id IS NULL OR user_id = auth.uid());

-- INSERT policies - users can create their own tags
CREATE POLICY "Users can insert own pattern tags" ON public.pattern_tags FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can insert own candlestick tags" ON public.candlestick_tags FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can insert own volume tags" ON public.volume_tags FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can insert own mistake tags" ON public.mistake_tags FOR INSERT WITH CHECK (auth.uid() = user_id);

-- UPDATE policies - users can update only their own tags
CREATE POLICY "Users can update own pattern tags" ON public.pattern_tags FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can update own candlestick tags" ON public.candlestick_tags FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can update own volume tags" ON public.volume_tags FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can update own mistake tags" ON public.mistake_tags FOR UPDATE USING (auth.uid() = user_id);

-- DELETE policies - users can delete only their own tags
CREATE POLICY "Users can delete own pattern tags" ON public.pattern_tags FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own candlestick tags" ON public.candlestick_tags FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own volume tags" ON public.volume_tags FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own mistake tags" ON public.mistake_tags FOR DELETE USING (auth.uid() = user_id);


-- Add configurable check interval per alert (default 5 minutes matching current cron)
ALTER TABLE public.alerts ADD COLUMN IF NOT EXISTS check_interval_minutes integer DEFAULT 5;

-- Add comment for clarity
COMMENT ON COLUMN public.alerts.check_interval_minutes IS 'How often this alert should be checked (in minutes). The evaluate-alerts cron runs every 5 min, so intervals < 5 are treated as 5.';


-- Create telegram_delivery_log table
CREATE TABLE public.telegram_delivery_log (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  chat_id text NOT NULL,
  notification_type text NOT NULL DEFAULT 'other',
  segment text,
  success boolean NOT NULL DEFAULT false,
  error_message text,
  response_data jsonb,
  attempt_number integer NOT NULL DEFAULT 1,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.telegram_delivery_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own delivery logs"
ON public.telegram_delivery_log FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert delivery logs"
ON public.telegram_delivery_log FOR INSERT
WITH CHECK (true);

-- Auto-cleanup: keep last 1000 logs per user
CREATE OR REPLACE FUNCTION public.cleanup_telegram_delivery_log()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  DELETE FROM public.telegram_delivery_log
  WHERE id IN (
    SELECT id FROM public.telegram_delivery_log
    WHERE user_id = NEW.user_id
    ORDER BY created_at DESC
    OFFSET 1000
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER cleanup_telegram_delivery_log_trigger
AFTER INSERT ON public.telegram_delivery_log
FOR EACH ROW
EXECUTE FUNCTION public.cleanup_telegram_delivery_log();

-- Add notification_types JSONB column to telegram_chats
ALTER TABLE public.telegram_chats
ADD COLUMN IF NOT EXISTS notification_types jsonb DEFAULT '{}'::jsonb;

-- Create index for fast log queries
CREATE INDEX idx_telegram_delivery_log_user_created
ON public.telegram_delivery_log (user_id, created_at DESC);


-- Add TSL tracking columns to trades
ALTER TABLE public.trades 
  ADD COLUMN IF NOT EXISTS highest_since_entry numeric DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS lowest_since_entry numeric DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS last_trail_anchor_price numeric DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS last_tsl_notified_at timestamp with time zone DEFAULT NULL;

-- Add tsl_profiles JSONB to user_settings for per-segment config
ALTER TABLE public.user_settings
  ADD COLUMN IF NOT EXISTS tsl_profiles jsonb DEFAULT '{
    "Equity_Intraday": {"activate_pct": 0.5, "step_pct": 0.5, "trail_gap_pct": 1.0, "cooldown_sec": 120, "min_sl_improve_pct": 0.1},
    "Equity_Positional": {"activate_pct": 2.0, "step_pct": 3.0, "trail_gap_pct": 4.0, "cooldown_sec": 1200, "min_sl_improve_pct": 0.5},
    "Futures": {"activate_pct": 1.0, "step_pct": 1.0, "trail_gap_pct": 2.0, "cooldown_sec": 300, "min_sl_improve_pct": 0.2},
    "Options": {"activate_pct": 1.5, "step_pct": 2.0, "trail_gap_pct": 3.0, "cooldown_sec": 300, "min_sl_improve_pct": 0.3},
    "Commodities": {"activate_pct": 1.0, "step_pct": 1.5, "trail_gap_pct": 2.5, "cooldown_sec": 300, "min_sl_improve_pct": 0.2}
  }'::jsonb;


-- Add TrueData columns to user_settings
ALTER TABLE public.user_settings
  ADD COLUMN IF NOT EXISTS truedata_username text,
  ADD COLUMN IF NOT EXISTS truedata_password text,
  ADD COLUMN IF NOT EXISTS truedata_enabled boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS truedata_verified_at timestamp with time zone;

-- Revoke SELECT on sensitive columns from authenticated and anon roles
-- Edge functions use service_role which is unaffected by these revokes
REVOKE SELECT (dhan_access_token, dhan_api_key, dhan_api_secret, truedata_password, webhook_secret) 
ON public.user_settings FROM authenticated, anon;

-- Revoke SELECT on bot_token from authenticated/anon roles
-- Edge functions use service_role which is unaffected
REVOKE SELECT (bot_token) ON public.telegram_chats FROM authenticated, anon;

-- Fix 1: Make storage buckets private and restrict SELECT policies
UPDATE storage.buckets SET public = false WHERE id IN ('trade-charts', 'study-attachments');

-- Drop overly permissive SELECT policies
DROP POLICY IF EXISTS "Users can view trade chart images" ON storage.objects;
DROP POLICY IF EXISTS "Users can view study attachments" ON storage.objects;

-- Create owner-scoped SELECT policies
CREATE POLICY "Users can view own trade charts"
ON storage.objects FOR SELECT
USING (bucket_id = 'trade-charts' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view own study attachments"
ON storage.objects FOR SELECT
USING (bucket_id = 'study-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Fix 3: Add search_path to audit_trigger_function
CREATE OR REPLACE FUNCTION public.audit_trigger_function()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  old_data jsonb;
  new_data jsonb;
BEGIN
  IF TG_OP = 'DELETE' THEN
    old_data = to_jsonb(OLD);
    INSERT INTO public.audit_log (table_name, record_id, operation, old_data, user_id)
    VALUES (TG_TABLE_NAME, OLD.id, TG_OP, old_data, auth.uid());
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    old_data = to_jsonb(OLD);
    new_data = to_jsonb(NEW);
    INSERT INTO public.audit_log (table_name, record_id, operation, old_data, new_data, user_id)
    VALUES (TG_TABLE_NAME, NEW.id, TG_OP, old_data, new_data, auth.uid());
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    new_data = to_jsonb(NEW);
    INSERT INTO public.audit_log (table_name, record_id, operation, new_data, user_id)
    VALUES (TG_TABLE_NAME, NEW.id, TG_OP, new_data, auth.uid());
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$function$;

-- Fix 3: Restrict cleanup_old_deleted_records to admin only
CREATE OR REPLACE FUNCTION public.cleanup_old_deleted_records(days_old integer DEFAULT 30)
RETURNS TABLE(table_name text, deleted_count bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- Restrict to admin users only
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Admin privileges required';
  END IF;

  -- Clean up old soft-deleted trades
  RETURN QUERY
  WITH deleted AS (
    DELETE FROM public.trades
    WHERE status = 'CANCELLED'
      AND updated_at < NOW() - (days_old || ' days')::interval
    RETURNING id
  )
  SELECT 'trades'::text, COUNT(*)::bigint FROM deleted;
END;
$function$;

-- Fix 3: Restrict cleanup_old_telegram_logs to admin only
CREATE OR REPLACE FUNCTION public.cleanup_old_telegram_logs(days_old integer DEFAULT 30)
RETURNS TABLE(table_name text, deleted_count bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- Restrict to admin users only
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Admin privileges required';
  END IF;

  RETURN QUERY
  WITH deleted AS (
    DELETE FROM public.telegram_delivery_log
    WHERE created_at < NOW() - (days_old || ' days')::interval
    RETURNING id
  )
  SELECT 'telegram_delivery_log'::text, COUNT(*)::bigint FROM deleted;
END;
$function$;

