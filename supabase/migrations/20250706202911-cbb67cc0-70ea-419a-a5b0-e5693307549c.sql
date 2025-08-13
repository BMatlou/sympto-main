
-- Create user profiles table
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  date_of_birth DATE,
  gender TEXT,
  height_cm INTEGER,
  weight_kg NUMERIC,
  phone TEXT,
  emergency_contact TEXT,
  medical_conditions TEXT[],
  allergies TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create medications table
CREATE TABLE public.medications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  frequency TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  instructions TEXT,
  prescribing_doctor TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create symptoms log table
CREATE TABLE public.symptoms_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  symptom_name TEXT NOT NULL,
  severity INTEGER CHECK (severity >= 1 AND severity <= 10),
  description TEXT,
  triggers TEXT[],
  location_data JSONB,
  environmental_data JSONB,
  notes TEXT,
  logged_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create appointments table
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  doctor_name TEXT NOT NULL,
  specialty TEXT,
  appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT,
  notes TEXT,
  status TEXT DEFAULT 'scheduled',
  type TEXT DEFAULT 'in-person',
  video_link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create medical records table
CREATE TABLE public.medical_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  record_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT,
  file_name TEXT,
  file_size INTEGER,
  date_of_record DATE,
  doctor_name TEXT,
  facility_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create devices table for storing user's connected health devices
CREATE TABLE public.devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  brand TEXT,
  model TEXT,
  is_connected BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create health metrics table
