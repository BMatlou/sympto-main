
-- Enable RLS on all existing tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.symptoms_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_profiles
CREATE POLICY "Users can view their own profile" 
  ON public.user_profiles 
  FOR SELECT 
  USING (id = auth.uid());

CREATE POLICY "Users can insert their own profile" 
  ON public.user_profiles 
  FOR INSERT 
  WITH CHECK (id = auth.uid());

CREATE POLICY "Users can update their own profile" 
  ON public.user_profiles 
  FOR UPDATE 
  USING (id = auth.uid());

-- Create RLS policies for symptoms_log
CREATE POLICY "Users can view their own symptoms" 
  ON public.symptoms_log 
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own symptoms" 
  ON public.symptoms_log 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

-- Create RLS policies for medications
CREATE POLICY "Users can view their own medications" 
  ON public.medications 
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own medications" 
  ON public.medications 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own medications" 
  ON public.medications 
  FOR UPDATE 
  USING (user_id = auth.uid());

-- Create RLS policies for medical_records
CREATE POLICY "Users can view their own medical records" 
  ON public.medical_records 
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own medical records" 
  ON public.medical_records 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

-- Create RLS policies for appointments
CREATE POLICY "Users can view their own appointments" 
  ON public.appointments 
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own appointments" 
  ON public.appointments 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own appointments" 
  ON public.appointments 
  FOR UPDATE 
  USING (user_id = auth.uid());

-- Add missing columns and tables for enhanced functionality
ALTER TABLE public.symptoms_log ADD COLUMN IF NOT EXISTS location_data JSONB;
ALTER TABLE public.symptoms_log ADD COLUMN IF NOT EXISTS environmental_data JSONB;
ALTER TABLE public.symptoms_log ADD COLUMN IF NOT EXISTS notes TEXT;

ALTER TABLE public.medications ADD COLUMN IF NOT EXISTS reminder_times TIME[];
ALTER TABLE public.medications ADD COLUMN IF NOT EXISTS notes TEXT;

ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'scheduled';
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'in-person';
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS video_link TEXT;

-- Create storage bucket for medical records
INSERT INTO storage.buckets (id, name, public) 
VALUES ('medical-records', 'medical-records', false)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for medical records
CREATE POLICY "Users can upload their own medical records"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'medical-records' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own medical records"
ON storage.objects FOR SELECT
USING (bucket_id = 'medical-records' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
ON public.notifications FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications"
ON public.notifications FOR UPDATE
USING (user_id = auth.uid());
