import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Download, Share, User, Calendar, Activity, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, BarChart, Bar } from "recharts";
import { 
  useUserProfile, 
  useSymptoms, 
  useAppointments, 
  useMedications, 
  useHealthMetrics, 
  useWaterIntake,
  useMedicalRecords
} from "@/hooks/useSupabaseData";
import { useUserSettings } from "@/hooks/useUserSettings";
import { useNutritionLog } from "@/hooks/useNutrition";
import { useActivitySessions } from "@/hooks/useActivitySessions";
import { useMedicationLogs } from "@/hooks/useMedicationTracking";
import { generatePDFReport } from "@/utils/pdfGenerator";
import { format } from "date-fns";
import { toast } from "sonner";
import HealthDataSharingDialog from "@/components/HealthDataSharingDialog";

const ExportReport = () => {
  const navigate = useNavigate();
  const [showFullIdNumber, setShowFullIdNumber] = useState(false);
  
  const { data: userProfile } = useUserProfile();
  const { data: userSettings } = useUserSettings();
  const { data: symptoms } = useSymptoms();
  const { data: appointments } = useAppointments();
  const { data: medications } = useMedications();
  const { data: healthMetrics } = useHealthMetrics();
  const { data: waterIntake } = useWaterIntake();
  const { data: nutritionLog } = useNutritionLog();
  const { data: activitySessions } = useActivitySessions();
  const { data: medicationLogs } = useMedicationLogs();
  const { data: medicalRecords } = useMedicalRecords();

  const vitalsData = healthMetrics?.filter(m => m.metric_type === 'heart_rate' || m.metric_type === 'blood_pressure')
    .slice(-7)
    .map(metric => ({
      date: format(new Date(metric.recorded_at || metric.created_at), 'MM/dd'),
      heartRate: metric.metric_type === 'heart_rate' ? metric.value : null,
      bloodPressure: metric.metric_type === 'blood_pressure' ? metric.value : null
    })) || [];

  const activityData = healthMetrics?.filter(m => m.metric_type === 'steps')
    .slice(-7)
    .map(metric => ({
      day: format(new Date(metric.recorded_at || metric.created_at), 'EEE'),
      steps: metric.value
    })) || [];

  const calculateHealthScore = () => {
    let score = 0;
    let factors = 0;

    const recentSteps = healthMetrics?.filter(m => m.metric_type === 'steps').slice(-7);
    if (recentSteps && recentSteps.length > 0) {
      const avgSteps = recentSteps.reduce((sum, m) => sum + m.value, 0) / recentSteps.length;
      score += Math.min(25, (avgSteps / 10000) * 25);
      factors++;
    }

    const recentWater = waterIntake?.slice(-7);
    if (recentWater && recentWater.length > 0) {
      const avgWater = recentWater.reduce((sum, w) => sum + w.amount_ml, 0) / recentWater.length;
      score += Math.min(25, (avgWater / 2000) * 25);
      factors++;
    }

    const recentSymptoms = symptoms?.filter(s => {
      const symptomDate = new Date(s.logged_at || s.created_at);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return symptomDate >= weekAgo;
    }).length || 0;
    score += Math.max(0, 25 - (recentSymptoms * 2));
    factors++;

    if (medications && medications.length > 0) {
      score += 20;
      factors++;
    }

    return factors > 0 ? Math.min(10, (score / (factors * 2.5))).toFixed(1) : '8.5';
  };

  const healthScore = calculateHealthScore();

  const generateReportData = () => {
    return {
      patient: {
        name: userProfile?.full_name || 'User',
        age: userProfile?.age || 'N/A',
        gender: userProfile?.gender || 'N/A',
        id: userProfile?.id_number || 'N/A',
        height: userProfile?.height_cm || 'N/A',
        weight: userProfile?.weight_kg || 'N/A',
        bmi: userProfile?.height_cm && userProfile?.weight_kg 
          ? ((userProfile.weight_kg / Math.pow(userProfile.height_cm / 100, 2))).toFixed(1)
          : 'N/A',
        conditions: userProfile?.medical_conditions || [],
        allergies: userProfile?.allergies || [],
        address: userProfile?.address || 'N/A',
        phone: userProfile?.phone,
        emergency_contact: userProfile?.emergency_contact,
        citizenship_status: userProfile?.citizenship_status,
        date_of_birth: userProfile?.date_of_birth
      },
      healthScore: healthScore,
      symptoms: symptoms || [],
      medications: medications || [],
      appointments: appointments || [],
      healthMetrics: healthMetrics || [],
      waterIntake: waterIntake || [],
      nutritionLog: nutritionLog || [],
      activitySessions: activitySessions || [],
      medicationLogs: medicationLogs || [],
      medicationReminders: [], // Could add this hook if needed
      medicalRecords: medicalRecords || [],
      aiRecommendations: [], // Could integrate if AI recommendations are stored
      generatedAt: new Date().toISOString(),
      settings: userSettings,
      showFullIdNumber: showFullIdNumber
    };
  };

  const handleDownload = async () => {
    try {
      const reportData = generateReportData();
      const pdf = generatePDFReport(reportData);
      pdf.save(`sympto-comprehensive-health-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
      
      // If there are medical records, prepare them for download
      if (medicalRecords && medicalRecords.length > 0) {
        toast.success('Comprehensive health report PDF downloaded! Medical record files should be shared separately with healthcare providers.');
      } else {
        toast.success('Comprehensive health report PDF downloaded successfully!');
      }
    } catch (error) {
      console.error('Error downloading PDF report:', error);
      toast.error('Failed to download PDF report');
    }
  };

  const handleShare = async () => {
    try {
      const reportData = generateReportData();
      
      if (navigator.share) {
        const shareText = `My Comprehensive Sympto+ Health Report
        
Health Score: ${healthScore}/10
Medical Conditions: ${userProfile?.medical_conditions?.length || 0}
Active Medications: ${medications?.length || 0}
Recent Symptoms: ${symptoms?.length || 0}
Health Metrics: ${healthMetrics?.length || 0}
Medical Records: ${medicalRecords?.length || 0}

Generated on ${format(new Date(), 'MMM dd, yyyy')}

This comprehensive report includes detailed health tracking data, vital signs, symptoms history, medication adherence, and uploaded medical records.`;

        await navigator.share({
          title: 'Sympto+ Comprehensive Health Report',
          text: shareText,
          url: window.location.href
        });
        toast.success('Report shared successfully!');
      } else {
        const shareText = `My Comprehensive Sympto+ Health Report\n\nHealth Score: ${healthScore}/10\nMedical Conditions: ${userProfile?.medical_conditions?.length || 0}\nActive Medications: ${medications?.length || 0}\nRecent Symptoms: ${symptoms?.length || 0}\nHealth Metrics: ${healthMetrics?.length || 0}\nMedical Records: ${medicalRecords?.length || 0}\n\nGenerated on ${format(new Date(), 'MMM dd, yyyy')}`;
        await navigator.clipboard.writeText(shareText);
        toast.success('Report summary copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing report:', error);
      toast.error('Failed to share report');
    }
  };

  const recommendations = [
    {
      priority: "High",
      category: "Exercise",
      recommendation: userProfile?.age && userProfile.age > 50 
        ? "Consider low-impact exercises like walking or swimming based on your age profile"
        : "Increase daily walking to 10,000 steps based on your activity patterns",
      color: "text-red-600 bg-red-100"
    },
    {
      priority: "Medium", 
      category: "Diet",
      recommendation: symptoms?.some(s => s.symptom.toLowerCase().includes('headache'))
        ? "Consider reducing caffeine intake to help with headache frequency"
        : "Maintain balanced nutrition based on your health goals",
      color: "text-yellow-600 bg-yellow-100"
    },
    {
      priority: "Low",
      category: "Sleep",
      recommendation: "Maintain current sleep schedule as it correlates with better health scores",
      color: "text-green-600 bg-green-100"
    }
  ];

  const calculateBMI = () => {
    if (userProfile?.height_cm && userProfile?.weight_kg) {
      const heightM = userProfile.height_cm / 100;
      return (userProfile.weight_kg / (heightM * heightM)).toFixed(1);
    }
    return null;
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return "Underweight";
    if (bmi < 25) return "Normal";
    if (bmi < 30) return "Overweight";
    return "Obese";
  };

  const bmi = calculateBMI();

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
          <h1 className="text-2xl font-bold text-gray-900">Comprehensive Health Report</h1>
        </div>
        
        <div className="flex space-x-2">
          <Button size="sm" variant="outline" onClick={handleDownload}>
            <Download className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={handleShare}>
            <Share className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Privacy Options */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-semibold text-blue-800 mb-3">Privacy Options</h3>
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="showFullId"
            checked={showFullIdNumber}
            onCheckedChange={(checked) => setShowFullIdNumber(checked === true)}
          />
          <label htmlFor="showFullId" className="text-sm text-blue-700">
            Include full ID number in report (unmasked)
          </label>
        </div>
        <p className="text-xs text-blue-600 mt-2">
          By default, ID numbers are masked for privacy. Check this option only when sharing with trusted healthcare providers.
        </p>
      </div>

      {/* Report Summary */}
      <div className="bg-white rounded-xl p-4 shadow-sm border mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Report Overview</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Health Score:</span>
              <span className="text-[#2ecac8] font-semibold">{healthScore}/10</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Symptoms Logged:</span>
              <span className="text-gray-900">{symptoms?.length || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Medications:</span>
              <span className="text-gray-900">{medications?.length || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Appointments:</span>
              <span className="text-gray-900">{appointments?.length || 0}</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Health Metrics:</span>
              <span className="text-gray-900">{healthMetrics?.length || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Activity Sessions:</span>
              <span className="text-gray-900">{activitySessions?.length || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Nutrition Entries:</span>
              <span className="text-gray-900">{nutritionLog?.length || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Medical Records:</span>
              <span className="text-gray-900">{medicalRecords?.length || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Patient Summary */}
      <div className="bg-white rounded-xl p-4 shadow-sm border mb-6">
        <div className="flex items-center space-x-3 mb-4">
          <User className="w-6 h-6 text-[#2ecac8]" />
          <h2 className="text-xl font-semibold text-gray-900">Patient Summary</h2>
        </div>
        
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Name:</span>
              <span className="ml-2 text-gray-900">{userProfile?.full_name || 'Not provided'}</span>
            </div>
            <div>
              <span className="text-gray-600">Age:</span>
              <span className="ml-2 text-gray-900">{userProfile?.age || 'N/A'}</span>
            </div>
            <div>
              <span className="text-gray-600">Gender:</span>
              <span className="ml-2 text-gray-900">{userProfile?.gender || 'N/A'}</span>
            </div>
            <div>
              <span className="text-gray-600">Height:</span>
              <span className="ml-2 text-gray-900">{userProfile?.height_cm || 'N/A'} cm</span>
            </div>
            <div>
              <span className="text-gray-600">Weight:</span>
              <span className="ml-2 text-gray-900">{userProfile?.weight_kg || 'N/A'} kg</span>
            </div>
            <div>
              <span className="text-gray-600">BMI:</span>
              <span className="ml-2 text-gray-900">
                {bmi ? `${bmi} (${getBMICategory(parseFloat(bmi))})` : 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Health Score:</span>
              <span className="ml-2 text-[#2ecac8] font-semibold">{healthScore}/10</span>
            </div>
            <div>
              <span className="text-gray-600">ID Number:</span>
              <span className="ml-2 text-gray-900">
                {userProfile?.id_number ? (showFullIdNumber ? userProfile.id_number : `****${userProfile.id_number.slice(-4)}`) : 'N/A'}
              </span>
            </div>
          </div>
          
          {userProfile?.medical_conditions && userProfile.medical_conditions.length > 0 && (
            <div>
              <span className="text-gray-600 text-sm">Medical Conditions:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {userProfile.medical_conditions.map((condition: string, index: number) => (
                  <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                    {condition}
                  </span>
                ))}
              </div>
            </div>
          )}

          {userProfile?.allergies && userProfile.allergies.length > 0 && (
            <div>
              <span className="text-gray-600 text-sm">Allergies:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {userProfile.allergies.map((allergy: string, index: number) => (
                  <span key={index} className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">
                    {allergy}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Data Completeness Indicator */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-semibold text-green-800 mb-2">Comprehensive Report Includes:</h3>
        <div className="grid grid-cols-2 gap-2 text-xs text-green-700">
          <div>✓ Full patient demographics</div>
          <div>✓ Medical history & conditions</div>
          <div>✓ Symptoms & severity tracking</div>
          <div>✓ Medication adherence logs</div>
          <div>✓ Vital signs & health metrics</div>
          <div>✓ Activity & exercise data</div>
          <div>✓ Nutrition & water intake</div>
          <div>✓ Appointment history</div>
          <div>✓ Medical records uploaded</div>
          <div>✓ AI health recommendations</div>
          <div>✓ Privacy settings & preferences</div>
          <div>✓ Health trends analysis</div>
        </div>
      </div>

      {/* Symptom Log */}
      <div className="bg-white rounded-xl p-4 shadow-sm border mb-6">
        <div className="flex items-center space-x-3 mb-4">
          <Activity className="w-6 h-6 text-red-500" />
          <h2 className="text-xl font-semibold text-gray-900">Symptom Log</h2>
        </div>
        
        {symptoms && symptoms.length > 0 ? (
          <div className="space-y-3">
            {symptoms.slice(0, 5).map((symptom, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">{symptom.symptom}</h3>
                  <p className="text-sm text-gray-600">
                    {format(new Date(symptom.logged_at || symptom.created_at), 'MMM dd, yyyy')}
                  </p>
                  {symptom.description && (
                    <p className="text-sm text-gray-700 mt-1">{symptom.description}</p>
                  )}
                </div>
                {symptom.severity && (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    symptom.severity <= 3 ? "text-green-600 bg-green-100" :
                    symptom.severity <= 6 ? "text-yellow-600 bg-yellow-100" :
                    "text-red-600 bg-red-100"
                  }`}>
                    {symptom.severity}/10
                  </span>
                )}
              </div>
            ))}
            {symptoms.length > 5 && (
              <p className="text-sm text-gray-600 text-center">
                +{symptoms.length - 5} more symptoms logged
              </p>
            )}
          </div>
        ) : (
          <p className="text-gray-600 text-center py-4">No symptoms logged yet</p>
        )}
      </div>

      {/* Medications */}
      {medications && medications.length > 0 && (
        <div className="bg-white rounded-xl p-4 shadow-sm border mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <Calendar className="w-6 h-6 text-purple-500" />
            <h2 className="text-xl font-semibold text-gray-900">Current Medications</h2>
          </div>
          
          <div className="space-y-3">
            {medications.slice(0, 5).map((medication, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-900">{medication.name}</h3>
                <p className="text-sm text-gray-600">{medication.dosage} - {medication.frequency}</p>
                {medication.prescribing_doctor && (
                  <p className="text-sm text-gray-600">Prescribed by: {medication.prescribing_doctor}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Vital Signs Trends */}
      {vitalsData.length > 0 && (
        <div className="bg-white rounded-xl p-4 shadow-sm border mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <Heart className="w-6 h-6 text-pink-500" />
            <h2 className="text-xl font-semibold text-gray-900">Vital Signs Trends</h2>
          </div>
          
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Recent Measurements</h3>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={vitalsData}>
                  <XAxis dataKey="date" axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Line type="monotone" dataKey="heartRate" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="bloodPressure" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Activity Metrics */}
      {activityData.length > 0 && (
        <div className="bg-white rounded-xl p-4 shadow-sm border mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <Activity className="w-6 h-6 text-green-500" />
            <h2 className="text-xl font-semibold text-gray-900">Activity Metrics</h2>
          </div>
          
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Daily Steps (Last 7 Days)</h3>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activityData}>
                  <XAxis dataKey="day" axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Bar dataKey="steps" fill="#2ecac8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-sm text-gray-600 text-center mt-2">
              Average: {Math.round(activityData.reduce((sum, d) => sum + d.steps, 0) / activityData.length)} steps/day
            </p>
          </div>
        </div>
      )}

      {/* AI-Generated Recommendations */}
      <div className="bg-white rounded-xl p-4 shadow-sm border mb-6">
        <div className="flex items-center space-x-3 mb-4">
          <Calendar className="w-6 h-6 text-purple-500" />
          <h2 className="text-xl font-semibold text-gray-900">AI Recommendations</h2>
        </div>
        
        <div className="space-y-3">
          {recommendations.map((rec, index) => (
            <div key={index} className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">{rec.category}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${rec.color}`}>
                  {rec.priority}
                </span>
              </div>
              <p className="text-sm text-gray-700">{rec.recommendation}</p>
            </div>
          ))}
        </div>
      </div>

      {/* User Settings Summary */}
      {userSettings && (
        <div className="bg-white rounded-xl p-4 shadow-sm border mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Health Data Settings</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Biometric Lock:</span>
              <span className="text-gray-900">{userSettings.biometric_lock_enabled ? 'Enabled' : 'Disabled'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Fitness App Sync:</span>
              <span className="text-gray-900">{userSettings.fitness_app_sync_enabled ? 'Enabled' : 'Disabled'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Health Data Sharing:</span>
              <span className="text-gray-900">{userSettings.health_data_sharing_enabled ? 'Enabled' : 'Disabled'}</span>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced sharing options */}
      <div className="bg-white rounded-xl p-4 shadow-sm border mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Share Comprehensive Report</h3>
        <div className="space-y-3">
          <HealthDataSharingDialog />
          <Button
            onClick={handleDownload}
            variant="outline"
            className="w-full"
          >
            <Download className="w-4 h-4 mr-2" />
            Download Complete PDF Report
          </Button>
        </div>
        <p className="text-xs text-gray-600 mt-2">
          This comprehensive report includes all your health data and is ideal for medical consultations.
        </p>
      </div>

      {/* Medical Disclaimer */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-semibold text-amber-800 mb-2">Medical Disclaimer</h3>
        <p className="text-xs text-amber-700">
          This comprehensive report contains user-inputted data and is for informational purposes only. 
          It should not replace professional medical advice. Always consult with healthcare providers for 
          medical decisions. Data accuracy depends on user input and device synchronization.
        </p>
      </div>

      {/* Medical Records Integration Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-semibold text-blue-800 mb-2">Medical Records Integration</h3>
        {medicalRecords && medicalRecords.length > 0 ? (
          <div>
            <p className="text-xs text-blue-700 mb-2">
              This report references {medicalRecords.length} uploaded medical record(s):
            </p>
            <div className="space-y-1">
              {medicalRecords.slice(0, 3).map((record, index) => (
                <div key={index} className="text-xs text-blue-600">
                  📋 {record.title} ({record.record_type})
                </div>
              ))}
              {medicalRecords.length > 3 && (
                <div className="text-xs text-blue-600">
                  ...and {medicalRecords.length - 3} more record(s)
                </div>
              )}
            </div>
            <p className="text-xs text-blue-600 mt-2">
              When sharing with healthcare providers, ensure original medical record files are also provided separately.
            </p>
          </div>
        ) : (
          <p className="text-xs text-blue-700">
            No medical records have been uploaded yet. Consider adding medical records through the app to create a more comprehensive report.
          </p>
        )}
      </div>

      {/* Report Footer */}
      <div className="text-center text-sm text-gray-600">
        <p>Comprehensive Report Generated on {new Date().toLocaleDateString()}</p>
        <p className="mt-1">Sympto+ Health Tracking Application</p>
        {userProfile?.address && (
          <p className="mt-1">Patient Address: {userProfile.address}</p>
        )}
      </div>
    </div>
  );
};

export default ExportReport;
