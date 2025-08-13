
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, Activity, Droplets, TrendingUp } from 'lucide-react';
import { useTodaySteps, useTodayHeartRate } from '@/hooks/useHealthMetrics';
import { useWaterIntake } from '@/hooks/useSupabaseData';
import { useNavigate } from 'react-router-dom';

const MetricsGrid = () => {
  const navigate = useNavigate();
  const { data: todaySteps } = useTodaySteps();
  const { data: todayHeartRate } = useTodayHeartRate();
  const { data: waterIntake } = useWaterIntake();

  // Calculate today's water intake
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayWater = waterIntake?.filter(entry => {
    const entryDate = new Date(entry.recorded_at);
    entryDate.setHours(0, 0, 0, 0);
    return entryDate.getTime() === today.getTime();
  }).reduce((sum, entry) => sum + entry.amount_ml, 0) || 0;

  const metrics = [
    {
      icon: Heart,
      label: 'Heart Rate',
      value: `${todayHeartRate || 72} bpm`,
      color: 'text-red-500',
      bgColor: 'bg-red-50',
      gradientColor: 'from-red-400 to-red-500',
      onClick: () => navigate('/vitals')
    },
    {
      icon: Activity,
      label: 'Steps',
      value: `${todaySteps?.toLocaleString() || '0'}`,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      gradientColor: 'from-blue-400 to-blue-500',
      onClick: () => navigate('/steps-input')
    },
    {
      icon: Droplets,
      label: 'Water',
      value: `${Math.round(todayWater / 1000 * 10) / 10}L`,
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-50',
      gradientColor: 'from-cyan-400 to-cyan-500',
      onClick: () => navigate('/water')
    },
    {
      icon: TrendingUp,
      label: 'Insights',
      value: 'View All',
      color: 'text-green-500',
      bgColor: 'bg-green-50',
      gradientColor: 'from-green-400 to-green-500',
      onClick: () => navigate('/insights')
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-6 mb-8">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <Card 
            key={index} 
            className="cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:scale-105 overflow-hidden"
            onClick={metric.onClick}
          >
            <CardContent className="p-0">
              <div className={`p-4 bg-gradient-to-r ${metric.gradientColor} text-white relative`}>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-white/90">{metric.label}</p>
                    <p className="font-semibold text-sm">{metric.value}</p>
                  </div>
                </div>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-white/10 rounded-full" />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default MetricsGrid;
