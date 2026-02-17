
-- Fix: Restrict document_access_logs INSERT to service_role only
DROP POLICY IF EXISTS "Authenticated users can insert access logs" ON public.document_access_logs;

CREATE POLICY "Service role can insert access logs"
ON public.document_access_logs
FOR INSERT
WITH CHECK ((current_setting('request.jwt.claims', true)::json->>'role') = 'service_role');
