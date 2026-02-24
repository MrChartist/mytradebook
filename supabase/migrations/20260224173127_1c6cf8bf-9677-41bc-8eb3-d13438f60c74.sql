
-- Fix 1: Make storage buckets private and restrict SELECT policies
UPDATE storage.buckets SET public = false WHERE id IN ('trade-charts', 'study-attachments');

-- Drop overly permissive SELECT policies
DROP POLICY IF EXISTS "Users can view trade chart images" ON storage.objects;
DROP POLICY IF EXISTS "Users can view study attachments" ON storage.objects;

-- Create owner-scoped SELECT policies
CREATE POLICY "Users can view own trade charts"
ON storage.objects FOR SELECT
USING (bucket_id = 'trade-charts' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view own study attachments"
ON storage.objects FOR SELECT
USING (bucket_id = 'study-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Fix 3: Add search_path to audit_trigger_function
CREATE OR REPLACE FUNCTION public.audit_trigger_function()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  old_data jsonb;
  new_data jsonb;
BEGIN
  IF TG_OP = 'DELETE' THEN
    old_data = to_jsonb(OLD);
    INSERT INTO public.audit_log (table_name, record_id, operation, old_data, user_id)
    VALUES (TG_TABLE_NAME, OLD.id, TG_OP, old_data, auth.uid());
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    old_data = to_jsonb(OLD);
    new_data = to_jsonb(NEW);
    INSERT INTO public.audit_log (table_name, record_id, operation, old_data, new_data, user_id)
    VALUES (TG_TABLE_NAME, NEW.id, TG_OP, old_data, new_data, auth.uid());
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    new_data = to_jsonb(NEW);
    INSERT INTO public.audit_log (table_name, record_id, operation, new_data, user_id)
    VALUES (TG_TABLE_NAME, NEW.id, TG_OP, new_data, auth.uid());
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$function$;

-- Fix 3: Restrict cleanup_old_deleted_records to admin only
CREATE OR REPLACE FUNCTION public.cleanup_old_deleted_records(days_old integer DEFAULT 30)
RETURNS TABLE(table_name text, deleted_count bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- Restrict to admin users only
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Admin privileges required';
  END IF;

  -- Clean up old soft-deleted trades
  RETURN QUERY
  WITH deleted AS (
    DELETE FROM public.trades
    WHERE status = 'CANCELLED'
      AND updated_at < NOW() - (days_old || ' days')::interval
    RETURNING id
  )
  SELECT 'trades'::text, COUNT(*)::bigint FROM deleted;
END;
$function$;

-- Fix 3: Restrict cleanup_old_telegram_logs to admin only
CREATE OR REPLACE FUNCTION public.cleanup_old_telegram_logs(days_old integer DEFAULT 30)
RETURNS TABLE(table_name text, deleted_count bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- Restrict to admin users only
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Admin privileges required';
  END IF;

  RETURN QUERY
  WITH deleted AS (
    DELETE FROM public.telegram_delivery_log
    WHERE created_at < NOW() - (days_old || ' days')::interval
    RETURNING id
  )
  SELECT 'telegram_delivery_log'::text, COUNT(*)::bigint FROM deleted;
END;
$function$;
