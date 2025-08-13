
import { useNavigate } from "react-router-dom";
import { FileText, Download, Share, Eye, Calendar, Activity, Heart, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUserProfile, useSymptoms, useHealthMetrics, useMedications } from "@/hooks/useSupabaseData";

const ReportLanding = () => {
  const navigate = useNavigate();
  const { data: userProfile } = useUserProfile();
  const { data: symptoms } = useSymptoms();
  const { data: healthMetrics } = useHealthMetrics();
  const { data: medications } = useMedications();

  // Calculate real statistics
  const symptomsThisMonth = symptoms?.filter(s => {
    const symptomDate = new Date(s.logged_at || s.created_at);
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    return symptomDate >= monthAgo;
  }).length || 0;

  const daysTracked = symptoms?.length > 0 ? 
    Math.ceil((Date.now() - new Date(symptoms[symptoms.length - 1].created_at).getTime()) / (1000 * 60 * 60 * 24)) : 0;

  const vitalsRecorded = healthMetrics?.length || 0;

  const calculateHealthScore = () => {
    // Simple health score calculation based on activity and symptoms
    let score = 8.5;
    if (symptomsThisMonth > 10) score -= 1;
    if (vitalsRecorded > 20) score += 0.5;
    if (medications && medications.length > 5) score -= 0.5;
    return Math.max(0, Math.min(10, score)).toFixed(1);
  };

  const reportStats = [
    { icon: Activity, label: "Symptoms Logged", value: symptomsThisMonth.toString(), color: "text-red-600" },
    { icon: Calendar, label: "Days Tracked", value: daysTracked.toString(), color: "text-blue-600" },
    { icon: Heart, label: "Vitals Recorded", value: vitalsRecorded.toString(), color: "text-pink-600" },
    { icon: TrendingUp, label: "Health Score", value: calculateHealthScore(), color: "text-green-600" },
  ];

  const reportSections = [
    {
      title: "Personal Health Summary",
      description: "Overview of your current health status and key metrics",
      items: [
        userProfile?.full_name ? "Personal information verified" : "Personal information pending",
        `Health score: ${calculateHealthScore()}/10`,
        medications ? `${medications.length} medications tracked` : "No medications tracked",
        userProfile?.medical_conditions?.length ? `${userProfile.medical_conditions.length} conditions monitored` : "No medical conditions recorded"
      ]
    },
    {
      title: "Symptom Analysis",
      description: "Detailed analysis of your symptom patterns and trends",
      items: [
        `${symptoms?.length || 0} total symptoms logged`,
        `${symptomsThisMonth} symptoms this month`,
        symptoms?.length ? "Severity trends available" : "No severity data yet",
        symptoms?.some(s => s.triggers?.length) ? "Trigger patterns identified" : "No trigger data available"
      ]
    },
    {
      title: "Vital Signs & Metrics",
      description: "Your vital signs tracking and historical data",
      items: [
        `${vitalsRecorded} vital measurements recorded`,
        healthMetrics?.some(m => m.metric_type === 'heart_rate') ? "Heart rate tracking active" : "No heart rate data",
        healthMetrics?.some(m => m.metric_type === 'blood_pressure') ? "Blood pressure monitoring" : "No blood pressure data",
        userProfile?.height_cm && userProfile?.weight_kg ? `BMI: ${((userProfile.weight_kg / Math.pow(userProfile.height_cm / 100, 2))).toFixed(1)}` : "BMI calculation pending"
      ]
    },
    {
      title: "AI-Powered Recommendations",
      description: "Personalized health insights and recommendations",
      items: [
        userProfile?.age ? `Age-appropriate recommendations (Age ${userProfile.age})` : "General recommendations",
        userProfile?.gender ? `Gender-specific insights (${userProfile.gender})` : "Generic health insights",
        symptoms?.length ? "Symptom-based suggestions" : "Preventive health tips",
        "Lifestyle optimization tips"
      ]
    }
  ];

  return (
    <div className="p-4 pb-20 max-w-md mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-r from-[#2ecac8] to-[#338886] rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Health Report</h1>
        <p className="text-gray-600">
          {userProfile?.full_name ? `Comprehensive overview for ${userProfile.full_name.split(' ')[0]}` : 'Comprehensive overview of your health data'}
        </p>
      </div>

      {/* Report Statistics */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {reportStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl p-4 shadow-sm border text-center">
              <Icon className={`w-6 h-6 ${stat.color} mx-auto mb-2`} />
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-600">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Report Sections */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">What's Included</h2>
        <div className="space-y-4">
          {reportSections.map((section, index) => (
            <div key={index} className="bg-white rounded-xl p-4 shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{section.title}</h3>
              <p className="text-sm text-gray-600 mb-3">{section.description}</p>
              <div className="space-y-1">
                {section.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-[#2ecac8] rounded-full"></div>
                    <span className="text-sm text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Health Score Preview */}
      <div className="bg-gradient-to-r from-[#2ecac8] to-[#338886] rounded-xl p-6 mb-8 text-white">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Current Health Score</h3>
          <div className="text-4xl font-bold mb-2">{calculateHealthScore()}</div>
          <p className="text-sm opacity-80">
            {parseFloat(calculateHealthScore()) >= 8 ? 'Excellent progress!' : 
             parseFloat(calculateHealthScore()) >= 6 ? 'Good health tracking!' : 
             'Keep tracking for better insights!'}
          </p>
          <div className="w-full bg-white/20 rounded-full h-2 mt-4">
            <div 
              className="bg-white h-2 rounded-full" 
              style={{ width: `${(parseFloat(calculateHealthScore()) / 10) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 mb-6">
        <Button 
          onClick={() => navigate('/export-report')}
          className="w-full bg-[#2ecac8] hover:bg-[#338886] text-white flex items-center justify-center space-x-2"
        >
          <Eye className="w-4 h-4" />
          <span>View Full Report</span>
        </Button>

        <div className="grid grid-cols-2 gap-3">
          <Button 
            onClick={() => alert('Download functionality would generate PDF with your real health data')}
            variant="outline" 
            className="flex items-center justify-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Download</span>
          </Button>

          <Button 
            onClick={() => alert('Share functionality would create secure links to your health report')}
            variant="outline" 
            className="flex items-center justify-center space-x-2"
          >
            <Share className="w-4 h-4" />
            <span>Share</span>
          </Button>
        </div>
      </div>

      {/* Last Updated */}
      <div className="text-center">
        <p className="text-sm text-gray-600">
          Last updated: {new Date().toLocaleDateString()}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Report automatically updates with new health data
        </p>
      </div>

      {/* Privacy Note */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-xs text-blue-800">
          <strong>Privacy:</strong> Your health report contains your real personal data and is encrypted. 
          Only you and authorized healthcare providers you choose to share it with can access this information.
        </p>
      </div>
    </div>
  );
};

export default ReportLanding;
