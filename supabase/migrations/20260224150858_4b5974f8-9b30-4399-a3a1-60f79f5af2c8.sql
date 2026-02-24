-- Revoke SELECT on sensitive columns from authenticated and anon roles
-- Edge functions use service_role which is unaffected by these revokes
REVOKE SELECT (dhan_access_token, dhan_api_key, dhan_api_secret, truedata_password, webhook_secret) 
ON public.user_settings FROM authenticated, anon;
