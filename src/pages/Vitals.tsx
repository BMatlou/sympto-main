
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useHealthMetrics, useTodaySteps, useTodayHeartRate } from "@/hooks/useHealthMetrics";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import DeviceSync from '@/components/DeviceSync';

const Vitals = () => {
  const navigate = useNavigate();
  const { data: healthMetrics, refetch } = useHealthMetrics();
  const { data: todaySteps } = useTodaySteps();
  const { data: todayHeartRate } = useTodayHeartRate();

  // Process data for charts
  const processMetricsForChart = (metricType: string) => {
    if (!healthMetrics) return [];
    
    return healthMetrics
      .filter(metric => metric.metric_type === metricType)
      .slice(-7) // Last 7 readings
      .map(metric => ({
        date: new Date(metric.recorded_at || metric.created_at!).toLocaleDateString(),
        value: Number(metric.value),
        time: new Date(metric.recorded_at || metric.created_at!).toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit' 
        })
      }));
  };

  const heartRateData = processMetricsForChart('heart_rate');
  const bloodPressureData = healthMetrics
    ?.filter(metric => metric.metric_type === 'blood_pressure')
    .slice(-7)
    .map(metric => ({
      date: new Date(metric.recorded_at || metric.created_at!).toLocaleDateString(),
      systolic: Number(metric.value),
      diastolic: metric.additional_data ? Number((metric.additional_data as any).diastolic) : 0,
      time: new Date(metric.recorded_at || metric.created_at!).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    })) || [];

  const weightData = processMetricsForChart('weight');
  const stepsData = processMetricsForChart('steps');

  const getLatestMetric = (metricType: string) => {
    return healthMetrics?.find(metric => metric.metric_type === metricType);
  };

  return (
    <div className="p-4 pb-20 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors mr-3"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Vitals & Metrics</h1>
        </div>
        
        <Button 
          onClick={() => navigate('/manual-data-entry')}
          className="bg-[#2ecac8] hover:bg-[#338886] text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Data
        </Button>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="charts">Charts</TabsTrigger>
          <TabsTrigger value="devices">Devices</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-600">{todaySteps}</div>
                <p className="text-sm text-gray-600">Steps Today</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-red-600">{todayHeartRate}</div>
                <p className="text-sm text-gray-600">Heart Rate (BPM)</p>
              </CardContent>
            </Card>
            
            {getLatestMetric('weight') && (
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-purple-600">
                    {getLatestMetric('weight')?.value}
                  </div>
                  <p className="text-sm text-gray-600">Weight (kg)</p>
                </CardContent>
              </Card>
            )}
            
            {getLatestMetric('blood_pressure') && (
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-blue-600">
                    {getLatestMetric('blood_pressure')?.value}/
                    {(getLatestMetric('blood_pressure')?.additional_data as any)?.diastolic}
                  </div>
                  <p className="text-sm text-gray-600">Blood Pressure</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Recent Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Measurements</CardTitle>
            </CardHeader>
            <CardContent>
              {healthMetrics && healthMetrics.length > 0 ? (
                <div className="space-y-3">
                  {healthMetrics.slice(0, 5).map((metric) => (
                    <div key={metric.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium capitalize">
                          {metric.metric_type.replace('_', ' ')}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(metric.recorded_at || metric.created_at!).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          {metric.value} {metric.unit}
                        </p>
                        {metric.additional_data && (
                          <p className="text-sm text-gray-600">
                            {JSON.stringify(metric.additional_data)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">No vitals recorded yet</p>
                  <Button 
                    onClick={() => navigate('/manual-data-entry')}
                    className="bg-[#2ecac8] hover:bg-[#338886]"
                  >
                    Add Your First Reading
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="charts" className="space-y-6">
          {/* Heart Rate Chart */}
          {heartRateData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Heart Rate Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={heartRateData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: any, name: string) => [`${value} BPM`, 'Heart Rate']}
                      labelFormatter={(label) => `Date: ${label}`}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#ef4444" 
                      strokeWidth={2}
                      dot={{ fill: '#ef4444' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Blood Pressure Chart */}
          {bloodPressureData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Blood Pressure Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={bloodPressureData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="systolic" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      name="Systolic"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="diastolic" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      name="Diastolic"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Weight Chart */}
          {weightData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Weight Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={weightData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: any) => [`${value} kg`, 'Weight']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#8b5cf6" 
                      strokeWidth={2}
                      dot={{ fill: '#8b5cf6' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Steps Chart */}
          {stepsData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Daily Steps</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={stepsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: any) => [`${value} steps`, 'Steps']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      dot={{ fill: '#10b981' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="devices" className="space-y-4">
          <DeviceSync onDataSynced={refetch} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Vitals;
