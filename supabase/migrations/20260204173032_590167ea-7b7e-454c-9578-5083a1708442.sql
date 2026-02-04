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