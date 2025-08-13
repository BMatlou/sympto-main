import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Profile Management Hook (renamed from useUserProfile to useProfile)
export const useProfile = () => {
  return useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data;
    },
    enabled: true,
  });
};

// Backward compatibility alias
export const useUserProfile = useProfile;

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (profileData: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('user_profiles')
        .upsert({
          id: user.id,
          ...profileData,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      toast.success('Profile updated successfully!');
    },
    onError: (error: any) => {
      console.error('Profile update error:', error);
      toast.error('Failed to update profile: ' + error.message);
    },
  });
};

// Symptoms Log Hooks
export const useSymptoms = () => {
  return useQuery({
    queryKey: ['symptoms'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('symptoms_log')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });
};

export const useAddSymptom = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (symptomData: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('symptoms_log')
        .insert({
          ...symptomData,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['symptoms'] });
      toast.success('Symptom logged successfully!');
    },
    onError: (error: any) => {
      toast.error('Failed to log symptom: ' + error.message);
    },
  });
};

// Health Metrics Hooks
export const useHealthMetrics = () => {
  return useQuery({
    queryKey: ['health-metrics'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('health_metrics')
        .select('*')
        .eq('user_id', user.id)
        .order('recorded_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });
};

export const useAddHealthMetric = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (metricData: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('health_metrics')
        .insert({
          ...metricData,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['health-metrics'] });
      toast.success('Health metric recorded successfully!');
    },
    onError: (error: any) => {
      toast.error('Failed to record metric: ' + error.message);
    },
  });
};

// Water Intake Hooks
export const useWaterIntake = () => {
  return useQuery({
    queryKey: ['waterIntake'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data, error } = await supabase
        .from('water_intake')
        .select('*')
        .eq('user_id', user.id)
        .order('recorded_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });
};

// Medications Hooks
export const useMedications = () => {
  return useQuery({
    queryKey: ['medications'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('medications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });
};

export const useAddMedication = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (medicationData: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('medications')
        .insert({
          ...medicationData,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medications'] });
      toast.success('Medication added successfully!');
    },
    onError: (error: any) => {
      toast.error('Failed to add medication: ' + error.message);
    },
  });
};

// Appointments Hooks
export const useAppointments = () => {
  return useQuery({
    queryKey: ['appointments'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('user_id', user.id)
        .order('appointment_date', { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });
};

// Medical Records Hooks
export const useMedicalRecords = () => {
  return useQuery({
    queryKey: ['medical-records'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('medical_records')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });
};

export const useAddMedicalRecord = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (recordData: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('medical_records')
        .insert({
          ...recordData,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medical-records'] });
      toast.success('Medical record added successfully!');
    },
    onError: (error: any) => {
      toast.error('Failed to add medical record: ' + error.message);
    },
  });
};

// File upload hook with proper return type
export const useUploadFile = () => {
  return useMutation({
    mutationFn: async ({ file, folder }: { file: File; folder: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const fileName = `${user.id}/${Date.now()}-${file.name}`;
      
      const { data, error } = await supabase.storage
        .from('medical-files')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('medical-files')
        .getPublicUrl(fileName);

      return { publicUrl, path: fileName };
    },
    onError: (error: any) => {
      toast.error('File upload failed: ' + error.message);
    },
  });
};
