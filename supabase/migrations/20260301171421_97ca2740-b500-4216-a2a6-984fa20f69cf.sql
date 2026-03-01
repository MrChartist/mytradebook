
CREATE TABLE public.capital_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL DEFAULT 'DEPOSIT',
  amount numeric NOT NULL,
  transaction_date timestamptz NOT NULL DEFAULT now(),
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.capital_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own capital transactions" ON public.capital_transactions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own capital transactions" ON public.capital_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own capital transactions" ON public.capital_transactions
  FOR DELETE USING (auth.uid() = user_id);
