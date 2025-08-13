
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Health Metrics hooks
export const useHealthMetrics = (metricType?: string, dateRange?: { from: Date; to: Date }) => {
  return useQuery({
    queryKey: ['healthMetrics', metricType, dateRange],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      let query = supabase
        .from('health_metrics')
        .select('*')
        .eq('user_id', user.id)
        .order('recorded_at', { ascending: false });

      if (metricType) {
        query = query.eq('metric_type', metricType);
      }

      if (dateRange) {
        query = query
          .gte('recorded_at', dateRange.from.toISOString())
          .lte('recorded_at', dateRange.to.toISOString());
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data;
    }
  });
};

export const useAddHealthMetric = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (metricData: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');
      
      const { data, error } = await supabase
        .from('health_metrics')
        .insert({ ...metricData, user_id: user.id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['healthMetrics'] });
      toast.success('Health metric recorded successfully!');
    },
    onError: (error) => {
      toast.error('Failed to record health metric: ' + error.message);
    }
  });
};

export const useHealthScore = () => {
  return useQuery({
    queryKey: ['healthScore'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data, error } = await supabase.rpc('calculate_health_score', {
        user_uuid: user.id
      });
      
      if (error) throw error;
      return data || 0;
    }
  });
};

export const useTodaySteps = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return useQuery({
    queryKey: ['todaySteps'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data, error } = await supabase
        .from('health_metrics')
        .select('value')
        .eq('user_id', user.id)
        .eq('metric_type', 'steps')
        .gte('recorded_at', today.toISOString())
        .lt('recorded_at', tomorrow.toISOString());
      
      if (error) throw error;
      
      const totalSteps = data?.reduce((sum, record) => sum + Number(record.value), 0) || 0;
      return totalSteps;
    }
  });
};

export const useTodayHeartRate = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return useQuery({
    queryKey: ['todayHeartRate'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data, error } = await supabase
        .from('health_metrics')
        .select('value')
        .eq('user_id', user.id)
        .eq('metric_type', 'heart_rate')
        .gte('recorded_at', today.toISOString())
        .lt('recorded_at', tomorrow.toISOString())
        .order('recorded_at', { ascending: false })
        .limit(1);
      
      if (error) throw error;
      
      return data?.[0]?.value || 72; // Default heart rate
    }
  });
};
