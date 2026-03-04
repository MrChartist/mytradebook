
-- Revoke SELECT on sensitive columns from user_settings
REVOKE SELECT (dhan_access_token, dhan_api_key, dhan_api_secret, 
               ai_api_key, truedata_password, webhook_secret,
               telegram_bot_token, telegram_link_code) 
ON public.user_settings FROM authenticated, anon;

-- Revoke SELECT on bot_token from telegram_chats
REVOKE SELECT (bot_token) ON public.telegram_chats FROM authenticated, anon;

-- Revoke SELECT on sensitive profile fields
REVOKE SELECT (phone) ON public.profiles FROM authenticated, anon;
