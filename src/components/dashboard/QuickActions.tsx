import React from "react";
import { useNavigate } from "react-router-dom";
import { Activity, Droplets, Utensils, Pill, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useSymptoms, useMedications, useWaterIntake } from "@/hooks/useSupabaseData";
import { useNutritionLog } from "@/hooks/useNutrition";

const QuickActions = () => {
  const navigate = useNavigate();
  const { data: symptoms } = useSymptoms();
  const { data: medications } = useMedications();
  const { data: waterIntake } = useWaterIntake();
  const { data: nutritionLogs } = useNutritionLog();

  const today = new Date().toDateString();

  const todaySymptoms = symptoms?.filter(symptom => 
    new Date(symptom.logged_at || symptom.created_at).toDateString() === today
  ).length || 0;

  const todayMedications = medications?.filter(medication => 
    new Date(medication.created_at).toDateString() === today
  ).length || 0;

  const todayWater = waterIntake?.filter(water =>
    new Date(water.recorded_at).toDateString() === today
  ).reduce((total, entry) => total + entry.amount_ml, 0) || 0;

  const todayNutrition = nutritionLogs?.filter(nutrition =>
    new Date(nutrition.logged_at).toDateString() === today
  ).reduce((total, entry) => total + (entry.calories || 0), 0) || 0;

  const actions = [
    {
      icon: Activity,
      title: "Log Symptom",
      description: `${todaySymptoms} logged today`,
      color: "bg-red-50 text-red-600 border-red-200",
      path: "/symptoms",
    },
    {
      icon: Pill,
      title: "Medications",
      description: `${todayMedications} tracked today`,
      color: "bg-blue-50 text-blue-600 border-blue-200",
      path: "/medications",
    },
    {
      icon: Droplets,
      title: "Water Intake",
      description: `${todayWater}ml today`,
      color: "bg-cyan-50 text-cyan-600 border-cyan-200",
      path: "/water",
    },
    {
      icon: Utensils,
      title: "Nutrition",
      description: `${todayNutrition} calories today`,
      color: "bg-green-50 text-green-600 border-green-200",
      path: "/nutrition",
    },
  ];

  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-3">Quick Actions</h2>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action, index) => (
          <Card
            key={index}
            className={`cursor-pointer transition-all hover:shadow-md border ${action.color}`}
            onClick={() => navigate(action.path)}
          >
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${action.color}`}>
                  <action.icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">
                    {action.title}
                  </p>
                  <p className="text-xs text-gray-600 truncate">
                    {action.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Styled Health Report Button */}
      <div className="flex justify-center mt-6">
        <button
          onClick={() => navigate("/report-landing")}
          className="bg-gradient-to-r from-[#2ecac8] to-[#338886] hover:from-[#338886] hover:to-[#2ecac8] text-white px-8 py-4 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
        >
          <FileText className="w-5 h-5" />
          Health Report
        </button>
      </div>
    </div>
  );
};

export default QuickActions;
