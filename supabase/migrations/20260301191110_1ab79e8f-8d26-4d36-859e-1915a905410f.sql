-- Daily Journal Entries table
CREATE TABLE public.daily_journal_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  entry_date DATE NOT NULL,
  mood TEXT CHECK (mood IN ('great', 'good', 'neutral', 'bad', 'terrible')),
  pre_market_plan TEXT,
  post_market_review TEXT,
  market_outlook TEXT,
  lessons_learned TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, entry_date)
);

ALTER TABLE public.daily_journal_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own journal entries"
  ON public.daily_journal_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own journal entries"
  ON public.daily_journal_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own journal entries"
  ON public.daily_journal_entries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own journal entries"
  ON public.daily_journal_entries FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER update_daily_journal_updated_at
  BEFORE UPDATE ON public.daily_journal_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add emotion_tag to trades table
ALTER TABLE public.trades
  ADD COLUMN emotion_tag TEXT CHECK (emotion_tag IN ('fomo', 'fear', 'greed', 'confident', 'calm', 'revenge', 'impatient', 'disciplined'));
