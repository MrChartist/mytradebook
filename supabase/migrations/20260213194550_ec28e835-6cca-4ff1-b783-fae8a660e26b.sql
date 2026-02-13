
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
