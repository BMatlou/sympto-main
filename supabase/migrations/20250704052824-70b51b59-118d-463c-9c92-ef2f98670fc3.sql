
-- Create health metrics table for storing daily health data like steps, heart rate, etc.
CREATE TABLE public.health_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  metric_type TEXT NOT NULL, -- 'steps', 'heart_rate', 'blood_pressure', 'weight', 'sleep', 'water_intake'
  value NUMERIC NOT NULL,
  unit TEXT NOT NULL, -- 'steps', 'bpm', 'mmHg', 'kg', 'hours', 'ml'
  additional_data JSONB, -- For complex data like blood pressure (systolic/diastolic)
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  device_id UUID REFERENCES public.devices(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create water intake tracking table
CREATE TABLE public.water_intake (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  amount_ml INTEGER NOT NULL,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create exercise/activity sessions table
CREATE TABLE public.activity_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  activity_type TEXT NOT NULL, -- 'walking', 'running', 'cycling', 'gym', 'yoga', etc.
  duration_minutes INTEGER NOT NULL,
  calories_burned INTEGER,
  distance_meters NUMERIC,
  average_heart_rate INTEGER,
  notes TEXT,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ended_at TIMESTAMP WITH TIME ZONE,
  device_id UUID REFERENCES public.devices(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create nutrition/meal tracking table
CREATE TABLE public.nutrition_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  meal_type TEXT NOT NULL, -- 'breakfast', 'lunch', 'dinner', 'snack'
  food_item TEXT NOT NULL,
  quantity NUMERIC,
  unit TEXT, -- 'grams', 'cups', 'pieces', etc.
  calories INTEGER,
  macros JSONB, -- {protein: 25, carbs: 30, fat: 15}
  logged_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create medication reminders table
CREATE TABLE public.medication_reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  medication_id UUID REFERENCES public.medications(id) ON DELETE CASCADE NOT NULL,
  reminder_time TIME NOT NULL,
  days_of_week INTEGER[] NOT NULL, -- [0,1,2,3,4,5,6] where 0=Sunday
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create medication logs table for tracking actual intake
CREATE TABLE public.medication_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  medication_id UUID REFERENCES public.medications(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  taken_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  dosage_taken TEXT,
  notes TEXT,
  skipped BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create health goals table
CREATE TABLE public.health_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  goal_type TEXT NOT NULL, -- 'steps', 'water', 'weight_loss', 'exercise_minutes', etc.
  target_value NUMERIC NOT NULL,
  current_value NUMERIC DEFAULT 0,
  unit TEXT NOT NULL,
  target_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for health_metrics
ALTER TABLE public.health_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own health metrics" 
  ON public.health_metrics 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own health metrics" 
  ON public.health_metrics 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own health metrics" 
  ON public.health_metrics 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own health metrics" 
  ON public.health_metrics 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Add RLS policies for water_intake
ALTER TABLE public.water_intake ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own water intake" 
  ON public.water_intake 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own water intake" 
  ON public.water_intake 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own water intake" 
  ON public.water_intake 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own water intake" 
  ON public.water_intake 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Add RLS policies for activity_sessions
ALTER TABLE public.activity_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own activity sessions" 
  ON public.activity_sessions 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own activity sessions" 
  ON public.activity_sessions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own activity sessions" 
  ON public.activity_sessions 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own activity sessions" 
  ON public.activity_sessions 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Add RLS policies for nutrition_log
ALTER TABLE public.nutrition_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own nutrition log" 
  ON public.nutrition_log 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own nutrition log" 
  ON public.nutrition_log 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own nutrition log" 
  ON public.nutrition_log 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own nutrition log" 
  ON public.nutrition_log 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Add RLS policies for medication_reminders
ALTER TABLE public.medication_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own medication reminders" 
  ON public.medication_reminders 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.medications 
    WHERE medications.id = medication_reminders.medication_id 
    AND medications.user_id = auth.uid()
  ));

CREATE POLICY "Users can create their own medication reminders" 
  ON public.medication_reminders 
  FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.medications 
    WHERE medications.id = medication_reminders.medication_id 
    AND medications.user_id = auth.uid()
  ));

CREATE POLICY "Users can update their own medication reminders" 
  ON public.medication_reminders 
  FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM public.medications 
    WHERE medications.id = medication_reminders.medication_id 
    AND medications.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete their own medication reminders" 
  ON public.medication_reminders 
  FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM public.medications 
    WHERE medications.id = medication_reminders.medication_id 
    AND medications.user_id = auth.uid()
  ));

-- Add RLS policies for medication_logs
ALTER TABLE public.medication_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own medication logs" 
  ON public.medication_logs 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own medication logs" 
  ON public.medication_logs 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own medication logs" 
  ON public.medication_logs 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own medication logs" 
  ON public.medication_logs 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Add RLS policies for health_goals
ALTER TABLE public.health_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own health goals" 
  ON public.health_goals 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own health goals" 
  ON public.health_goals 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own health goals" 
  ON public.health_goals 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own health goals" 
  ON public.health_goals 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_health_metrics_user_id_type ON public.health_metrics(user_id, metric_type);
CREATE INDEX idx_health_metrics_recorded_at ON public.health_metrics(recorded_at);
CREATE INDEX idx_water_intake_user_id_date ON public.water_intake(user_id, DATE(recorded_at));
CREATE INDEX idx_activity_sessions_user_id ON public.activity_sessions(user_id);
CREATE INDEX idx_nutrition_log_user_id_date ON public.nutrition_log(user_id, DATE(logged_at));
CREATE INDEX idx_medication_logs_user_id ON public.medication_logs(user_id);
CREATE INDEX idx_health_goals_user_id ON public.health_goals(user_id);

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
