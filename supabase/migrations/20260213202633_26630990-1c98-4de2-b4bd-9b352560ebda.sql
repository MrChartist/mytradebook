
-- Alert chains: store child alert definitions to create when parent triggers
ALTER TABLE public.alerts ADD COLUMN IF NOT EXISTS chain_children JSONB DEFAULT NULL;
-- chain_children format: [{ "symbol": "BANKNIFTY", "condition_type": "PRICE_GT", "threshold": 48000, "recurrence": "ONCE", "notes": "Chained from NIFTY alert", "telegram_enabled": true }]
