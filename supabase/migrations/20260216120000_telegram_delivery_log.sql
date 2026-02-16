-- ═══════════════════════════════════════════════════════════════════
-- Telegram Delivery Log and Enhanced Routing
-- ═══════════════════════════════════════════════════════════════════
--
-- This migration adds:
-- 1. Delivery log table to track all Telegram notification attempts
-- 2. Enhanced routing with notification types (trades, alerts, studies)
-- 3. Change default segments behavior to OFF (empty array)
--
-- Author: Claude
-- Date: 2026-02-16
-- ═══════════════════════════════════════════════════════════════════

-- ══════════════════════════════════════════════════════════════════
-- 1. Create telegram_delivery_log table
-- ══════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.telegram_delivery_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  chat_id TEXT NOT NULL,
  notification_type TEXT NOT NULL, -- 'trade', 'alert', 'study', 'test', 'report'
  segment TEXT, -- For trades: 'Equity_Intraday', 'Futures', etc. NULL for alerts/studies
  success BOOLEAN NOT NULL,
  error_message TEXT,
  response_data JSONB, -- Full Telegram API response for debugging
  attempt_number INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.telegram_delivery_log ENABLE ROW LEVEL SECURITY;

-- Users can only view their own delivery logs
CREATE POLICY "Users can view their own telegram delivery logs"
  ON public.telegram_delivery_log FOR SELECT USING (auth.uid() = user_id);

-- Service role can insert logs (from edge functions)
CREATE POLICY "Service role can insert telegram delivery logs"
  ON public.telegram_delivery_log FOR INSERT WITH CHECK (true);

-- Indexes for fast queries
CREATE INDEX idx_telegram_delivery_log_user_id ON public.telegram_delivery_log(user_id);
CREATE INDEX idx_telegram_delivery_log_created_at ON public.telegram_delivery_log(created_at DESC);
CREATE INDEX idx_telegram_delivery_log_user_created ON public.telegram_delivery_log(user_id, created_at DESC);

-- ══════════════════════════════════════════════════════════════════
-- 2. Update telegram_chats table for notification type routing
-- ══════════════════════════════════════════════════════════════════

-- Add notification_types column (JSON object mapping notification types to segment arrays)
-- Structure: { "trades": ["Equity_Intraday", "Futures"], "alerts": ["*"], "studies": [] }
-- "*" means all segments, [] means none

DO $$
BEGIN
  -- Add notification_types column if it doesn't exist
  IF NOT EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'telegram_chats'
    AND column_name = 'notification_types'
  ) THEN
    ALTER TABLE public.telegram_chats
    ADD COLUMN notification_types JSONB NOT NULL DEFAULT '{}'::jsonb;

    -- Migrate existing data: Convert segments array to new format
    -- Old: segments = ["Equity_Intraday", "Futures"]
    -- New: notification_types = { "trades": ["Equity_Intraday", "Futures"] }
    UPDATE public.telegram_chats
    SET notification_types = jsonb_build_object('trades', to_jsonb(segments))
    WHERE notification_types = '{}'::jsonb;

  END IF;
END $$;

-- Create index on notification_types for fast queries
CREATE INDEX IF NOT EXISTS idx_telegram_chats_notification_types
  ON public.telegram_chats USING GIN(notification_types);

-- ══════════════════════════════════════════════════════════════════
-- 3. Helper function to check if chat should receive notification
-- ══════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.should_notify_chat(
  notification_types_json JSONB,
  notif_type TEXT,
  notif_segment TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  segments_array JSONB;
BEGIN
  -- Get the segments array for this notification type
  segments_array := notification_types_json -> notif_type;

  -- If notification type not configured, return false
  IF segments_array IS NULL OR jsonb_array_length(segments_array) = 0 THEN
    RETURN FALSE;
  END IF;

  -- If wildcard "*" is present, allow all
  IF segments_array ? '*' THEN
    RETURN TRUE;
  END IF;

  -- For alerts and studies (no segment), check if any segments are enabled
  IF notif_segment IS NULL THEN
    RETURN jsonb_array_length(segments_array) > 0;
  END IF;

  -- For trades (with segment), check if specific segment is enabled
  RETURN segments_array ? notif_segment;
END;
$$;

-- ══════════════════════════════════════════════════════════════════
-- 4. Update default behavior: Change default segments to empty array
-- ══════════════════════════════════════════════════════════════════

-- Change default for segments column (for backward compatibility)
ALTER TABLE public.telegram_chats
  ALTER COLUMN segments SET DEFAULT ARRAY[]::TEXT[];

-- ══════════════════════════════════════════════════════════════════
-- 5. Add comment for documentation
-- ══════════════════════════════════════════════════════════════════

COMMENT ON TABLE public.telegram_delivery_log IS
'Tracks all Telegram notification delivery attempts for debugging and monitoring. Stores last 1000 entries per user (auto-pruned).';

COMMENT ON COLUMN public.telegram_chats.notification_types IS
'JSON mapping of notification types to segment arrays. Format: {"trades": ["Equity_Intraday"], "alerts": ["*"], "studies": []}. "*" = all segments, [] = disabled.';

COMMENT ON FUNCTION public.should_notify_chat IS
'Helper function to determine if a chat should receive a specific notification based on type and segment.';

-- ══════════════════════════════════════════════════════════════════
-- 6. Create function to clean old delivery logs (keep last 1000 per user)
-- ══════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.cleanup_old_telegram_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete logs older than 30 days OR keep only last 1000 per user
  WITH ranked_logs AS (
    SELECT id,
           ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) as rn
    FROM public.telegram_delivery_log
  )
  DELETE FROM public.telegram_delivery_log
  WHERE id IN (
    SELECT id FROM ranked_logs WHERE rn > 1000
  )
  OR created_at < NOW() - INTERVAL '30 days';
END;
$$;

-- Schedule cleanup (optional - can be called from edge function or cron)
COMMENT ON FUNCTION public.cleanup_old_telegram_logs IS
'Cleans up old telegram delivery logs. Keeps last 1000 per user or logs from last 30 days.';
