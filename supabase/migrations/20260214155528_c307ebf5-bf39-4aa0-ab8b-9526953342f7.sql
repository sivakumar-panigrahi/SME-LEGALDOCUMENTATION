
-- 1. Fix user_auth: restrict SELECT to never return password_hash via a view,
--    and tighten the INSERT policy so only the user's own record can be created
DROP POLICY IF EXISTS "Allow user registration" ON public.user_auth;
CREATE POLICY "Allow user registration"
ON public.user_auth
FOR INSERT
WITH CHECK (auth.uid() = id);

-- Create a safe view that excludes password_hash
CREATE OR REPLACE VIEW public.user_auth_safe
WITH (security_invoker = on) AS
SELECT id, created_at, updated_at, email, full_name
FROM public.user_auth;

-- Restrict direct SELECT on user_auth base table
DROP POLICY IF EXISTS "Users can view only their own auth record" ON public.user_auth;
CREATE POLICY "No direct select on user_auth"
ON public.user_auth
FOR SELECT
USING (false);

-- 2. Fix document_access_logs: tighten the INSERT policy
DROP POLICY IF EXISTS "Service can insert access logs" ON public.document_access_logs;
CREATE POLICY "Authenticated users can insert access logs"
ON public.document_access_logs
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);
