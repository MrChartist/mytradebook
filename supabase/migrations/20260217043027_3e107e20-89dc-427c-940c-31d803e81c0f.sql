
-- Create telegram_delivery_log table
CREATE TABLE public.telegram_delivery_log (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  chat_id text NOT NULL,
  notification_type text NOT NULL DEFAULT 'other',
  segment text,
  success boolean NOT NULL DEFAULT false,
  error_message text,
  response_data jsonb,
  attempt_number integer NOT NULL DEFAULT 1,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.telegram_delivery_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own delivery logs"
ON public.telegram_delivery_log FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert delivery logs"
ON public.telegram_delivery_log FOR INSERT
WITH CHECK (true);

-- Auto-cleanup: keep last 1000 logs per user
CREATE OR REPLACE FUNCTION public.cleanup_telegram_delivery_log()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  DELETE FROM public.telegram_delivery_log
  WHERE id IN (
    SELECT id FROM public.telegram_delivery_log
    WHERE user_id = NEW.user_id
    ORDER BY created_at DESC
    OFFSET 1000
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER cleanup_telegram_delivery_log_trigger
AFTER INSERT ON public.telegram_delivery_log
FOR EACH ROW
EXECUTE FUNCTION public.cleanup_telegram_delivery_log();

-- Add notification_types JSONB column to telegram_chats
ALTER TABLE public.telegram_chats
ADD COLUMN IF NOT EXISTS notification_types jsonb DEFAULT '{}'::jsonb;

-- Create index for fast log queries
CREATE INDEX idx_telegram_delivery_log_user_created
ON public.telegram_delivery_log (user_id, created_at DESC);
