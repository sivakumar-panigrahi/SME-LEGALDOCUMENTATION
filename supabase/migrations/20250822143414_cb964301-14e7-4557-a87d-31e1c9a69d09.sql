-- Remove the dangerous public read policy for document_access_tokens
DROP POLICY IF EXISTS "Public can read valid tokens" ON public.document_access_tokens;

-- Fix email_logs RLS to restrict access to document owners only
DROP POLICY IF EXISTS "Authenticated users can view email logs" ON public.email_logs;

CREATE POLICY "Document owners can view email logs" 
ON public.email_logs 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.documents d 
    WHERE d.id = email_logs.document_id 
    AND d.user_id = auth.uid()
  )
);

-- Add proper audit logging for document access
CREATE TABLE IF NOT EXISTS public.document_access_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL,
  access_token UUID,
  accessed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ip_address TEXT,
  user_agent TEXT,
  action TEXT NOT NULL -- 'view', 'sign', 'download'
);

-- Enable RLS on audit logs
ALTER TABLE public.document_access_logs ENABLE ROW LEVEL SECURITY;

-- Only document owners can view access logs
CREATE POLICY "Document owners can view access logs" 
ON public.document_access_logs 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.documents d 
    WHERE d.id = document_access_logs.document_id 
    AND d.user_id = auth.uid()
  )
);

-- Service can insert access logs
CREATE POLICY "Service can insert access logs" 
ON public.document_access_logs 
FOR INSERT 
WITH CHECK (true);