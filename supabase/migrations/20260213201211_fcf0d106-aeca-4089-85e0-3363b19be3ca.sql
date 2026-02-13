
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
