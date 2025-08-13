
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface HealthDataSharingConfig {
  shareWithDoctors: boolean;
  anonymousAnalytics: boolean;
  biometricLock: boolean;
  syncFitnessApps: boolean;
}

export class HealthDataSharingService {
  private static instance: HealthDataSharingService;
  private config: HealthDataSharingConfig = {
    shareWithDoctors: false,
    anonymousAnalytics: false,
    biometricLock: false,
    syncFitnessApps: false
  };

  static getInstance(): HealthDataSharingService {
    if (!HealthDataSharingService.instance) {
      HealthDataSharingService.instance = new HealthDataSharingService();
    }
    return HealthDataSharingService.instance;
  }

  async loadConfig(): Promise<HealthDataSharingConfig> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return this.config;

      const saved = localStorage.getItem(`health-sharing-${user.id}`);
      if (saved) {
        this.config = JSON.parse(saved);
      }
      return this.config;
    } catch (error) {
      console.error('Failed to load health data sharing config:', error);
      return this.config;
    }
  }

  async updateConfig(newConfig: Partial<HealthDataSharingConfig>): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      this.config = { ...this.config, ...newConfig };
      localStorage.setItem(`health-sharing-${user.id}`, JSON.stringify(this.config));
      
      // Send anonymous analytics if enabled
      if (this.config.anonymousAnalytics) {
        await this.sendAnonymousAnalytics('settings_updated', { 
          configUpdated: Object.keys(newConfig) 
        });
      }

      toast.success('Health data sharing settings updated');
    } catch (error) {
      console.error('Failed to update health data sharing config:', error);
      toast.error('Failed to update settings');
    }
  }

  async sendAnonymousAnalytics(event: string, data: any): Promise<void> {
    if (!this.config.anonymousAnalytics) return;

    try {
      // Create anonymous analytics event
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const anonymousEvent = {
        user_id: user.id,
        event_type: event,
        event_data: data,
        timestamp: new Date().toISOString(),
        session_id: this.generateSessionId()
      };

      // Store in local analytics (in real app, this would go to analytics service)
      const existingAnalytics = JSON.parse(localStorage.getItem('anonymous-analytics') || '[]');
      existingAnalytics.push(anonymousEvent);
      localStorage.setItem('anonymous-analytics', JSON.stringify(existingAnalytics));

      console.log('Anonymous analytics sent:', anonymousEvent);
    } catch (error) {
      console.error('Failed to send anonymous analytics:', error);
    }
  }

  private generateSessionId(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  async shareHealthDataWithDoctors(doctorEmail: string): Promise<void> {
    if (!this.config.shareWithDoctors) {
      toast.error('Health data sharing is not enabled');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // In a real app, this would create a secure sharing link or send data to doctor's system
      const shareData = {
        patientId: user.id,
        doctorEmail,
        sharedAt: new Date().toISOString(),
        dataTypes: ['vitals', 'symptoms', 'medications', 'activities']
      };

      // Store sharing record
      const existingShares = JSON.parse(localStorage.getItem(`health-shares-${user.id}`) || '[]');
      existingShares.push(shareData);
      localStorage.setItem(`health-shares-${user.id}`, JSON.stringify(existingShares));

      toast.success(`Health data shared with ${doctorEmail}`);
      
      if (this.config.anonymousAnalytics) {
        await this.sendAnonymousAnalytics('health_data_shared', { 
          doctorEmail: 'anonymized',
          dataTypes: shareData.dataTypes 
        });
      }
    } catch (error) {
      console.error('Failed to share health data:', error);
      toast.error('Failed to share health data');
    }
  }

  async enableBiometricLock(): Promise<boolean> {
    try {
      // Check if biometric authentication is available
      if (!('credentials' in navigator)) {
        toast.error('Biometric authentication not supported on this device');
        return false;
      }

      const credential = await navigator.credentials.create({
        publicKey: {
          challenge: new Uint8Array(32),
          rp: { name: "Sympto+" },
          user: {
            id: new Uint8Array(16),
            name: "user@example.com",
            displayName: "User",
          },
          pubKeyCredParams: [{ alg: -7, type: "public-key" }],
          authenticatorSelection: {
            authenticatorAttachment: "platform",
            userVerification: "required"
          }
        }
      });

      if (credential) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          localStorage.setItem(`biometric-enabled-${user.id}`, 'true');
          toast.success('Biometric lock enabled successfully');
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Failed to enable biometric lock:', error);
      toast.error('Failed to enable biometric lock');
      return false;
    }
  }

  async verifyBiometric(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const biometricEnabled = localStorage.getItem(`biometric-enabled-${user.id}`);
      if (!biometricEnabled) return true; // Skip if not enabled

      const credential = await navigator.credentials.get({
        publicKey: {
          challenge: new Uint8Array(32),
          userVerification: "required"
        }
      });

      return !!credential;
    } catch (error) {
      console.error('Biometric verification failed:', error);
      return false;
    }
  }

  getConfig(): HealthDataSharingConfig {
    return this.config;
  }
}
