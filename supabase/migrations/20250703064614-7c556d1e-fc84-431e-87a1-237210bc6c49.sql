
-- Create devices table for storing user's connected health devices
CREATE TABLE public.devices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  brand TEXT,
  model TEXT,
  is_connected BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS) to ensure users can only see their own devices
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;

-- Create policy that allows users to SELECT their own devices
CREATE POLICY "Users can view their own devices" 
  ON public.devices 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policy that allows users to INSERT their own devices
CREATE POLICY "Users can create their own devices" 
  ON public.devices 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create policy that allows users to UPDATE their own devices
CREATE POLICY "Users can update their own devices" 
  ON public.devices 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create policy that allows users to DELETE their own devices
CREATE POLICY "Users can delete their own devices" 
  ON public.devices 
  FOR DELETE 
  USING (auth.uid() = user_id);
