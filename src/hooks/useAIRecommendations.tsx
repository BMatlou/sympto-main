
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface AIRecommendationsRequest {
  symptom: string;
  severity: number;
  associatedSymptoms?: string[];
}

interface AIRecommendations {
  symptomDescription: string;
  associatedSymptoms: string[];
  recommendedFoods: string[];
  recommendedBeverages: string[];
  exercises: string[];
  dietPlan: string[];
  reliefTips: string[];
  generatedAt: string;
  symptom: string;
  severity: number;
}

export const useAIRecommendations = (params: AIRecommendationsRequest) => {
  return useQuery({
    queryKey: ['aiRecommendations', params.symptom, params.severity],
    queryFn: async (): Promise<AIRecommendations> => {
      console.log('Fetching AI recommendations for:', params);
      
      const { data, error } = await supabase.functions.invoke('health-recommendations', {
        body: {
          symptom: params.symptom,
          severity: params.severity,
          associatedSymptoms: params.associatedSymptoms || []
        }
      });

      console.log('Supabase function response:', { data, error });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(`Failed to get recommendations: ${error.message}`);
      }

      if (!data) {
        throw new Error('No data received from recommendations service');
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to generate recommendations');
      }

      console.log('Successfully received AI recommendations:', data.recommendations);
      return data.recommendations;
    },
    enabled: !!(params.symptom && params.severity),
    staleTime: 1000 * 60 * 30, // Cache for 30 minutes
    retry: (failureCount, error) => {
      console.log(`Retry attempt ${failureCount}, error:`, error.message);
      
      // Don't retry on rate limit errors or authentication errors
      if (error.message.includes('Rate limit exceeded') || 
          error.message.includes('Invalid API key') ||
          error.message.includes('OpenAI API key not configured')) {
        return false;
      }
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => {
      const delay = Math.min(1000 * 2 ** attemptIndex, 10000);
      console.log(`Retrying in ${delay}ms...`);
      return delay;
    },
  });
};
