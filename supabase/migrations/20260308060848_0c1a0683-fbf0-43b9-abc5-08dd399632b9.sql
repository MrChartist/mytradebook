
-- Add AI coaching feedback column to trades
ALTER TABLE public.trades ADD COLUMN IF NOT EXISTS coaching_feedback text;

-- Create achievements definition table
CREATE TABLE public.achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  title text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL DEFAULT '🏆',
  category text NOT NULL DEFAULT 'milestone',
  threshold integer NOT NULL DEFAULT 1,
  sort_order integer NOT NULL DEFAULT 0
);

-- Create user achievements tracking table
CREATE TABLE public.user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id uuid NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  unlocked_at timestamp with time zone NOT NULL DEFAULT now(),
  progress integer NOT NULL DEFAULT 0,
  UNIQUE(user_id, achievement_id)
);

-- Enable RLS
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- Achievements are readable by all authenticated users
CREATE POLICY "Authenticated users can view achievements"
  ON public.achievements FOR SELECT TO authenticated
  USING (true);

-- User achievements: users can only see and manage their own
CREATE POLICY "Users can view own achievements"
  ON public.user_achievements FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements"
  ON public.user_achievements FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own achievements"
  ON public.user_achievements FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- Seed achievement definitions
INSERT INTO public.achievements (key, title, description, icon, category, threshold, sort_order) VALUES
  ('first_trade', 'First Blood', 'Log your first trade', '⚔️', 'milestone', 1, 1),
  ('trades_10', 'Getting Started', 'Complete 10 trades', '📊', 'milestone', 10, 2),
  ('trades_50', 'Seasoned Trader', 'Complete 50 trades', '📈', 'milestone', 50, 3),
  ('trades_100', 'Century Club', 'Complete 100 trades', '💯', 'milestone', 100, 4),
  ('trades_500', 'Trading Machine', 'Complete 500 trades', '🤖', 'milestone', 500, 5),
  ('win_streak_3', 'Hat Trick', '3 wins in a row', '🎩', 'streak', 3, 10),
  ('win_streak_5', 'On Fire', '5 wins in a row', '🔥', 'streak', 5, 11),
  ('win_streak_10', 'Unstoppable', '10 wins in a row', '⚡', 'streak', 10, 12),
  ('first_profit', 'In The Green', 'Close your first profitable trade', '💚', 'profit', 1, 20),
  ('profit_10k', '10K Club', 'Accumulate ₹10,000 total profit', '💰', 'profit', 10000, 21),
  ('profit_100k', 'Lakhpati', 'Accumulate ₹1,00,000 total profit', '💎', 'profit', 100000, 22),
  ('first_review', 'Self Aware', 'Complete your first post-trade review', '🪞', 'discipline', 1, 30),
  ('reviews_10', 'Reflective Trader', 'Complete 10 post-trade reviews', '📝', 'discipline', 10, 31),
  ('journal_7', 'Consistent Journaler', 'Write 7 daily journal entries', '📓', 'discipline', 7, 32),
  ('best_month', 'Best Month Ever', 'Beat your previous best monthly P&L', '🏆', 'achievement', 1, 40),
  ('win_rate_70', 'Sharpshooter', 'Achieve 70%+ win rate over 20+ trades', '🎯', 'achievement', 70, 41);
