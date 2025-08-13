import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Smartphone, Watch, Heart, Thermometer, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useDevices, useAddDevice, useUpdateDevice } from "@/hooks/useDevices";

const Devices = () => {
  const navigate = useNavigate();
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    brand: "",
    model: "",
    is_connected: false
  });

  const { data: devices, isLoading } = useDevices();
  const addDeviceMutation = useAddDevice();
  const updateDeviceMutation = useUpdateDevice();

  const deviceTypes = [
    { value: "smartwatch", label: "Smart Watch", icon: Watch },
    { value: "fitness_tracker", label: "Fitness Tracker", icon: Activity },
    { value: "heart_monitor", label: "Heart Rate Monitor", icon: Heart },
    { value: "blood_pressure", label: "Blood Pressure Monitor", icon: Heart },
    { value: "thermometer", label: "Smart Thermometer", icon: Thermometer },
    { value: "smartphone", label: "Smartphone", icon: Smartphone },
  ];

  const getDeviceIcon = (type: string) => {
    const deviceType = deviceTypes.find(dt => dt.value === type);
    return deviceType?.icon || Smartphone;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDeviceMutation.mutateAsync(formData);
      setFormData({ name: "", type: "", brand: "", model: "", is_connected: false });
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding device:', error);
    }
  };

  const toggleConnection = async (deviceId: string, currentStatus: boolean) => {
    try {
      await updateDeviceMutation.mutateAsync({
        id: deviceId,
        is_connected: !currentStatus
      });
    } catch (error) {
      console.error('Error updating device:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 pb-20 max-w-md mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 pb-20 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors mr-3"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Connected Devices</h1>
        </div>
        <Button 
          onClick={() => setShowAddForm(true)}
          className="bg-[#2ecac8] hover:bg-[#338886] text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Device
        </Button>
      </div>

      {/* Add Device Form */}
      {showAddForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Add New Device</CardTitle>
            <CardDescription>Connect a health monitoring device</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Device Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="My Apple Watch"
                  required
                />
              </div>

              <div>
                <Label htmlFor="type">Device Type</Label>
                <select
                  id="type"
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2ecac8] focus:border-transparent"
                  required
                >
                  <option value="">Select device type...</option>
                  {deviceTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="brand">Brand</Label>
                <Input
                  id="brand"
                  value={formData.brand}
                  onChange={(e) => setFormData({...formData, brand: e.target.value})}
                  placeholder="Apple, Samsung, Fitbit..."
                />
              </div>

              <div>
                <Label htmlFor="model">Model</Label>
                <Input
                  id="model"
                  value={formData.model}
                  onChange={(e) => setFormData({...formData, model: e.target.value})}
                  placeholder="Watch Series 9, Galaxy Watch 6..."
                />
              </div>

              <div className="flex space-x-2">
                <Button type="submit" disabled={addDeviceMutation.isPending}>
                  {addDeviceMutation.isPending ? 'Adding...' : 'Add Device'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Devices List */}
      <div className="space-y-4">
        {devices && devices.length > 0 ? (
          devices.map((device: any) => {
            const IconComponent = getDeviceIcon(device.type);
            return (
              <Card key={device.id} className="border-l-4 border-l-[#2ecac8]">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-[#2ecac8]/10 rounded-full">
                        <IconComponent className="w-6 h-6 text-[#2ecac8]" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{device.name}</h3>
                        <p className="text-sm text-gray-600">
                          {device.brand} {device.model}
                        </p>
                        <p className="text-xs text-gray-500">
                          {deviceTypes.find(dt => dt.value === device.type)?.label}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Button
                        size="sm"
                        variant={device.is_connected ? "default" : "outline"}
                        onClick={() => toggleConnection(device.id, device.is_connected)}
                        className={device.is_connected ? "bg-green-500 hover:bg-green-600" : ""}
                      >
                        {device.is_connected ? "Connected" : "Connect"}
                      </Button>
                      <p className="text-xs text-gray-500 mt-1">
                        {device.is_connected ? "Syncing data" : "Not connected"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <Smartphone className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Devices Connected</h3>
              <p className="text-gray-600 mb-4">
                Connect your health monitoring devices to automatically sync your health data.
              </p>
              <Button 
                onClick={() => setShowAddForm(true)}
                className="bg-[#2ecac8] hover:bg-[#338886] text-white"
              >
                Add Your First Device
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Connection Instructions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">How to Connect Devices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-gray-600">
            <p>• <strong>Smart Watches:</strong> Install our companion app and enable health data sharing</p>
            <p>• <strong>Fitness Trackers:</strong> Connect via Bluetooth and authorize data access</p>
            <p>• <strong>Medical Devices:</strong> Follow device-specific pairing instructions</p>
            <p>• <strong>Smartphones:</strong> Enable health app integration in your phone settings</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Devices;
