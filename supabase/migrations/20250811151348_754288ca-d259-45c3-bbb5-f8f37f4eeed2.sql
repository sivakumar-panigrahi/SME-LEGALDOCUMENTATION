-- Fix security vulnerability: Secure email_logs table from public access
-- Remove the overly permissive SELECT policy that exposes customer emails

-- Drop the existing public SELECT policy
DROP POLICY IF EXISTS "Anyone can view email logs" ON public.email_logs;
DROP POLICY IF EXISTS "Anyone can insert email logs" ON public.email_logs;

-- Create secure policies that restrict access appropriately
-- Allow system/service roles to insert email logs (for email delivery tracking)
CREATE POLICY "Service can insert email logs" 
ON public.email_logs 
FOR INSERT 
WITH CHECK (auth.role() = 'service_role' OR auth.uid() IS NOT NULL);

-- Only allow authenticated users to view email logs (can be further restricted to admin roles later)
-- This prevents public access while maintaining system functionality
CREATE POLICY "Authenticated users can view email logs" 
ON public.email_logs 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Note: In production, you may want to further restrict SELECT access to admin users only
-- Example: USING (auth.jwt() ->> 'role' = 'admin') if implementing role-based access