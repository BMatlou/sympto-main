
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useHealthGoals = () => {
  return useQuery({
    queryKey: ['healthGoals'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data, error } = await supabase
        .from('health_goals')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });
};

export const useAddHealthGoal = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (goalData: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');
      
      const { data, error } = await supabase
        .from('health_goals')
        .insert({ ...goalData, user_id: user.id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['healthGoals'] });
      toast.success('Health goal created!');
    },
    onError: (error) => {
      toast.error('Failed to create health goal: ' + error.message);
    }
  });
};

export const useUpdateHealthGoal = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...goalData }: any) => {
      const { data, error } = await supabase
        .from('health_goals')
        .update(goalData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['healthGoals'] });
      toast.success('Health goal updated!');
    },
    onError: (error) => {
      toast.error('Failed to update health goal: ' + error.message);
    }
  });
};
