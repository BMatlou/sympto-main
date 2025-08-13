import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAIRecommendations } from '@/hooks/useAIRecommendations';
import AIRecommendationsDisplay from '@/components/AIRecommendationsDisplay';

const SymptomRecommendations = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [symptomData, setSymptomData] = useState<{
    symptom: string;
    severity: number;
  } | null>(null);

  useEffect(() => {
    // Get symptom data from URL params or localStorage
    const symptom = searchParams.get('symptom') || localStorage.getItem('lastSymptom');
    const severity = parseInt(searchParams.get('severity') || localStorage.getItem('lastSeverity') || '5');

    console.log('Symptom Recommendations - Loading data:', { symptom, severity });

    if (symptom) {
      setSymptomData({ symptom, severity });
    } else {
      // Redirect back if no symptom data
      navigate('/symptoms');
    }
  }, [searchParams, navigate]);

  const { data: recommendations, isLoading, error, refetch } = useAIRecommendations({
    symptom: symptomData?.symptom || '',
    severity: symptomData?.severity || 5,
  });

  console.log('AI Recommendations Status:', { 
    isLoading, 
    error: error?.message, 
    hasRecommendations: !!recommendations,
    symptomData 
  });

  if (!symptomData) {
    return (
      <div className="p-4 pb-20 max-w-md mx-auto">
        <div className="text-center">
          <p className="text-gray-600">Loading recommendations...</p>
        </div>
      </div>
    );
  }

  const getErrorMessage = (errorMessage: string) => {
    if (errorMessage.includes('Rate limit exceeded')) {
      return 'OpenAI rate limit reached. Please wait a few minutes before trying again.';
    }
    if (errorMessage.includes('Invalid API key') || errorMessage.includes('OpenAI API key not configured')) {
      return 'OpenAI API key configuration issue. Please check your settings.';
    }
    if (errorMessage.includes('Failed to get recommendations')) {
      return 'Unable to connect to the AI service. Please check your internet connection and try again.';
    }
    return errorMessage;
  };

  return (
    <div className="p-4 pb-20 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center mb-6">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors mr-3"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">AI Health Recommendations</h1>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-[#2ecac8]" />
          <p className="text-gray-600">Generating personalized recommendations using AI...</p>
          <p className="text-sm text-gray-500 mt-2">This may take a moment while we analyze your symptoms</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800 font-medium">
            Failed to load AI recommendations
          </p>
          <p className="text-red-600 text-sm mt-1">
            {getErrorMessage(error.message)}
          </p>
          <div className="mt-3 space-x-2">
            <Button 
              onClick={() => refetch()}
              variant="outline"
              size="sm"
            >
              Try Again
            </Button>
            <Button 
              onClick={() => window.location.reload()}
              variant="outline"
              size="sm"
            >
              Refresh Page
            </Button>
          </div>
        </div>
      )}

      {/* Recommendations Display */}
      {recommendations && (
        <AIRecommendationsDisplay 
          symptom={symptomData.symptom}
          severity={symptomData.severity}
          recommendations={recommendations}
        />
      )}

      {/* Action Buttons */}
      <div className="mt-8 space-y-3">
        <Button 
          onClick={() => navigate('/add-record')}
          className="w-full bg-[#2ecac8] hover:bg-[#338886] text-white"
        >
          Log Another Symptom
        </Button>
        
        <Button 
          onClick={() => navigate('/book-appointment')}
          variant="outline"
          className="w-full"
        >
          Book Appointment
        </Button>

        <Button 
          onClick={() => navigate('/symptoms')}
          variant="ghost"
          className="w-full"
        >
          Back to Symptoms
        </Button>
      </div>
    </div>
  );
};

export default SymptomRecommendations;
