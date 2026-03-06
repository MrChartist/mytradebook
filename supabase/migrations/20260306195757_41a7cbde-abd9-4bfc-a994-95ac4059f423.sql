CREATE TABLE public.saved_scanner_presets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  filters jsonb NOT NULL DEFAULT '[]'::jsonb,
  sort_by text,
  sort_order text DEFAULT 'desc',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.saved_scanner_presets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own presets" ON public.saved_scanner_presets
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own presets" ON public.saved_scanner_presets
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own presets" ON public.saved_scanner_presets
  FOR DELETE TO authenticated USING (auth.uid() = user_id);