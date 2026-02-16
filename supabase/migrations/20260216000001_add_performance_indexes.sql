-- ============================================
-- Performance Optimization: Add Missing Indexes
-- Created: 2026-02-16
-- Purpose: Add foreign key indexes and composite indexes for common queries
-- ============================================

-- ============================================
-- 1. FOREIGN KEY INDEXES (Critical for JOIN performance)
-- ============================================

-- trades table foreign keys
CREATE INDEX IF NOT EXISTS idx_trades_strategy_id ON public.trades(strategy_id) WHERE strategy_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_trades_study_id ON public.trades(study_id) WHERE study_id IS NOT NULL;

-- alerts table foreign keys
CREATE INDEX IF NOT EXISTS idx_alerts_linked_study_id ON public.alerts(linked_study_id) WHERE linked_study_id IS NOT NULL;

-- trade_patterns junction table
CREATE INDEX IF NOT EXISTS idx_trade_patterns_pattern_id ON public.trade_patterns(pattern_id);
CREATE INDEX IF NOT EXISTS idx_trade_patterns_trade_id ON public.trade_patterns(trade_id);

-- trade_mistakes junction table
CREATE INDEX IF NOT EXISTS idx_trade_mistakes_mistake_id ON public.trade_mistakes(mistake_id);
CREATE INDEX IF NOT EXISTS idx_trade_mistakes_trade_id ON public.trade_mistakes(trade_id);

-- strategy_trades foreign keys (if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'strategy_trades') THEN
    CREATE INDEX IF NOT EXISTS idx_strategy_trades_user_id ON public.strategy_trades(user_id);
  END IF;
END $$;

-- watchlist_items foreign keys
CREATE INDEX IF NOT EXISTS idx_watchlist_items_watchlist_id ON public.watchlist_items(watchlist_id);

-- trade_events foreign key
CREATE INDEX IF NOT EXISTS idx_trade_events_trade_id ON public.trade_events(trade_id);

-- telegram_chats foreign key
CREATE INDEX IF NOT EXISTS idx_telegram_chats_user_id ON public.telegram_chats(user_id);

-- ============================================
-- 2. COMPOSITE INDEXES (Common query patterns)
-- ============================================

-- Dashboard queries: Get user's trades by status and date
CREATE INDEX IF NOT EXISTS idx_trades_user_status_date ON public.trades(user_id, status, entry_time DESC);

-- Open trades query (frequently filtered)
CREATE INDEX IF NOT EXISTS idx_trades_open ON public.trades(user_id, entry_time DESC) WHERE status = 'OPEN';

-- Closed trades for analytics
CREATE INDEX IF NOT EXISTS idx_trades_closed_date ON public.trades(user_id, exit_time DESC) WHERE status = 'CLOSED';

-- Trades by segment (for Telegram routing)
CREATE INDEX IF NOT EXISTS idx_trades_user_segment ON public.trades(user_id, segment, created_at DESC);

-- Active alerts query
CREATE INDEX IF NOT EXISTS idx_alerts_active ON public.alerts(user_id, is_active) WHERE is_active = true;

-- Alerts with recurrence (for evaluation scheduler)
CREATE INDEX IF NOT EXISTS idx_alerts_recurrence ON public.alerts(is_active, recurrence, next_check_after) WHERE is_active = true;

-- Studies by user and date
CREATE INDEX IF NOT EXISTS idx_studies_user_date ON public.studies(user_id, created_at DESC);

-- Instrument master lookup (symbol to security_id)
CREATE INDEX IF NOT EXISTS idx_instrument_symbol_exchange ON public.instrument_master(trading_symbol, exchange);

-- Instrument master by type and expiry (for derivatives)
CREATE INDEX IF NOT EXISTS idx_instrument_type_expiry ON public.instrument_master(instrument_type, expiry) WHERE expiry IS NOT NULL;

-- Weekly reports lookup
CREATE INDEX IF NOT EXISTS idx_weekly_reports_user_week ON public.weekly_reports(user_id, year DESC, week_number DESC);

-- Telegram chats by segment (for routing)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'telegram_chats' AND column_name = 'segments') THEN
    CREATE INDEX IF NOT EXISTS idx_telegram_chats_segments ON public.telegram_chats USING GIN(segments);
  END IF;
END $$;

-- ============================================
-- 3. CREATED_AT INDEXES (Audit and time-based queries)
-- ============================================

CREATE INDEX IF NOT EXISTS idx_trades_created_at ON public.trades(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON public.alerts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_trade_events_created_at ON public.trade_events(created_at DESC);

-- ============================================
-- 4. OPTIMIZE EXISTING TABLES
-- ============================================

-- Analyze tables to update statistics for query planner
ANALYZE public.trades;
ANALYZE public.alerts;
ANALYZE public.studies;
ANALYZE public.trade_events;
ANALYZE public.trade_patterns;
ANALYZE public.trade_mistakes;
ANALYZE public.instrument_master;
ANALYZE public.telegram_chats;
ANALYZE public.watchlists;
ANALYZE public.watchlist_items;
ANALYZE public.weekly_reports;

-- ============================================
-- NOTES
-- ============================================
-- 1. All indexes use IF NOT EXISTS to prevent errors on re-run
-- 2. Partial indexes (WHERE clauses) reduce index size and improve write performance
-- 3. GIN index on telegram_chats.segments supports array containment queries
-- 4. ANALYZE updates table statistics for optimal query planning
-- 5. Indexes on foreign keys prevent N+1 query problems
-- 6. Composite indexes follow left-prefix rule (user_id first for RLS filtering)
