
-- Add BYOK AI provider columns to user_settings
ALTER TABLE public.user_settings
  ADD COLUMN ai_provider varchar DEFAULT NULL,
  ADD COLUMN ai_api_key text DEFAULT NULL;
