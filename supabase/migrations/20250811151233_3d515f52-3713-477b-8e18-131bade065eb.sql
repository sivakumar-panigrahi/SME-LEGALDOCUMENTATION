-- Fix security vulnerability: Update RLS policies for user_auth table
-- Remove the overly permissive policies that allow public access

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own auth record" ON public.user_auth;
DROP POLICY IF EXISTS "Users can update their own auth record" ON public.user_auth;
DROP POLICY IF EXISTS "Anyone can create auth records" ON public.user_auth;

-- Create secure policies that restrict access to authenticated users' own records only
CREATE POLICY "Users can view only their own auth record" 
ON public.user_auth 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update only their own auth record" 
ON public.user_auth 
FOR UPDATE 
USING (auth.uid() = id);

-- Allow account creation during signup (insert policy remains open for registration)
-- This is necessary for user registration flow
CREATE POLICY "Allow user registration" 
ON public.user_auth 
FOR INSERT 
WITH CHECK (true);