-- Revoke SELECT on bot_token from authenticated/anon roles
-- Edge functions use service_role which is unaffected
REVOKE SELECT (bot_token) ON public.telegram_chats FROM authenticated, anon;