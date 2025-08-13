
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Activity, Target, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAddHealthMetric } from '@/hooks/useSupabaseData';
import { toast } from 'sonner';

const StepsInput = () => {
  const navigate = useNavigate();
  const [steps, setSteps] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const addHealthMetric = useAddHealthMetric();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!steps || parseInt(steps) < 0) {
      toast.error('Please enter a valid number of steps');
      return;
    }

    setIsSubmitting(true);

    try {
      await addHealthMetric.mutateAsync({
        metric_type: 'steps',
        value: parseInt(steps),
        unit: 'steps',
        recorded_at: new Date().toISOString(),
      });

      toast.success('Steps logged successfully!');
      setSteps('');
      navigate('/');
    } catch (error) {
      console.error('Error logging steps:', error);
      toast.error('Failed to log steps');
    } finally {
      setIsSubmitting(false);
    }
  };

  const quickStepOptions = [1000, 2500, 5000, 7500, 10000];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-4 pb-20">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center mb-6">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors mr-3"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Log Steps</h1>
        </div>

        {/* Main Card */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-t-lg">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Activity className="w-8 h-8" />
            </div>
            <CardTitle className="text-2xl">Daily Steps</CardTitle>
            <p className="text-blue-100">Track your daily activity</p>
          </CardHeader>
          
          <CardContent className="p-6 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="steps" className="text-lg font-medium text-gray-700 mb-3 block">
                  Number of Steps
                </Label>
                <Input
                  id="steps"
                  type="number"
                  value={steps}
                  onChange={(e) => setSteps(e.target.value)}
                  placeholder="Enter your steps"
                  className="text-xl text-center py-4 border-2 focus:border-blue-500 transition-colors"
                  min="0"
                  max="100000"
                />
              </div>

              {/* Quick Select Options */}
              <div>
                <Label className="text-sm font-medium text-gray-600 mb-3 block">
                  Quick Select
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  {quickStepOptions.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setSteps(option.toString())}
                      className="p-3 bg-gray-100 hover:bg-blue-100 rounded-lg transition-colors text-sm font-medium"
                    >
                      {option.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting || !steps}
                className="w-full py-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {isSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Logging Steps...</span>
                  </div>
                ) : (
                  'Log Steps'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Info Cards */}
        <div className="grid grid-cols-1 gap-4 mt-6">
          <Card className="bg-gradient-to-r from-green-400 to-blue-400 text-white">
            <CardContent className="p-4 flex items-center space-x-3">
              <Target className="w-6 h-6" />
              <div>
                <p className="font-semibold">Daily Goal</p>
                <p className="text-sm opacity-90">10,000 steps recommended</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-purple-400 to-pink-400 text-white">
            <CardContent className="p-4 flex items-center space-x-3">
              <TrendingUp className="w-6 h-6" />
              <div>
                <p className="font-semibold">Stay Consistent</p>
                <p className="text-sm opacity-90">Track daily for better insights</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StepsInput;
