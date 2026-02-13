
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
