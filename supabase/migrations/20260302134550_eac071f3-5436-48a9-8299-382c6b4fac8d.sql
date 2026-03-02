-- Fix: Tighten telegram_delivery_log INSERT policy to require authenticated user
-- The service role bypasses RLS anyway, so this policy should require auth
DROP POLICY IF EXISTS "Service role can insert delivery logs" ON public.telegram_delivery_log;
CREATE POLICY "Authenticated users can insert own delivery logs"
  ON public.telegram_delivery_log
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);