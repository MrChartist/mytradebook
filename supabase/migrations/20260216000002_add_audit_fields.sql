-- ============================================
-- Data Integrity: Add Audit Fields and Soft Delete
-- Created: 2026-02-16
-- Purpose: Add tracking fields for data auditing and compliance
-- ============================================

-- ============================================
-- 1. ADD AUDIT FIELDS TO CRITICAL TABLES
-- ============================================

-- Add updated_at to tables that don't have it
ALTER TABLE public.trades ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.alerts ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.studies ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.user_settings ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Add soft delete capability
ALTER TABLE public.trades ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.alerts ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.studies ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- ============================================
-- 2. CREATE UPDATED_AT TRIGGER FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 3. APPLY UPDATED_AT TRIGGERS
-- ============================================

DROP TRIGGER IF EXISTS set_updated_at ON public.trades;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.trades
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS set_updated_at ON public.alerts;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.alerts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS set_updated_at ON public.studies;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.studies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS set_updated_at ON public.user_settings;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 4. CREATE AUDIT LOG TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.audit_log (
  id BIGSERIAL PRIMARY KEY,
  table_name TEXT NOT NULL,
  record_id TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  old_values JSONB,
  new_values JSONB,
  user_id UUID REFERENCES auth.users(id),
  changed_at TIMESTAMPTZ DEFAULT NOW(),
  changed_by_function TEXT
);

-- Add indexes for audit log queries
CREATE INDEX IF NOT EXISTS idx_audit_log_table_record ON public.audit_log(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_date ON public.audit_log(user_id, changed_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON public.audit_log(action, changed_at DESC);

-- Enable RLS on audit log
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Users can only view their own audit logs
CREATE POLICY "Users can view own audit logs"
  ON public.audit_log FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can insert audit logs
CREATE POLICY "Service role can insert audit logs"
  ON public.audit_log FOR INSERT
  WITH CHECK (true);

-- Admins can view all audit logs
CREATE POLICY "Admins can view all audit logs"
  ON public.audit_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- 5. CREATE AUDIT TRIGGER FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION public.audit_trigger_function()
RETURNS TRIGGER AS $$
DECLARE
  user_id_val UUID;
BEGIN
  -- Get user_id from the record (works for tables with user_id column)
  IF TG_OP = 'DELETE' THEN
    user_id_val := OLD.user_id;
  ELSE
    user_id_val := NEW.user_id;
  END IF;

  -- Log the change
  IF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_log (table_name, record_id, action, old_values, user_id, changed_by_function)
    VALUES (TG_TABLE_NAME, OLD.id::TEXT, TG_OP, row_to_json(OLD), user_id_val, TG_ARGV[0]);
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.audit_log (table_name, record_id, action, old_values, new_values, user_id, changed_by_function)
    VALUES (TG_TABLE_NAME, NEW.id::TEXT, TG_OP, row_to_json(OLD), row_to_json(NEW), user_id_val, TG_ARGV[0]);
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_log (table_name, record_id, action, new_values, user_id, changed_by_function)
    VALUES (TG_TABLE_NAME, NEW.id::TEXT, TG_OP, row_to_json(NEW), user_id_val, TG_ARGV[0]);
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 6. APPLY AUDIT TRIGGERS TO CRITICAL TABLES
-- ============================================

-- Trades audit (track all changes)
DROP TRIGGER IF EXISTS audit_trades ON public.trades;
CREATE TRIGGER audit_trades
  AFTER INSERT OR UPDATE OR DELETE ON public.trades
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_trigger_function('trades');

-- Alerts audit
DROP TRIGGER IF EXISTS audit_alerts ON public.alerts;
CREATE TRIGGER audit_alerts
  AFTER INSERT OR UPDATE OR DELETE ON public.alerts
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_trigger_function('alerts');

-- User settings audit (track integration changes)
DROP TRIGGER IF EXISTS audit_user_settings ON public.user_settings;
CREATE TRIGGER audit_user_settings
  AFTER INSERT OR UPDATE OR DELETE ON public.user_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_trigger_function('user_settings');

-- ============================================
-- 7. UPDATE RLS POLICIES FOR SOFT DELETE
-- ============================================

-- Drop and recreate trades SELECT policy to exclude soft-deleted
DROP POLICY IF EXISTS "Users can view own trades" ON public.trades;
CREATE POLICY "Users can view own trades"
  ON public.trades FOR SELECT
  USING (auth.uid() = user_id AND deleted_at IS NULL);

-- Drop and recreate alerts SELECT policy to exclude soft-deleted
DROP POLICY IF EXISTS "Users can view own alerts" ON public.alerts;
CREATE POLICY "Users can view own alerts"
  ON public.alerts FOR SELECT
  USING (auth.uid() = user_id AND deleted_at IS NULL);

-- Drop and recreate studies SELECT policy to exclude soft-deleted
DROP POLICY IF EXISTS "Users can view own studies" ON public.studies;
CREATE POLICY "Users can view own studies"
  ON public.studies FOR SELECT
  USING (auth.uid() = user_id AND deleted_at IS NULL);

-- ============================================
-- 8. CREATE HELPER FUNCTIONS FOR SOFT DELETE
-- ============================================

-- Function to soft delete a trade
CREATE OR REPLACE FUNCTION public.soft_delete_trade(trade_id BIGINT)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.trades
  SET deleted_at = NOW()
  WHERE id = trade_id AND user_id = auth.uid() AND deleted_at IS NULL;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to restore a soft-deleted trade
CREATE OR REPLACE FUNCTION public.restore_trade(trade_id BIGINT)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.trades
  SET deleted_at = NULL
  WHERE id = trade_id AND user_id = auth.uid() AND deleted_at IS NOT NULL;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to permanently delete old soft-deleted records (cleanup)
CREATE OR REPLACE FUNCTION public.cleanup_old_deleted_records(days_old INTEGER DEFAULT 90)
RETURNS TABLE(trades_deleted BIGINT, alerts_deleted BIGINT, studies_deleted BIGINT) AS $$
DECLARE
  cutoff_date TIMESTAMPTZ;
  trades_count BIGINT;
  alerts_count BIGINT;
  studies_count BIGINT;
BEGIN
  cutoff_date := NOW() - (days_old || ' days')::INTERVAL;

  -- Delete old trades
  WITH deleted_trades AS (
    DELETE FROM public.trades
    WHERE deleted_at < cutoff_date
    RETURNING *
  )
  SELECT COUNT(*) INTO trades_count FROM deleted_trades;

  -- Delete old alerts
  WITH deleted_alerts AS (
    DELETE FROM public.alerts
    WHERE deleted_at < cutoff_date
    RETURNING *
  )
  SELECT COUNT(*) INTO alerts_count FROM deleted_alerts;

  -- Delete old studies
  WITH deleted_studies AS (
    DELETE FROM public.studies
    WHERE deleted_at < cutoff_date
    RETURNING *
  )
  SELECT COUNT(*) INTO studies_count FROM deleted_studies;

  RETURN QUERY SELECT trades_count, alerts_count, studies_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- NOTES
-- ============================================
-- 1. updated_at automatically updates on every UPDATE via trigger
-- 2. deleted_at = NULL means record is active, NOT NULL means soft-deleted
-- 3. RLS policies automatically filter out soft-deleted records
-- 4. audit_log table tracks all changes for compliance
-- 5. Soft delete functions can be called from edge functions
-- 6. cleanup_old_deleted_records should be run monthly (manual or scheduled)
-- 7. Service role can bypass RLS to view/restore deleted records if needed
