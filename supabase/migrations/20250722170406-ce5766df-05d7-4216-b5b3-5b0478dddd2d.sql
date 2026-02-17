-- Fix the security issue with the function by setting search_path
CREATE OR REPLACE FUNCTION public.update_user_auth_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = '';