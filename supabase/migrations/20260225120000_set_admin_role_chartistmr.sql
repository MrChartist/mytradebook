-- Set chartistmr@gmail.com as admin
-- Updates the existing 'client' role to 'admin' for this user
UPDATE public.user_roles
SET role = 'admin'
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'chartistmr@gmail.com')
  AND role = 'client';

-- If the user exists but has no role row yet, insert an admin role
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role
FROM auth.users
WHERE email = 'chartistmr@gmail.com'
  AND NOT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = auth.users.id
  );
