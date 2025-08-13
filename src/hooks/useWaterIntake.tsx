
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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

export const useAddWaterIntake = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (amount: number) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');
      
      const { data, error } = await supabase
        .from('water_intake')
        .insert({ 
          amount_ml: amount, 
          user_id: user.id,
          recorded_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['waterIntake'] });
      queryClient.invalidateQueries({ queryKey: ['todayWater'] });
      toast.success('Water intake logged!');
    },
    onError: (error) => {
      toast.error('Failed to log water intake: ' + error.message);
    }
  });
};

export const useTodayWater = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return useQuery({
    queryKey: ['todayWater'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data, error } = await supabase
        .from('water_intake')
        .select('amount_ml')
        .eq('user_id', user.id)
        .gte('recorded_at', today.toISOString())
        .lt('recorded_at', tomorrow.toISOString());
      
      if (error) throw error;
      
      const totalWater = data?.reduce((sum, entry) => sum + entry.amount_ml, 0) || 0;
      return totalWater;
    }
  });
};
