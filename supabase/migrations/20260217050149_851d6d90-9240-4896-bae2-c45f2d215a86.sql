
-- Add TSL tracking columns to trades
ALTER TABLE public.trades 
  ADD COLUMN IF NOT EXISTS highest_since_entry numeric DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS lowest_since_entry numeric DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS last_trail_anchor_price numeric DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS last_tsl_notified_at timestamp with time zone DEFAULT NULL;

-- Add tsl_profiles JSONB to user_settings for per-segment config
ALTER TABLE public.user_settings
  ADD COLUMN IF NOT EXISTS tsl_profiles jsonb DEFAULT '{
    "Equity_Intraday": {"activate_pct": 0.5, "step_pct": 0.5, "trail_gap_pct": 1.0, "cooldown_sec": 120, "min_sl_improve_pct": 0.1},
    "Equity_Positional": {"activate_pct": 2.0, "step_pct": 3.0, "trail_gap_pct": 4.0, "cooldown_sec": 1200, "min_sl_improve_pct": 0.5},
    "Futures": {"activate_pct": 1.0, "step_pct": 1.0, "trail_gap_pct": 2.0, "cooldown_sec": 300, "min_sl_improve_pct": 0.2},
    "Options": {"activate_pct": 1.5, "step_pct": 2.0, "trail_gap_pct": 3.0, "cooldown_sec": 300, "min_sl_improve_pct": 0.3},
    "Commodities": {"activate_pct": 1.0, "step_pct": 1.5, "trail_gap_pct": 2.5, "cooldown_sec": 300, "min_sl_improve_pct": 0.2}
  }'::jsonb;
