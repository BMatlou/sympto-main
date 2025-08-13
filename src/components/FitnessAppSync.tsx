
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Smartphone, Activity, RefreshCw } from 'lucide-react';
import { FitnessAppSyncService } from '@/services/fitnessAppSync';

const FitnessAppSync: React.FC = () => {
  const [syncingApps, setSyncingApps] = useState<string[]>([]);
  const fitnessService = FitnessAppSyncService.getInstance();

  const fitnessApps = [
    { name: 'Google Fit', id: 'google-fit', icon: '🏃‍♂️', connected: true },
    { name: 'Apple Health', id: 'apple-health', icon: '🍎', connected: false },
    { name: 'Fitbit', id: 'fitbit', icon: '⌚', connected: true },
    { name: 'Samsung Health', id: 'samsung-health', icon: '📱', connected: false },
    { name: 'Strava', id: 'strava', icon: '🚴‍♂️', connected: false },
    { name: 'MyFitnessPal', id: 'myfitnesspal', icon: '🥗', connected: false }
  ];

  const handleSync = async (appId: string) => {
    setSyncingApps(prev => [...prev, appId]);
    
    try {
      switch (appId) {
        case 'google-fit':
          await fitnessService.syncGoogleFit();
          break;
        case 'apple-health':
          await fitnessService.syncAppleHealth();
          break;
        case 'fitbit':
          await fitnessService.syncFitbit();
          break;
        default:
          // For other apps, simulate sync
          await new Promise(resolve => setTimeout(resolve, 2000));
          break;
      }
    } catch (error) {
      console.error(`Failed to sync ${appId}:`, error);
    } finally {
      setSyncingApps(prev => prev.filter(id => id !== appId));
    }
  };

  const handleConnect = (appId: string) => {
    // In a real app, this would open OAuth flow
    console.log(`Connecting to ${appId}`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Activity className="w-5 h-5 text-[#2ecac8]" />
          <span>Fitness App Integration</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3">
          {fitnessApps.map((app) => (
            <div key={app.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{app.icon}</span>
                <div>
                  <h4 className="font-medium">{app.name}</h4>
                  <p className="text-sm text-gray-600">
                    {app.connected ? 'Connected' : 'Not connected'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Badge variant={app.connected ? "default" : "secondary"}>
                  {app.connected ? 'Connected' : 'Available'}
                </Badge>
                
                {app.connected ? (
                  <Button
                    onClick={() => handleSync(app.id)}
                    disabled={syncingApps.includes(app.id)}
                    size="sm"
                    className="bg-[#2ecac8] hover:bg-[#338886]"
                  >
                    {syncingApps.includes(app.id) ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      'Sync'
                    )}
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleConnect(app.id)}
                    variant="outline"
                    size="sm"
                  >
                    Connect
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Tip:</strong> Connected apps will automatically sync your health data daily. 
            You can also manually sync anytime.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default FitnessAppSync;