CREATE TABLE public.health_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  metric_type TEXT NOT NULL,
  value NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  additional_data JSONB,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  device_id UUID REFERENCES public.devices(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create water intake table
CREATE TABLE public.water_intake (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount_ml INTEGER NOT NULL,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create activity sessions table
CREATE TABLE public.activity_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  activity_type TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  calories_burned INTEGER,
  distance_meters NUMERIC,
  average_heart_rate INTEGER,
  notes TEXT,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ended_at TIMESTAMP WITH TIME ZONE,
  device_id UUID REFERENCES public.devices(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create nutrition log table
CREATE TABLE public.nutrition_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  meal_type TEXT NOT NULL,
  food_item TEXT NOT NULL,
  quantity NUMERIC,
  unit TEXT,
  calories INTEGER,
  macros JSONB,
  logged_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create medication reminders table
CREATE TABLE public.medication_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medication_id UUID REFERENCES public.medications(id) ON DELETE CASCADE NOT NULL,
  reminder_time TIME NOT NULL,
  days_of_week INTEGER[] NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create medication logs table
CREATE TABLE public.medication_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medication_id UUID REFERENCES public.medications(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  taken_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  dosage_taken TEXT,
  notes TEXT,
  skipped BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create health goals table
CREATE TABLE public.health_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  goal_type TEXT NOT NULL,
  target_value NUMERIC NOT NULL,
  current_value NUMERIC DEFAULT 0,
  unit TEXT NOT NULL,
  target_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.symptoms_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.water_intake ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nutrition_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medication_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medication_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_profiles
CREATE POLICY "Users can view their own profile" ON public.user_profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "Users can insert their own profile" ON public.user_profiles FOR INSERT WITH CHECK (id = auth.uid());
CREATE POLICY "Users can update their own profile" ON public.user_profiles FOR UPDATE USING (id = auth.uid());

-- Create RLS policies for medications
CREATE POLICY "Users can view their own medications" ON public.medications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert their own medications" ON public.medications FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own medications" ON public.medications FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete their own medications" ON public.medications FOR DELETE USING (user_id = auth.uid());

-- Create RLS policies for symptoms_log
CREATE POLICY "Users can view their own symptoms" ON public.symptoms_log FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert their own symptoms" ON public.symptoms_log FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own symptoms" ON public.symptoms_log FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete their own symptoms" ON public.symptoms_log FOR DELETE USING (user_id = auth.uid());

-- Create RLS policies for appointments
CREATE POLICY "Users can view their own appointments" ON public.appointments FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert their own appointments" ON public.appointments FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own appointments" ON public.appointments FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete their own appointments" ON public.appointments FOR DELETE USING (user_id = auth.uid());

-- Create RLS policies for medical_records
CREATE POLICY "Users can view their own medical records" ON public.medical_records FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert their own medical records" ON public.medical_records FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own medical records" ON public.medical_records FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete their own medical records" ON public.medical_records FOR DELETE USING (user_id = auth.uid());

-- Create RLS policies for devices
CREATE POLICY "Users can view their own devices" ON public.devices FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create their own devices" ON public.devices FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own devices" ON public.devices FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete their own devices" ON public.devices FOR DELETE USING (user_id = auth.uid());

-- Create RLS policies for health_metrics
CREATE POLICY "Users can view their own health metrics" ON public.health_metrics FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create their own health metrics" ON public.health_metrics FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own health metrics" ON public.health_metrics FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete their own health metrics" ON public.health_metrics FOR DELETE USING (user_id = auth.uid());

-- Create RLS policies for water_intake
CREATE POLICY "Users can view their own water intake" ON public.water_intake FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create their own water intake" ON public.water_intake FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own water intake" ON public.water_intake FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete their own water intake" ON public.water_intake FOR DELETE USING (user_id = auth.uid());

-- Create RLS policies for activity_sessions
CREATE POLICY "Users can view their own activity sessions" ON public.activity_sessions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create their own activity sessions" ON public.activity_sessions FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own activity sessions" ON public.activity_sessions FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete their own activity sessions" ON public.activity_sessions FOR DELETE USING (user_id = auth.uid());

-- Create RLS policies for nutrition_log
CREATE POLICY "Users can view their own nutrition log" ON public.nutrition_log FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create their own nutrition log" ON public.nutrition_log FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own nutrition log" ON public.nutrition_log FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete their own nutrition log" ON public.nutrition_log FOR DELETE USING (user_id = auth.uid());

-- Create RLS policies for medication_reminders
CREATE POLICY "Users can view their own medication reminders" ON public.medication_reminders FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.medications WHERE medications.id = medication_reminders.medication_id AND medications.user_id = auth.uid()));
CREATE POLICY "Users can create their own medication reminders" ON public.medication_reminders FOR INSERT 
WITH CHECK (EXISTS (SELECT 1 FROM public.medications WHERE medications.id = medication_reminders.medication_id AND medications.user_id = auth.uid()));
CREATE POLICY "Users can update their own medication reminders" ON public.medication_reminders FOR UPDATE 
USING (EXISTS (SELECT 1 FROM public.medications WHERE medications.id = medication_reminders.medication_id AND medications.user_id = auth.uid()));
CREATE POLICY "Users can delete their own medication reminders" ON public.medication_reminders FOR DELETE 
USING (EXISTS (SELECT 1 FROM public.medications WHERE medications.id = medication_reminders.medication_id AND medications.user_id = auth.uid()));

-- Create RLS policies for medication_logs
CREATE POLICY "Users can view their own medication logs" ON public.medication_logs FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create their own medication logs" ON public.medication_logs FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own medication logs" ON public.medication_logs FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete their own medication logs" ON public.medication_logs FOR DELETE USING (user_id = auth.uid());

-- Create RLS policies for health_goals
CREATE POLICY "Users can view their own health goals" ON public.health_goals FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create their own health goals" ON public.health_goals FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own health goals" ON public.health_goals FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete their own health goals" ON public.health_goals FOR DELETE USING (user_id = auth.uid());

-- Create RLS policies for notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update their own notifications" ON public.notifications FOR UPDATE USING (user_id = auth.uid());

-- Create storage bucket for medical records
INSERT INTO storage.buckets (id, name, public) VALUES ('medical-records', 'medical-records', false);

-- Create storage policies for medical records
CREATE POLICY "Users can upload their own medical records" ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'medical-records' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own medical records" ON storage.objects FOR SELECT 
USING (bucket_id = 'medical-records' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create indexes for better performance
CREATE INDEX idx_health_metrics_user_id_type ON public.health_metrics(user_id, metric_type);
CREATE INDEX idx_health_metrics_recorded_at ON public.health_metrics(recorded_at);
CREATE INDEX idx_water_intake_user_id_date ON public.water_intake(user_id, DATE(recorded_at));
CREATE INDEX idx_activity_sessions_user_id ON public.activity_sessions(user_id);
CREATE INDEX idx_nutrition_log_user_id_date ON public.nutrition_log(user_id, DATE(logged_at));
CREATE INDEX idx_medication_logs_user_id ON public.medication_logs(user_id);
CREATE INDEX idx_health_goals_user_id ON public.health_goals(user_id);
CREATE INDEX idx_symptoms_log_user_id ON public.symptoms_log(user_id);
CREATE INDEX idx_appointments_user_id ON public.appointments(user_id);
CREATE INDEX idx_medications_user_id ON public.medications(user_id);

-- Create function to calculate daily health score
CREATE OR REPLACE FUNCTION public.calculate_health_score(user_uuid UUID, target_date DATE DEFAULT CURRENT_DATE)
RETURNS NUMERIC AS $$
DECLARE
  score NUMERIC := 0;
  step_score NUMERIC := 0;
  water_score NUMERIC := 0;
  sleep_score NUMERIC := 0;
  activity_score NUMERIC := 0;
BEGIN
  -- Steps score (out of 25 points, target: 10000 steps)
  SELECT LEAST(25, (COALESCE(SUM(value), 0) / 10000.0) * 25) INTO step_score
  FROM public.health_metrics 
  WHERE user_id = user_uuid 
    AND metric_type = 'steps' 
    AND DATE(recorded_at) = target_date;
  
  -- Water intake score (out of 25 points, target: 2000ml)
  SELECT LEAST(25, (COALESCE(SUM(amount_ml), 0) / 2000.0) * 25) INTO water_score
  FROM public.water_intake 
  WHERE user_id = user_uuid 
    AND DATE(recorded_at) = target_date;
  
  -- Sleep score (out of 25 points, target: 8 hours)
  SELECT LEAST(25, (COALESCE(AVG(value), 0) / 8.0) * 25) INTO sleep_score
  FROM public.health_metrics 
  WHERE user_id = user_uuid 
    AND metric_type = 'sleep' 
    AND DATE(recorded_at) = target_date;
  
  -- Activity score (out of 25 points, target: 30 minutes)
  SELECT LEAST(25, (COALESCE(SUM(duration_minutes), 0) / 30.0) * 25) INTO activity_score
  FROM public.activity_sessions 
  WHERE user_id = user_uuid 
    AND DATE(started_at) = target_date;
  
  score := step_score + water_score + sleep_score + activity_score;
  
  RETURN ROUND(score / 10.0, 1); -- Convert to 0-10 scale
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger function for updating updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at columns
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER update_medications_updated_at BEFORE UPDATE ON public.medications FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER update_devices_updated_at BEFORE UPDATE ON public.devices FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER update_health_goals_updated_at BEFORE UPDATE ON public.health_goals FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
