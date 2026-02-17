-- Create a custom user authentication table
CREATE TABLE public.user_auth (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_auth ENABLE ROW LEVEL SECURITY;

-- Create policies for user_auth table
CREATE POLICY "Users can view their own auth record" 
ON public.user_auth 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create auth records" 
ON public.user_auth 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update their own auth record" 
ON public.user_auth 
FOR UPDATE 
USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_user_auth_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_auth_updated_at
BEFORE UPDATE ON public.user_auth
FOR EACH ROW
EXECUTE FUNCTION public.update_user_auth_updated_at();