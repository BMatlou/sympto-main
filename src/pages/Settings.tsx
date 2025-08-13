import { useState } from "react";
import { ArrowLeft, Bell, Shield, Database, Smartphone, Moon, Sun, Monitor } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUserSettings } from "@/hooks/useUserSettings";
import { useUpdateUserSettings } from "@/hooks/useUserSettings";
import { toast } from "sonner";

const Settings = () => {
  const navigate = useNavigate();
  const { data: settings } = useUserSettings();
  const updateSettings = useUpdateUserSettings();
  const [theme, setTheme] = useState("system");

  // Parse notification preferences safely
  const getNotificationPreferences = () => {
    if (!settings?.notification_preferences) {
      return {
        medication_reminders: true,
        symptom_alerts: false,
        appointment_reminders: true,
        health_insights: true,
        push_notifications: true,
        email_notifications: false,
      };
    }

    // Ensure we have the right type
    if (typeof settings.notification_preferences === 'object' && settings.notification_preferences !== null) {
      return settings.notification_preferences as {
        medication_reminders: boolean;
        symptom_alerts: boolean;
        appointment_reminders: boolean;
        health_insights: boolean;
        push_notifications: boolean;
        email_notifications: boolean;
      };
    }

    // Fallback for invalid data
    return {
      medication_reminders: true,
      symptom_alerts: false,
      appointment_reminders: true,
      health_insights: true,
      push_notifications: true,
      email_notifications: false,
    };
  };

  const notificationPrefs = getNotificationPreferences();

  const updateNotificationPreference = async (key: string, value: boolean) => {
    const updatedPrefs = {
      ...notificationPrefs,
      [key]: value
    };

    try {
      await updateSettings.mutateAsync({
        notification_preferences: updatedPrefs
      });
    } catch (error) {
      console.error('Failed to update notification preference:', error);
    }
  };

  const updateBooleanSetting = async (key: string, value: boolean) => {
    try {
      await updateSettings.mutateAsync({
        [key]: value
      });
    } catch (error) {
      console.error(`Failed to update ${key}:`, error);
    }
  };

  const settingsGroups = [
    {
      title: "Notifications",
      icon: Bell,
      items: [
        {
          label: "Medication Reminders",
          description: "Get reminded when it's time to take your medication",
          checked: notificationPrefs.medication_reminders,
          onChange: (checked: boolean) => updateNotificationPreference('medication_reminders', checked)
        },
        {
          label: "Symptom Alerts",
          description: "Receive alerts about symptom patterns",
          checked: notificationPrefs.symptom_alerts,
          onChange: (checked: boolean) => updateNotificationPreference('symptom_alerts', checked)
        },
        {
          label: "Appointment Reminders",
          description: "Get reminded about upcoming appointments",
          checked: notificationPrefs.appointment_reminders,
          onChange: (checked: boolean) => updateNotificationPreference('appointment_reminders', checked)
        },
        {
          label: "Health Insights",
          description: "Receive personalized health insights",
          checked: notificationPrefs.health_insights,
          onChange: (checked: boolean) => updateNotificationPreference('health_insights', checked)
        },
        {
          label: "Push Notifications",
          description: "Enable push notifications on this device",
          checked: notificationPrefs.push_notifications,
          onChange: (checked: boolean) => updateNotificationPreference('push_notifications', checked)
        },
        {
          label: "Email Notifications",
          description: "Receive notifications via email",
          checked: notificationPrefs.email_notifications,
          onChange: (checked: boolean) => updateNotificationPreference('email_notifications', checked)
        }
      ]
    },
    {
      title: "Privacy & Security",
      icon: Shield,
      items: [
        {
          label: "Biometric Lock",
          description: "Use fingerprint or face recognition to unlock the app",
          checked: settings?.biometric_lock_enabled || false,
          onChange: (checked: boolean) => {
            updateBooleanSetting('biometric_lock_enabled', checked);
            localStorage.setItem('biometricLockEnabled', checked.toString());
          }
        }
      ]
    },
    {
      title: "Data & Sync",
      icon: Database,
      items: [
        {
          label: "Health Data Sharing",
          description: "Allow sharing of anonymized health data for research",
          checked: settings?.health_data_sharing_enabled || false,
          onChange: (checked: boolean) => updateBooleanSetting('health_data_sharing_enabled', checked)
        },
        {
          label: "Fitness App Sync",
          description: "Automatically sync data from connected fitness apps",
          checked: settings?.fitness_app_sync_enabled || false,
          onChange: (checked: boolean) => updateBooleanSetting('fitness_app_sync_enabled', checked)
        },
        {
          label: "Anonymous Analytics",
          description: "Help improve the app by sharing anonymous usage data",
          checked: settings?.anonymous_analytics_enabled || false,
          onChange: (checked: boolean) => updateBooleanSetting('anonymous_analytics_enabled', checked)
        }
      ]
    }
  ];

  return (
    <div className="p-4 pb-20 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors mr-3"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
      </div>

      {/* Theme Settings */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Monitor className="w-5 h-5" />
            <span>Appearance</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Theme</span>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant={theme === "light" ? "default" : "outline"}
                  onClick={() => setTheme("light")}
                  className="p-2"
                >
                  <Sun className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant={theme === "dark" ? "default" : "outline"}
                  onClick={() => setTheme("dark")}
                  className="p-2"
                >
                  <Moon className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant={theme === "system" ? "default" : "outline"}
                  onClick={() => setTheme("system")}
                  className="p-2"
                >
                  <Monitor className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings Groups */}
      <div className="space-y-6">
        {settingsGroups.map((group, groupIndex) => {
          const Icon = group.icon;
          return (
            <Card key={groupIndex}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Icon className="w-5 h-5" />
                  <span>{group.title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {group.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex items-start justify-between">
                      <div className="flex-1 mr-4">
                        <h4 className="text-sm font-medium text-gray-900">{item.label}</h4>
                        <p className="text-xs text-gray-600 mt-1">{item.description}</p>
                      </div>
                      <Switch
                        checked={item.checked}
                        onCheckedChange={item.onChange}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Advanced Settings */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Smartphone className="w-5 h-5" />
            <span>Device & Account</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate('/devices')}
            >
              Connected Devices
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => toast.info("Export functionality coming soon")}
            >
              Export Data
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50"
              onClick={() => {
                if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
                  toast.error("Account deletion not implemented yet");
                }
              }}
            >
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Version Info */}
      <div className="text-center mt-8 text-sm text-gray-500">
        <p>Sympto Health v1.0.0</p>
        <p>Made with ❤️ for better health tracking</p>
      </div>
    </div>
  );
};

export default Settings;
