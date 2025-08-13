
-- Add columns to user_profiles table for South African ID and personal information
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS id_number TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS age INTEGER,
ADD COLUMN IF NOT EXISTS citizenship_status TEXT;

-- Create table for user settings and preferences
CREATE TABLE IF NOT EXISTS public.user_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  biometric_lock_enabled BOOLEAN DEFAULT FALSE,
  health_data_sharing_enabled BOOLEAN DEFAULT FALSE,
  anonymous_analytics_enabled BOOLEAN DEFAULT FALSE,
  fitness_app_sync_enabled BOOLEAN DEFAULT FALSE,
  notification_preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create table for connected fitness apps
CREATE TABLE IF NOT EXISTS public.connected_fitness_apps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  app_name TEXT NOT NULL,
  app_type TEXT NOT NULL,
  is_connected BOOLEAN DEFAULT TRUE,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  sync_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create table for medication side effects and interactions
CREATE TABLE IF NOT EXISTS public.medication_info (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  medication_name TEXT NOT NULL,
  side_effects TEXT[],
  masked_symptoms TEXT[],
  interactions TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create table for comprehensive symptoms list
CREATE TABLE IF NOT EXISTS public.symptoms_library (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  severity_indicators JSONB,
  common_triggers TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert comprehensive symptoms list
INSERT INTO public.symptoms_library (name, category, common_triggers) VALUES
('Headache', 'Neurological', ARRAY['Stress', 'Dehydration', 'Lack of sleep']),
('Fatigue', 'General', ARRAY['Poor sleep', 'Stress', 'Poor diet']),
('Nausea', 'Gastrointestinal', ARRAY['Food poisoning', 'Motion', 'Pregnancy']),
('Back Pain', 'Musculoskeletal', ARRAY['Poor posture', 'Heavy lifting', 'Stress']),
('Fever', 'General', ARRAY['Infection', 'Inflammation', 'Heat exposure']),
('Cough', 'Respiratory', ARRAY['Cold', 'Allergies', 'Smoking']),
('Anxiety', 'Mental Health', ARRAY['Stress', 'Caffeine', 'Life changes']),
('Insomnia', 'Sleep', ARRAY['Stress', 'Caffeine', 'Screen time']),
('Dizziness', 'Neurological', ARRAY['Dehydration', 'Low blood sugar', 'Standing quickly']),
('Chest Pain', 'Cardiovascular', ARRAY['Exercise', 'Stress', 'Heart conditions']),
('Shortness of Breath', 'Respiratory', ARRAY['Exercise', 'Asthma', 'Anxiety']),
('Joint Pain', 'Musculoskeletal', ARRAY['Weather changes', 'Overuse', 'Arthritis']),
('Stomach Pain', 'Gastrointestinal', ARRAY['Food intolerance', 'Stress', 'Infection']),
('Skin Rash', 'Dermatological', ARRAY['Allergies', 'New products', 'Stress']),
('Depression', 'Mental Health', ARRAY['Life events', 'Seasonal changes', 'Isolation']);

-- Add RLS policies for new tables
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connected_fitness_apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medication_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.symptoms_library ENABLE ROW LEVEL SECURITY;

-- User settings policies
CREATE POLICY "Users can view their own settings" ON public.user_settings FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert their own settings" ON public.user_settings FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own settings" ON public.user_settings FOR UPDATE USING (user_id = auth.uid());

-- Connected fitness apps policies
CREATE POLICY "Users can view their own fitness apps" ON public.connected_fitness_apps FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert their own fitness apps" ON public.connected_fitness_apps FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own fitness apps" ON public.connected_fitness_apps FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete their own fitness apps" ON public.connected_fitness_apps FOR DELETE USING (user_id = auth.uid());

-- Medication info policies (public read access)
CREATE POLICY "Anyone can view medication info" ON public.medication_info FOR SELECT TO authenticated USING (true);

-- Symptoms library policies (public read access)
CREATE POLICY "Anyone can view symptoms library" ON public.symptoms_library FOR SELECT TO authenticated USING (true);

-- Create function to decode South African ID
CREATE OR REPLACE FUNCTION public.decode_sa_id(id_number TEXT)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  birth_year INTEGER;
  birth_month INTEGER;
  birth_day INTEGER;
  gender_digit INTEGER;
  citizenship_digit INTEGER;
  current_year INTEGER;
  age INTEGER;
  gender TEXT;
  citizenship TEXT;
  birth_date DATE;
BEGIN
  -- Validate ID number length
  IF LENGTH(id_number) != 13 THEN
    RETURN jsonb_build_object('error', 'Invalid ID number length');
  END IF;

  -- Extract components
  birth_year := SUBSTRING(id_number FROM 1 FOR 2)::INTEGER;
  birth_month := SUBSTRING(id_number FROM 3 FOR 2)::INTEGER;
  birth_day := SUBSTRING(id_number FROM 5 FOR 2)::INTEGER;
  gender_digit := SUBSTRING(id_number FROM 7 FOR 4)::INTEGER;
  citizenship_digit := SUBSTRING(id_number FROM 11 FOR 1)::INTEGER;

  -- Determine full birth year (assume 1900s for years > 50, 2000s for <= 50)
  IF birth_year > 50 THEN
    birth_year := 1900 + birth_year;
  ELSE
    birth_year := 2000 + birth_year;
  END IF;

  -- Create birth date
  birth_date := MAKE_DATE(birth_year, birth_month, birth_day);

  -- Calculate age
  current_year := EXTRACT(YEAR FROM CURRENT_DATE);
  age := current_year - birth_year;
  
  -- Adjust age if birthday hasn't occurred this year
  IF EXTRACT(DOY FROM CURRENT_DATE) < EXTRACT(DOY FROM birth_date) THEN
    age := age - 1;
  END IF;

  -- Determine gender
  IF gender_digit < 5000 THEN
    gender := 'Female';
  ELSE
    gender := 'Male';
  END IF;

  -- Determine citizenship
  IF citizenship_digit = 0 THEN
    citizenship := 'South African Citizen';
  ELSE
    citizenship := 'Permanent Resident';
  END IF;

  RETURN jsonb_build_object(
    'birth_date', birth_date,
    'age', age,
    'gender', gender,
    'citizenship', citizenship,
    'valid', true
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('error', 'Invalid ID number format', 'valid', false);
END;
$$;
