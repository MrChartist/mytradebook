
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
