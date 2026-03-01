
ALTER TABLE public.telegram_chats
  ADD COLUMN IF NOT EXISTS last_verified_at timestamptz,
  ADD COLUMN IF NOT EXISTS verification_status text DEFAULT 'unverified';
