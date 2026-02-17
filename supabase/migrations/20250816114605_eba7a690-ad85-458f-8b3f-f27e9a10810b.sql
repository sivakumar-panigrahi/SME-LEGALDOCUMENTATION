-- Secure documents access: remove public policies, add tokenized sharing

-- 1) Remove overly permissive public policies
DROP POLICY IF EXISTS "Public can view specific documents for signing" ON public.documents;
DROP POLICY IF EXISTS "Public can sign documents" ON public.documents;

-- 2) Create token table for secure, time-limited access
CREATE TABLE IF NOT EXISTS public.document_access_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  token uuid NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  used_at timestamptz,
  created_by uuid, -- optional: the user who created the share (no FK to auth.users per best practices)
  recipient_email text,
  purpose text NOT NULL DEFAULT 'signing' -- e.g. 'signing', 'view'
);

ALTER TABLE public.document_access_tokens ENABLE ROW LEVEL SECURITY;

-- Owners can create tokens for their documents
CREATE POLICY IF NOT EXISTS "Owners can create access tokens"
ON public.document_access_tokens
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.documents d
    WHERE d.id = document_id AND d.user_id = auth.uid()
  )
);

-- Owners can view tokens they created for their documents
CREATE POLICY IF NOT EXISTS "Owners can view access tokens"
ON public.document_access_tokens
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.documents d
    WHERE d.id = document_id AND d.user_id = auth.uid()
  )
);

-- Public can read valid, unexpired tokens (only token row, not the document)
CREATE POLICY IF NOT EXISTS "Public can read valid tokens"
ON public.document_access_tokens
FOR SELECT TO anon
USING (expires_at > now() AND used_at IS NULL);

-- Public can mark token as used (when signing completes)
CREATE POLICY IF NOT EXISTS "Public can mark token used"
ON public.document_access_tokens
FOR UPDATE TO anon
USING (expires_at > now() AND used_at IS NULL)
WITH CHECK (used_at IS NOT NULL);

-- 3) Secure helper functions for token-based access
CREATE OR REPLACE FUNCTION public.get_document_by_token(access_token uuid)
RETURNS TABLE (
  document_id uuid,
  template_name text,
  form_data jsonb,
  status text,
  company_signature text,
  client_signature text,
  created_at timestamptz,
  updated_at timestamptz,
  can_sign boolean
) LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  t public.document_access_tokens%ROWTYPE;
  d public.documents%ROWTYPE;
BEGIN
  SELECT * INTO t
  FROM public.document_access_tokens
  WHERE token = access_token AND expires_at > now() AND used_at IS NULL;

  IF NOT FOUND THEN
    RETURN; -- no rows
  END IF;

  SELECT * INTO d FROM public.documents WHERE id = t.document_id;
  IF NOT FOUND THEN
    RETURN; -- no rows
  END IF;

  RETURN QUERY SELECT
    d.id,
    d.template_name,
    d.form_data,
    d.status,
    d.company_signature,
    d.client_signature,
    d.created_at,
    d.updated_at,
    (t.purpose = 'signing' AND d.status IN ('company_signed','sent_for_signature')) AS can_sign;
END;$$;

CREATE OR REPLACE FUNCTION public.sign_document_by_token(access_token uuid, signature_data text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  t public.document_access_tokens%ROWTYPE;
  d public.documents%ROWTYPE;
BEGIN
  -- Validate token
  SELECT * INTO t
  FROM public.document_access_tokens
  WHERE token = access_token AND expires_at > now() AND used_at IS NULL AND purpose = 'signing';

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  -- Ensure document is signable
  SELECT * INTO d FROM public.documents
  WHERE id = t.document_id AND status IN ('company_signed','sent_for_signature');

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  -- Sign document
  UPDATE public.documents
  SET client_signature = signature_data,
      status = 'fully_signed',
      updated_at = now()
  WHERE id = d.id;

  -- Mark token used
  UPDATE public.document_access_tokens
  SET used_at = now()
  WHERE token = access_token;

  RETURN true;
END;$$;

-- 4) Helpful indexes
CREATE INDEX IF NOT EXISTS idx_document_access_tokens_token ON public.document_access_tokens(token);
CREATE INDEX IF NOT EXISTS idx_document_access_tokens_exp ON public.document_access_tokens(expires_at) WHERE used_at IS NULL;