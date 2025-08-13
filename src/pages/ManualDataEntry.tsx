
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Activity, Heart, Footprints, Scale, Thermometer, Droplets } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAddHealthMetric } from '@/hooks/useHealthMetrics';
import { toast } from 'sonner';

const ManualDataEntry = () => {
  const navigate = useNavigate();
  const addHealthMetricMutation = useAddHealthMetric();

  const [formData, setFormData] = useState({
    steps: '',
    heartRate: '',
    bloodPressureSystolic: '',
    bloodPressureDiastolic: '',
    weight: '',
    temperature: '',
    bloodSugar: '',
    oxygenSaturation: ''
  });

  const handleSubmit = async (metricType: string, value: string, unit: string) => {
    if (!value) {
      toast.error('Please enter a value');
      return;
    }

    try {
      const numericValue = parseFloat(value);
      if (isNaN(numericValue)) {
        toast.error('Please enter a valid number');
        return;
      }

      await addHealthMetricMutation.mutateAsync({
        metric_type: metricType,
        value: numericValue,
        unit: unit,
        recorded_at: new Date().toISOString()
      });

      // Clear the specific field
      setFormData(prev => ({ ...prev, [getFieldKey(metricType)]: '' }));
      
    } catch (error) {
      console.error('Error adding health metric:', error);
    }
  };

  const getFieldKey = (metricType: string) => {
    const keyMap: Record<string, string> = {
      'steps': 'steps',
      'heart_rate': 'heartRate',
      'blood_pressure': 'bloodPressureSystolic',
      'weight': 'weight',
      'temperature': 'temperature',
      'blood_sugar': 'bloodSugar',
      'oxygen_saturation': 'oxygenSaturation'
    };
    return keyMap[metricType] || metricType;
  };

  const handleBloodPressureSubmit = async () => {
    if (!formData.bloodPressureSystolic || !formData.bloodPressureDiastolic) {
      toast.error('Please enter both systolic and diastolic values');
      return;
    }

    try {
      const systolic = parseFloat(formData.bloodPressureSystolic);
      const diastolic = parseFloat(formData.bloodPressureDiastolic);
      
      if (isNaN(systolic) || isNaN(diastolic)) {
        toast.error('Please enter valid numbers');
        return;
      }

      await addHealthMetricMutation.mutateAsync({
        metric_type: 'blood_pressure',
        value: systolic,
        unit: 'mmHg',
        additional_data: { diastolic: diastolic },
        recorded_at: new Date().toISOString()
      });

      setFormData(prev => ({ 
        ...prev, 
        bloodPressureSystolic: '', 
        bloodPressureDiastolic: '' 
      }));
      
    } catch (error) {
      console.error('Error adding blood pressure:', error);
    }
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
        <h1 className="text-2xl font-bold text-gray-900">Manual Data Entry</h1>
      </div>

      <Tabs defaultValue="vitals" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="vitals">Vitals</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="vitals" className="space-y-4">
          {/* Heart Rate */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-lg">
                <Heart className="w-5 h-5 text-red-500" />
                <span>Heart Rate</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex space-x-3">
                <div className="flex-1">
                  <Label htmlFor="heartRate">BPM</Label>
                  <Input
                    id="heartRate"
                    type="number"
                    value={formData.heartRate}
                    onChange={(e) => setFormData({...formData, heartRate: e.target.value})}
                    placeholder="72"
                    min="30"
                    max="220"
                  />
                </div>
                <div className="flex items-end">
                  <Button 
                    onClick={() => handleSubmit('heart_rate', formData.heartRate, 'bpm')}
                    disabled={addHealthMetricMutation.isPending}
                    className="bg-[#2ecac8] hover:bg-[#338886]"
                  >
                    Save
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Blood Pressure */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-lg">
                <Activity className="w-5 h-5 text-blue-500" />
                <span>Blood Pressure</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex space-x-3">
                <div className="flex-1">
                  <Label htmlFor="systolic">Systolic</Label>
                  <Input
                    id="systolic"
                    type="number"
                    value={formData.bloodPressureSystolic}
                    onChange={(e) => setFormData({...formData, bloodPressureSystolic: e.target.value})}
                    placeholder="120"
                    min="70"
                    max="250"
                  />
                </div>
                <div className="flex-1">
                  <Label htmlFor="diastolic">Diastolic</Label>
                  <Input
                    id="diastolic"
                    type="number"
                    value={formData.bloodPressureDiastolic}
                    onChange={(e) => setFormData({...formData, bloodPressureDiastolic: e.target.value})}
                    placeholder="80"
                    min="40"
                    max="150"
                  />
                </div>
                <div className="flex items-end">
                  <Button 
                    onClick={handleBloodPressureSubmit}
                    disabled={addHealthMetricMutation.isPending}
                    className="bg-[#2ecac8] hover:bg-[#338886]"
                  >
                    Save
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Weight */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-lg">
                <Scale className="w-5 h-5 text-purple-500" />
                <span>Weight</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex space-x-3">
                <div className="flex-1">
                  <Label htmlFor="weight">Kilograms</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    value={formData.weight}
                    onChange={(e) => setFormData({...formData, weight: e.target.value})}
                    placeholder="70.5"
                    min="20"
                    max="300"
                  />
                </div>
                <div className="flex items-end">
                  <Button 
                    onClick={() => handleSubmit('weight', formData.weight, 'kg')}
                    disabled={addHealthMetricMutation.isPending}
                    className="bg-[#2ecac8] hover:bg-[#338886]"
                  >
                    Save
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Temperature */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-lg">
                <Thermometer className="w-5 h-5 text-orange-500" />
                <span>Body Temperature</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex space-x-3">
                <div className="flex-1">
                  <Label htmlFor="temperature">Celsius</Label>
                  <Input
                    id="temperature"
                    type="number"
                    step="0.1"
                    value={formData.temperature}
                    onChange={(e) => setFormData({...formData, temperature: e.target.value})}
                    placeholder="36.5"
                    min="30"
                    max="45"
                  />
                </div>
                <div className="flex items-end">
                  <Button 
                    onClick={() => handleSubmit('temperature', formData.temperature, '°C')}
                    disabled={addHealthMetricMutation.isPending}
                    className="bg-[#2ecac8] hover:bg-[#338886]"
                  >
                    Save
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Blood Sugar */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-lg">
                <Droplets className="w-5 h-5 text-red-400" />
                <span>Blood Sugar</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex space-x-3">
                <div className="flex-1">
                  <Label htmlFor="bloodSugar">mg/dL</Label>
                  <Input
                    id="bloodSugar"
                    type="number"
                    value={formData.bloodSugar}
                    onChange={(e) => setFormData({...formData, bloodSugar: e.target.value})}
                    placeholder="100"
                    min="30"
                    max="500"
                  />
                </div>
                <div className="flex items-end">
                  <Button 
                    onClick={() => handleSubmit('blood_sugar', formData.bloodSugar, 'mg/dL')}
                    disabled={addHealthMetricMutation.isPending}
                    className="bg-[#2ecac8] hover:bg-[#338886]"
                  >
                    Save
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Oxygen Saturation */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-lg">
                <Activity className="w-5 h-5 text-cyan-500" />
                <span>Oxygen Saturation</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex space-x-3">
                <div className="flex-1">
                  <Label htmlFor="oxygenSaturation">%</Label>
                  <Input
                    id="oxygenSaturation"
                    type="number"
                    value={formData.oxygenSaturation}
                    onChange={(e) => setFormData({...formData, oxygenSaturation: e.target.value})}
                    placeholder="98"
                    min="70"
                    max="100"
                  />
                </div>
                <div className="flex items-end">
                  <Button 
                    onClick={() => handleSubmit('oxygen_saturation', formData.oxygenSaturation, '%')}
                    disabled={addHealthMetricMutation.isPending}
                    className="bg-[#2ecac8] hover:bg-[#338886]"
                  >
                    Save
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          {/* Steps */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-lg">
                <Footprints className="w-5 h-5 text-green-500" />
                <span>Steps</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex space-x-3">
                <div className="flex-1">
                  <Label htmlFor="steps">Number of Steps</Label>
                  <Input
                    id="steps"
                    type="number"
                    value={formData.steps}
                    onChange={(e) => setFormData({...formData, steps: e.target.value})}
                    placeholder="10000"
                    min="0"
                    max="100000"
                  />
                </div>
                <div className="flex items-end">
                  <Button 
                    onClick={() => handleSubmit('steps', formData.steps, 'steps')}
                    disabled={addHealthMetricMutation.isPending}
                    className="bg-[#2ecac8] hover:bg-[#338886]"
                  >
                    Save
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-8">
        <Button 
          onClick={() => navigate('/vitals')}
          variant="outline"
          className="w-full"
        >
          View All Vitals
        </Button>
      </div>
    </div>
  );
};

export default ManualDataEntry;
