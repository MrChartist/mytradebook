-- Create instrument_master table for storing Dhan scrip master data
CREATE TABLE IF NOT EXISTS public.instrument_master (
  security_id TEXT PRIMARY KEY,
  exchange_segment TEXT NOT NULL,
  exchange TEXT NOT NULL,
  instrument_type TEXT NOT NULL,
  trading_symbol TEXT NOT NULL,
  display_name TEXT,
  underlying_symbol TEXT,
  expiry DATE,
  strike NUMERIC,
  option_type TEXT,
  lot_size INTEGER,
  tick_size NUMERIC,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for fast searching
CREATE INDEX IF NOT EXISTS idx_instrument_master_trading_symbol 
ON public.instrument_master USING btree (trading_symbol);

CREATE INDEX IF NOT EXISTS idx_instrument_master_display_name 
ON public.instrument_master USING btree (display_name);

CREATE INDEX IF NOT EXISTS idx_instrument_master_exchange 
ON public.instrument_master USING btree (exchange);

CREATE INDEX IF NOT EXISTS idx_instrument_master_instrument_type 
ON public.instrument_master USING btree (instrument_type);

-- Composite index for derivatives lookup
CREATE INDEX IF NOT EXISTS idx_instrument_master_derivatives 
ON public.instrument_master (underlying_symbol, expiry, instrument_type);

CREATE INDEX IF NOT EXISTS idx_instrument_master_options 
ON public.instrument_master (underlying_symbol, expiry, strike, option_type);

-- Enable RLS
ALTER TABLE public.instrument_master ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to SELECT (read-only)
CREATE POLICY "Authenticated users can view instruments"
ON public.instrument_master
FOR SELECT
TO authenticated
USING (true);

-- Create instrument_sync_log table for tracking sync operations
CREATE TABLE IF NOT EXISTS public.instrument_sync_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'running',
  total_rows INTEGER,
  inserted_rows INTEGER,
  updated_rows INTEGER,
  error_message TEXT,
  sync_type TEXT DEFAULT 'manual'
);

-- Enable RLS on sync log
ALTER TABLE public.instrument_sync_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view sync logs
CREATE POLICY "Admins can view sync logs"
ON public.instrument_sync_log
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Alter trades table to make entry_price nullable for PENDING drafts
ALTER TABLE public.trades 
ALTER COLUMN entry_price DROP NOT NULL;

-- Add security_id and exchange_segment columns to trades if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'trades' 
                 AND column_name = 'security_id') THEN
    ALTER TABLE public.trades ADD COLUMN security_id TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'trades' 
                 AND column_name = 'exchange_segment') THEN
    ALTER TABLE public.trades ADD COLUMN exchange_segment TEXT;
  END IF;
END $$;

-- Add security_id and exchange_segment columns to alerts if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'alerts' 
                 AND column_name = 'security_id') THEN
    ALTER TABLE public.alerts ADD COLUMN security_id TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'alerts' 
                 AND column_name = 'exchange_segment') THEN
    ALTER TABLE public.alerts ADD COLUMN exchange_segment TEXT;
  END IF;
END $$;