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