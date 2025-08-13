
import { Brain, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUserProfile, useSymptoms, useMedications, useAppointments } from "@/hooks/useSupabaseData";

interface HealthInsightsProps {
  activeMedicationsCount?: number;
  upcomingAppointmentsCount?: number;
}

const HealthInsights = ({ activeMedicationsCount = 0, upcomingAppointmentsCount = 0 }: HealthInsightsProps) => {
  const { data: userProfile } = useUserProfile();
  const { data: symptoms } = useSymptoms();
  const { data: medications } = useMedications();
  const { data: appointments } = useAppointments();

  // Calculate real statistics
  const recentSymptoms = symptoms?.filter(s => {
    const symptomDate = new Date(s.logged_at || s.created_at);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return symptomDate >= weekAgo;
  }).length || 0;

  const activeMeds = medications?.filter(m => !m.end_date || new Date(m.end_date) > new Date()).length || activeMedicationsCount;
  
  const upcomingAppts = appointments?.filter(a => new Date(a.appointment_date) > new Date()).length || upcomingAppointmentsCount;

  const insights = [
    {
      type: recentSymptoms > 5 ? "warning" : "positive",
      icon: recentSymptoms > 5 ? AlertTriangle : CheckCircle,
      title: recentSymptoms > 5 ? "Monitor Symptoms" : "Symptoms Stable",
      description: recentSymptoms > 5 
        ? `You've logged ${recentSymptoms} symptoms this week. Consider consulting your doctor.`
        : `Only ${recentSymptoms} symptoms logged this week. Keep up the good work!`,
      color: recentSymptoms > 5 ? "text-amber-600" : "text-green-600"
    },
    {
      type: activeMeds > 0 ? "info" : "neutral",
      icon: Brain,
      title: activeMeds > 0 ? "Medication Reminder" : "No Active Medications",
      description: activeMeds > 0 
        ? `You have ${activeMeds} active medications. Make sure to take them as prescribed.`
        : "No active medications tracked. Add any medications you're taking.",
      color: "text-blue-600"
    },
    {
      type: upcomingAppts > 0 ? "info" : "neutral",
      icon: TrendingUp,
      title: upcomingAppts > 0 ? "Upcoming Appointments" : "No Scheduled Appointments",
      description: upcomingAppts > 0 
        ? `You have ${upcomingAppts} upcoming appointments. Don't forget to attend them.`
        : "No upcoming appointments. Schedule regular check-ups for better health.",
      color: "text-purple-600"
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Brain className="w-5 h-5 text-[#2ecac8]" />
          <span>Health Insights</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {insights.map((insight, index) => {
            const Icon = insight.icon;
            return (
              <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <Icon className={`w-5 h-5 mt-0.5 ${insight.color}`} />
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{insight.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
                </div>
              </div>
            );
          })}
          
          {userProfile?.medical_conditions && userProfile.medical_conditions.length > 0 && (
            <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
              <AlertTriangle className="w-5 h-5 mt-0.5 text-blue-600" />
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">Medical Conditions</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Monitoring {userProfile.medical_conditions.length} condition(s): {userProfile.medical_conditions.slice(0, 2).join(", ")}
                  {userProfile.medical_conditions.length > 2 && ` and ${userProfile.medical_conditions.length - 2} more`}
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default HealthInsights;
