
-- Create a comprehensive medication_info table to store detailed medication information
DROP TABLE IF EXISTS public.medication_info;

CREATE TABLE public.medication_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medication_name TEXT NOT NULL UNIQUE,
  side_effects TEXT[] DEFAULT '{}',
  masked_symptoms TEXT[] DEFAULT '{}',
  drug_interactions TEXT[] DEFAULT '{}',
  description TEXT,
  dosage_forms TEXT[],
  contraindications TEXT[],
  warnings TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.medication_info ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read medication info (it's reference data)
CREATE POLICY "Anyone can view medication info" ON public.medication_info
  FOR SELECT USING (true);

-- Insert some sample medication data
INSERT INTO public.medication_info (medication_name, side_effects, masked_symptoms, drug_interactions, description, dosage_forms, contraindications, warnings) VALUES
('Paracetamol', 
 ARRAY['Nausea', 'Skin rash', 'Liver damage (overdose)'], 
 ARRAY['Fever', 'Pain', 'Headache'], 
 ARRAY['Warfarin', 'Alcohol'], 
 'Pain reliever and fever reducer',
 ARRAY['Tablet', 'Capsule', 'Liquid', 'Suppository'],
 ARRAY['Severe liver disease', 'Allergy to paracetamol'],
 ARRAY['Do not exceed recommended dose', 'Avoid alcohol']
),
('Ibuprofen', 
 ARRAY['Stomach upset', 'Heartburn', 'Drowsiness', 'Kidney problems'], 
 ARRAY['Pain', 'Inflammation', 'Fever'], 
 ARRAY['Aspirin', 'Blood thinners', 'ACE inhibitors'], 
 'Anti-inflammatory pain reliever',
 ARRAY['Tablet', 'Capsule', 'Liquid', 'Gel'],
 ARRAY['Stomach ulcers', 'Kidney disease', 'Heart disease'],
 ARRAY['Take with food', 'Monitor kidney function']
),
('Aspirin', 
 ARRAY['Stomach bleeding', 'Heartburn', 'Nausea', 'Ringing in ears'], 
 ARRAY['Pain', 'Fever', 'Inflammation'], 
 ARRAY['Warfarin', 'Ibuprofen', 'Alcohol'], 
 'Pain reliever and blood thinner',
 ARRAY['Tablet', 'Chewable tablet', 'Powder'],
 ARRAY['Bleeding disorders', 'Children under 16', 'Stomach ulcers'],
 ARRAY['Take with food', 'Monitor for bleeding']
);
