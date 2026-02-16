
-- Add user_id to pattern_tags (nullable so existing system tags remain)
ALTER TABLE public.pattern_tags ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) DEFAULT NULL;

-- Add user_id to candlestick_tags
ALTER TABLE public.candlestick_tags ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) DEFAULT NULL;

-- Add user_id to volume_tags
ALTER TABLE public.volume_tags ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) DEFAULT NULL;

-- Add user_id to mistake_tags
ALTER TABLE public.mistake_tags ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) DEFAULT NULL;

-- Update SELECT policies to include user's own tags + system tags (user_id IS NULL)
DROP POLICY IF EXISTS "Authenticated users can view pattern tags" ON public.pattern_tags;
CREATE POLICY "Authenticated users can view pattern tags" ON public.pattern_tags FOR SELECT USING (user_id IS NULL OR user_id = auth.uid());

DROP POLICY IF EXISTS "Authenticated users can view candlestick tags" ON public.candlestick_tags;
CREATE POLICY "Authenticated users can view candlestick tags" ON public.candlestick_tags FOR SELECT USING (user_id IS NULL OR user_id = auth.uid());

DROP POLICY IF EXISTS "Authenticated users can view volume tags" ON public.volume_tags;
CREATE POLICY "Authenticated users can view volume tags" ON public.volume_tags FOR SELECT USING (user_id IS NULL OR user_id = auth.uid());

DROP POLICY IF EXISTS "Authenticated users can view mistake tags" ON public.mistake_tags;
CREATE POLICY "Authenticated users can view mistake tags" ON public.mistake_tags FOR SELECT USING (user_id IS NULL OR user_id = auth.uid());

-- INSERT policies - users can create their own tags
CREATE POLICY "Users can insert own pattern tags" ON public.pattern_tags FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can insert own candlestick tags" ON public.candlestick_tags FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can insert own volume tags" ON public.volume_tags FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can insert own mistake tags" ON public.mistake_tags FOR INSERT WITH CHECK (auth.uid() = user_id);

-- UPDATE policies - users can update only their own tags
CREATE POLICY "Users can update own pattern tags" ON public.pattern_tags FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can update own candlestick tags" ON public.candlestick_tags FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can update own volume tags" ON public.volume_tags FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can update own mistake tags" ON public.mistake_tags FOR UPDATE USING (auth.uid() = user_id);

-- DELETE policies - users can delete only their own tags
CREATE POLICY "Users can delete own pattern tags" ON public.pattern_tags FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own candlestick tags" ON public.candlestick_tags FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own volume tags" ON public.volume_tags FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own mistake tags" ON public.mistake_tags FOR DELETE USING (auth.uid() = user_id);
