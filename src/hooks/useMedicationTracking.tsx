
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Medication reminders hooks
export const useMedicationReminders = () => {
  return useQuery({
    queryKey: ['medicationReminders'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data, error } = await supabase
        .from('medication_reminders')
        .select(`
          *,
          medications!inner(*)
        `)
        .eq('is_active', true)
        .eq('medications.user_id', user.id)
        .order('reminder_time', { ascending: true });
      
      if (error) throw error;
      return data;
    }
  });
};

export const useAddMedicationReminder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (reminderData: any) => {
      const { data, error } = await supabase
        .from('medication_reminders')
        .insert(reminderData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medicationReminders'] });
      toast.success('Medication reminder set!');
    },
    onError: (error) => {
      toast.error('Failed to set reminder: ' + error.message);
    }
  });
};

// Medication logs hooks
export const useMedicationLogs = () => {
  return useQuery({
    queryKey: ['medicationLogs'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data, error } = await supabase
        .from('medication_logs')
        .select(`
          *,
          medications!inner(*)
        `)
        .eq('user_id', user.id)
        .order('taken_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });
};

export const useLogMedicationTaken = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (logData: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');
      
      const { data, error } = await supabase
        .from('medication_logs')
        .insert({ ...logData, user_id: user.id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medicationLogs'] });
      toast.success('Medication intake logged!');
    },
    onError: (error) => {
      toast.error('Failed to log medication: ' + error.message);
    }
  });
};
