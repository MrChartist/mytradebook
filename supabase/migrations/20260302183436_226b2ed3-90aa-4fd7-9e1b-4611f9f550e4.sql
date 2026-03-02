
-- 1. Add missing UPDATE policy on capital_transactions
CREATE POLICY "Users can update their own capital transactions"
ON public.capital_transactions
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 2. Add missing DELETE policy on telegram_delivery_log
CREATE POLICY "Users can delete their own delivery logs"
ON public.telegram_delivery_log
FOR DELETE
USING (auth.uid() = user_id);

-- 3. Add missing UPDATE policy on study_duration_categories
CREATE POLICY "Users can update their own duration categories"
ON public.study_duration_categories
FOR UPDATE
USING (auth.uid() = user_id AND is_system = false)
WITH CHECK (auth.uid() = user_id AND is_system = false);

-- 4. Add missing UPDATE and DELETE policies on trade_events
CREATE POLICY "Users can update their own trade events"
ON public.trade_events
FOR UPDATE
USING (EXISTS (SELECT 1 FROM public.trades t WHERE t.id = trade_id AND t.user_id = auth.uid()));

CREATE POLICY "Users can delete their own trade events"
ON public.trade_events
FOR DELETE
USING (EXISTS (SELECT 1 FROM public.trades t WHERE t.id = trade_id AND t.user_id = auth.uid()));

-- 5. Add missing DELETE policy on profiles
CREATE POLICY "Users can delete their own profile"
ON public.profiles
FOR DELETE
USING (auth.uid() = user_id);

-- 6. Add INSERT/UPDATE/DELETE policies on weekly_reports (system-generated but user-owned)
CREATE POLICY "Users can insert their own weekly reports"
ON public.weekly_reports
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own weekly reports"
ON public.weekly_reports
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own weekly reports"
ON public.weekly_reports
FOR DELETE
USING (auth.uid() = user_id);

-- 7. Add INSERT/DELETE policies on scanner_results (linked via scanner ownership)
CREATE POLICY "Users can insert scanner results for own scanners"
ON public.scanner_results
FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM public.scanner_definitions sd WHERE sd.id = scanner_id AND sd.user_id = auth.uid()));

CREATE POLICY "Users can delete their own scanner results"
ON public.scanner_results
FOR DELETE
USING (EXISTS (SELECT 1 FROM public.scanner_definitions sd WHERE sd.id = scanner_id AND sd.user_id = auth.uid()));
