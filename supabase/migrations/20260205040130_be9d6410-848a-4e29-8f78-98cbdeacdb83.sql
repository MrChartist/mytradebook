-- Add new fields for auto tracking and telegram posting
ALTER TABLE public.trades
ADD COLUMN IF NOT EXISTS auto_track_enabled boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS telegram_post_enabled boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS instrument_token varchar(50),
ADD COLUMN IF NOT EXISTS contract_key varchar(100);

-- Add index for faster lookups of trades that need auto tracking
CREATE INDEX IF NOT EXISTS idx_trades_auto_track ON public.trades(auto_track_enabled, status) WHERE auto_track_enabled = true;