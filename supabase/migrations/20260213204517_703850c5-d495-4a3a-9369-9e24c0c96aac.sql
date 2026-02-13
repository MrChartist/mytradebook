
-- Table for multiple Telegram chat destinations per user with segment routing
CREATE TABLE public.telegram_chats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  chat_id TEXT NOT NULL,
  label TEXT NOT NULL DEFAULT '',
  segments TEXT[] NOT NULL DEFAULT ARRAY['Equity_Intraday','Equity_Positional','Futures','Options','Commodities'],
  bot_token TEXT, -- NULL = use default bot token from env
  bot_username TEXT,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.telegram_chats ENABLE ROW LEVEL SECURITY;

-- Users can only manage their own chat destinations
CREATE POLICY "Users can view their own telegram chats"
  ON public.telegram_chats FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own telegram chats"
  ON public.telegram_chats FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own telegram chats"
  ON public.telegram_chats FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own telegram chats"
  ON public.telegram_chats FOR DELETE USING (auth.uid() = user_id);

-- Index for fast lookups
CREATE INDEX idx_telegram_chats_user_id ON public.telegram_chats(user_id);

-- Allow service role full access for edge functions
CREATE POLICY "Service role can manage all telegram chats"
  ON public.telegram_chats FOR ALL USING (true) WITH CHECK (true);
