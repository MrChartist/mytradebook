-- Add new columns to alerts table for enhanced alert creation
ALTER TABLE public.alerts 
ADD COLUMN IF NOT EXISTS notes text,
ADD COLUMN IF NOT EXISTS telegram_enabled boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS instrument_id character varying,
ADD COLUMN IF NOT EXISTS exchange character varying DEFAULT 'NSE';

-- Add comment for documentation
COMMENT ON COLUMN public.alerts.notes IS 'User notes/reason for the alert';
COMMENT ON COLUMN public.alerts.telegram_enabled IS 'Whether to send Telegram notification when alert triggers';
COMMENT ON COLUMN public.alerts.instrument_id IS 'Unique instrument identifier from instrument master';
COMMENT ON COLUMN public.alerts.exchange IS 'Exchange: NSE, NFO, MCX';