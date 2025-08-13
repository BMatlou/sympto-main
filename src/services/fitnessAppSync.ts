
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface FitnessAppData {
  steps: number;
  heartRate: number;
  calories: number;
  distance: number;
  activeMinutes: number;
  sleepHours: number;
}

export class FitnessAppSyncService {
  private static instance: FitnessAppSyncService;

  static getInstance(): FitnessAppSyncService {
    if (!FitnessAppSyncService.instance) {
      FitnessAppSyncService.instance = new FitnessAppSyncService();
    }
    return FitnessAppSyncService.instance;
  }

  async syncGoogleFit(): Promise<FitnessAppData | null> {
    try {
      // Simulate Google Fit API call
      const mockData: FitnessAppData = {
        steps: Math.floor(Math.random() * 8000) + 2000,
        heartRate: Math.floor(Math.random() * 40) + 60,
        calories: Math.floor(Math.random() * 1000) + 1500,
        distance: Math.floor(Math.random() * 5000) + 1000,
        activeMinutes: Math.floor(Math.random() * 60) + 30,
        sleepHours: Math.round((Math.random() * 3 + 6) * 10) / 10
      };

      await this.saveHealthMetrics(mockData);
      toast.success('Google Fit data synced successfully');
      return mockData;
    } catch (error) {
      console.error('Failed to sync Google Fit:', error);
      toast.error('Failed to sync Google Fit');
      return null;
    }
  }

  async syncAppleHealth(): Promise<FitnessAppData | null> {
    try {
      // Simulate Apple Health API call
      const mockData: FitnessAppData = {
        steps: Math.floor(Math.random() * 8000) + 2000,
        heartRate: Math.floor(Math.random() * 40) + 60,
        calories: Math.floor(Math.random() * 1000) + 1500,
        distance: Math.floor(Math.random() * 5000) + 1000,
        activeMinutes: Math.floor(Math.random() * 60) + 30,
        sleepHours: Math.round((Math.random() * 3 + 6) * 10) / 10
      };

      await this.saveHealthMetrics(mockData);
      toast.success('Apple Health data synced successfully');
      return mockData;
    } catch (error) {
      console.error('Failed to sync Apple Health:', error);
      toast.error('Failed to sync Apple Health');
      return null;
    }
  }

  async syncFitbit(): Promise<FitnessAppData | null> {
    try {
      // Simulate Fitbit API call
      const mockData: FitnessAppData = {
        steps: Math.floor(Math.random() * 8000) + 2000,
        heartRate: Math.floor(Math.random() * 40) + 60,
        calories: Math.floor(Math.random() * 1000) + 1500,
        distance: Math.floor(Math.random() * 5000) + 1000,
        activeMinutes: Math.floor(Math.random() * 60) + 30,
        sleepHours: Math.round((Math.random() * 3 + 6) * 10) / 10
      };

      await this.saveHealthMetrics(mockData);
      toast.success('Fitbit data synced successfully');
      return mockData;
    } catch (error) {
      console.error('Failed to sync Fitbit:', error);
      toast.error('Failed to sync Fitbit');
      return null;
    }
  }

  private async saveHealthMetrics(data: FitnessAppData): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const now = new Date().toISOString();
    const metrics = [
      { metric_type: 'steps', value: data.steps, unit: 'steps' },
      { metric_type: 'heart_rate', value: data.heartRate, unit: 'bpm' },
      { metric_type: 'calories', value: data.calories, unit: 'kcal' },
      { metric_type: 'distance', value: data.distance, unit: 'meters' },
      { metric_type: 'active_minutes', value: data.activeMinutes, unit: 'minutes' },
      { metric_type: 'sleep', value: data.sleepHours, unit: 'hours' }
    ];

    for (const metric of metrics) {
      await supabase
        .from('health_metrics')
        .insert({
          user_id: user.id,
          metric_type: metric.metric_type,
          value: metric.value,
          unit: metric.unit,
          recorded_at: now
        });
    }
  }
}
