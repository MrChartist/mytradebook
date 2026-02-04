-- Add trailing stop loss and research trade columns to trades table
ALTER TABLE public.trades
ADD COLUMN IF NOT EXISTS trailing_sl_enabled boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS trailing_sl_percent numeric,
ADD COLUMN IF NOT EXISTS trailing_sl_points numeric,
ADD COLUMN IF NOT EXISTS trailing_sl_current numeric,
ADD COLUMN IF NOT EXISTS trailing_sl_trigger_price numeric,
ADD COLUMN IF NOT EXISTS trailing_sl_active boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS timeframe varchar(20),
ADD COLUMN IF NOT EXISTS holding_period varchar(50);

-- Add TSL_UPDATED and TSL_HIT to trade_event_type enum
ALTER TYPE public.trade_event_type ADD VALUE IF NOT EXISTS 'TSL_UPDATED';
ALTER TYPE public.trade_event_type ADD VALUE IF NOT EXISTS 'TSL_HIT';