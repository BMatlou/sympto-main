
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useNutritionLog = () => {
  return useQuery({
    queryKey: ['nutritionLog'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data, error } = await supabase
        .from('nutrition_log')
        .select('*')
        .eq('user_id', user.id)
        .order('logged_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });
};

export const useAddNutritionEntry = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (nutritionData: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');
      
      const { data, error } = await supabase
        .from('nutrition_log')
        .insert({ ...nutritionData, user_id: user.id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nutritionLog'] });
      toast.success('Nutrition entry logged!');
    },
    onError: (error) => {
      toast.error('Failed to log nutrition entry: ' + error.message);
    }
  });
};

export const useTodayCalories = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return useQuery({
    queryKey: ['todayCalories'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data, error } = await supabase
        .from('nutrition_log')
        .select('calories')
        .eq('user_id', user.id)
        .gte('logged_at', today.toISOString())
        .lt('logged_at', tomorrow.toISOString());
      
      if (error) throw error;
      
      const totalCalories = data?.reduce((sum, entry) => sum + (entry.calories || 0), 0) || 0;
      return totalCalories;
    }
  });
};
