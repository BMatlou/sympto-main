import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Smartphone, Watch, Activity, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { useDevices } from '@/hooks/useDevices';
import { useAddHealthMetric } from '@/hooks/useHealthMetrics';
import { FitnessAppSyncService } from '@/services/fitnessAppSync';
import { HealthDataSharingService } from '@/services/healthDataSharing';
import { toast } from 'sonner';

interface DeviceSyncProps {
  onDataSynced?: () => void;
}

const DeviceSync: React.FC<DeviceSyncProps> = ({ onDataSynced }) => {
  const { data: devices } = useDevices();
  const addHealthMetricMutation = useAddHealthMetric();
  const [syncingDevices, setSyncingDevices] = useState<string[]>([]);
  const [fitnessAppsEnabled, setFitnessAppsEnabled] = useState(false);
  
  const fitnessService = FitnessAppSyncService.getInstance();
  const healthService = HealthDataSharingService.getInstance();

  useEffect(() => {
    checkFitnessAppsEnabled();
  }, []);

  const checkFitnessAppsEnabled = async () => {
    const config = await healthService.loadConfig();
    setFitnessAppsEnabled(config.syncFitnessApps);
  };

  const syncDeviceData = async (deviceId: string, deviceType: string) => {
    setSyncingDevices(prev => [...prev, deviceId]);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate realistic mock data based on device type
      const mockData = generateMockDeviceData(deviceType);
      
      // Add the mock data to health metrics
      for (const metric of mockData) {
        await addHealthMetricMutation.mutateAsync({
          ...metric,
          device_id: deviceId,
          recorded_at: new Date().toISOString()
        });
      }
      
      toast.success(`Synced data from ${deviceType}`);
      onDataSynced?.();
      
    } catch (error) {
      toast.error(`Failed to sync data from ${deviceType}`);
      console.error('Device sync error:', error);
    } finally {
      setSyncingDevices(prev => prev.filter(id => id !== deviceId));
    }
  };

  const generateMockDeviceData = (deviceType: string) => {
    const baseTime = new Date();
    const metrics = [];
    
    if (deviceType === 'fitness_tracker' || deviceType === 'smartwatch') {
      // Steps for today
      metrics.push({
        metric_type: 'steps',
        value: Math.floor(Math.random() * 5000) + 5000, // 5000-10000 steps
        unit: 'steps'
      });
      
      // Heart rate
      metrics.push({
        metric_type: 'heart_rate',
        value: Math.floor(Math.random() * 40) + 60, // 60-100 BPM
        unit: 'bpm'
      });
      
      // Sleep (hours from last night)
      metrics.push({
        metric_type: 'sleep',
        value: Math.round((Math.random() * 3 + 6) * 10) / 10, // 6-9 hours
        unit: 'hours'
      });
    }
    
    if (deviceType === 'blood_pressure_monitor') {
      // Blood pressure
      const systolic = Math.floor(Math.random() * 30) + 110; // 110-140
      const diastolic = Math.floor(Math.random() * 20) + 70; // 70-90
      
      metrics.push({
        metric_type: 'blood_pressure',
        value: systolic,
        unit: 'mmHg',
        additional_data: { diastolic }
      });
    }
    
    if (deviceType === 'smart_scale') {
      // Weight
      metrics.push({
        metric_type: 'weight',
        value: Math.round((Math.random() * 50 + 50) * 10) / 10, // 50-100 kg
        unit: 'kg'
      });
    }
    
    return metrics;
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'smartwatch':
      case 'fitness_tracker':
        return <Watch className="w-5 h-5" />;
      case 'smartphone':
        return <Smartphone className="w-5 h-5" />;
      default:
        return <Activity className="w-5 h-5" />;
    }
  };

  const syncFitnessApps = async () => {
    if (!fitnessAppsEnabled) {
      toast.error('Fitness app sync is not enabled. Please enable it in Settings.');
      return;
    }

    setSyncingDevices(prev => [...prev, 'fitness-apps']);
    
    try {
      // Sync from multiple fitness apps
      await Promise.all([
        fitnessService.syncGoogleFit(),
        fitnessService.syncFitbit()
      ]);
      
      toast.success('Fitness apps synced successfully');
      onDataSynced?.();
      
      // Send analytics if enabled
      await healthService.sendAnonymousAnalytics('fitness_apps_synced', {
        apps: ['google-fit', 'fitbit']
      });
      
    } catch (error) {
      toast.error('Failed to sync fitness apps');
      console.error('Fitness apps sync error:', error);
    } finally {
      setSyncingDevices(prev => prev.filter(id => id !== 'fitness-apps'));
    }
  };

  if (!devices || devices.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <Activity className="w-12 h-12 text-gray-400 mx-auto" />
            <div>
              <p className="text-gray-600 mb-2">No devices connected</p>
              <p className="text-sm text-gray-500 mb-4">
                Connect devices or enable fitness app sync to automatically track your health data
              </p>
            </div>
            
            <div className="space-y-2">
              <Button 
                onClick={() => window.location.href = '/devices'}
                variant="outline"
                className="w-full"
              >
                Add Device
              </Button>
              
              {fitnessAppsEnabled && (
                <Button
                  onClick={syncFitnessApps}
                  disabled={syncingDevices.includes('fitness-apps')}
                  className="w-full bg-[#2ecac8] hover:bg-[#338886]"
                >
                  {syncingDevices.includes('fitness-apps') ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Syncing Fitness Apps...
                    </>
                  ) : (
                    'Sync Fitness Apps'
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Connected Devices & Apps</h3>
        <div className="flex space-x-2">
          {fitnessAppsEnabled && (
            <Button
              onClick={syncFitnessApps}
              disabled={syncingDevices.includes('fitness-apps')}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              {syncingDevices.includes('fitness-apps') ? (
                <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
              ) : (
                <Activity className="w-3 h-3 mr-1" />
              )}
              Sync Apps
            </Button>
          )}
          
          <Button
            onClick={() => {
              devices
                .filter(device => device.is_connected)
                .forEach(device => syncDeviceData(device.id, device.type));
            }}
            variant="outline"
            size="sm"
            disabled={syncingDevices.length > 0}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${syncingDevices.length > 0 ? 'animate-spin' : ''}`} />
            Sync All
          </Button>
        </div>
      </div>

      {/* Fitness Apps Status */}
      {fitnessAppsEnabled && (
        <Card className="border-[#2ecac8] border-2">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-[#2ecac8]/10 rounded-lg">
                  <Activity className="w-5 h-5 text-[#2ecac8]" />
                </div>
                <div>
                  <h4 className="font-medium">Fitness Apps Integration</h4>
                  <p className="text-sm text-gray-600">
                    Google Fit, Fitbit, Apple Health
                  </p>
                </div>
              </div>
              
              <Badge className="bg-green-100 text-green-800">
                Active
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Existing device list */}
      <div className="grid gap-3">
        {devices.map((device) => (
          <Card key={device.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  {getDeviceIcon(device.type)}
                </div>
                <div>
                  <h4 className="font-medium">{device.name}</h4>
                  <p className="text-sm text-gray-600">
                    {device.brand} {device.model}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Badge 
                  variant={device.is_connected ? "default" : "secondary"}
                  className="flex items-center space-x-1"
                >
                  {device.is_connected ? (
                    <Wifi className="w-3 h-3" />
                  ) : (
                    <WifiOff className="w-3 h-3" />
                  )}
                  <span>{device.is_connected ? 'Connected' : 'Offline'}</span>
                </Badge>
                
                {device.is_connected && (
                  <Button
                    onClick={() => syncDeviceData(device.id, device.type)}
                    disabled={syncingDevices.includes(device.id)}
                    size="sm"
                    className="bg-[#2ecac8] hover:bg-[#338886]"
                  >
                    {syncingDevices.includes(device.id) ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      'Sync'
                    )}
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DeviceSync;
