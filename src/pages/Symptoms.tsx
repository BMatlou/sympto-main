
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Calendar, TrendingUp, Clock, CalendarDays } from "lucide-react";
import { format } from "date-fns";
import { useSymptoms } from "@/hooks/useSupabaseData";

const Symptoms = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const { data: symptoms, isLoading } = useSymptoms();

  const filteredSymptoms = symptoms?.filter(symptom =>
    symptom.symptom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    symptom.description?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getSeverityColor = (severity: number) => {
    if (severity <= 3) return "bg-green-100 text-green-800 border-green-200";
    if (severity <= 6) return "bg-yellow-100 text-yellow-800 border-yellow-200";
    return "bg-red-100 text-red-800 border-red-200";
  };

  const getSeverityIcon = (severity: number) => {
    if (severity <= 3) return "🟢";
    if (severity <= 6) return "🟡";
    return "🔴";
  };

  const handleGetInsights = (symptom: any) => {
    // Store symptom data in localStorage for the recommendations page
    localStorage.setItem('lastSymptom', symptom.symptom);
    localStorage.setItem('lastSeverity', symptom.severity?.toString() || '5');
    
    // Navigate to the recommendations page with URL params as backup
    navigate(`/symptom-recommendations?symptom=${encodeURIComponent(symptom.symptom)}&severity=${symptom.severity || 5}`);
  };

  if (isLoading) {
    return (
      <div className="p-4 pb-20 max-w-md mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 pb-20 max-w-md mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Symptoms</h1>
        <Button 
          onClick={() => navigate("/add")}
          size="sm"
          className="bg-[#2ecac8] hover:bg-[#338886]"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search symptoms..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {filteredSymptoms.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No symptoms yet</h3>
          <p className="text-gray-600 mb-4">Start tracking your symptoms to better understand your health patterns</p>
          <Button onClick={() => navigate("/add")} className="bg-[#2ecac8] hover:bg-[#338886]">
            <Plus className="w-4 h-4 mr-2" />
            Add First Symptom
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSymptoms.map((symptom) => (
            <Card 
              key={symptom.id} 
              className="cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-[#2ecac8]"
              onClick={() => navigate(`/symptoms/${symptom.id}`)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-lg mb-1">
                      {symptom.symptom}
                    </h3>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={`text-xs font-medium px-2 py-1 ${getSeverityColor(symptom.severity || 0)}`}>
                        {getSeverityIcon(symptom.severity || 0)} {symptom.severity}/10
                      </Badge>
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="w-4 h-4 mr-1" />
                        {format(new Date(symptom.logged_at || symptom.created_at), 'MMM dd, HH:mm')}
                      </div>
                    </div>
                  </div>
                </div>

                {symptom.description && (
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {symptom.description}
                  </p>
                )}

                {/* Action buttons */}
                <div className="flex space-x-2 mt-3">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/book-appointment-landing?symptom=${symptom.id}`);
                    }}
                    className="flex items-center text-xs px-3 py-1 border-[#2ecac8] text-[#2ecac8] hover:bg-[#2ecac8] hover:text-white"
                  >
                    <CalendarDays className="w-3 h-3 mr-1" />
                    Book Appointment
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleGetInsights(symptom);
                    }}
                    className="flex items-center text-xs px-3 py-1"
                  >
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Get Insights
                  </Button>
                </div>

                {/* Additional symptom details */}
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                    {symptom.triggers && symptom.triggers.length > 0 && (
                      <div>
                        <span className="font-medium">Triggers:</span> {symptom.triggers.slice(0, 2).join(', ')}
                        {symptom.triggers.length > 2 && '...'}
                      </div>
                    )}
                    {symptom.location_data && (
                      <div>
                        <span className="font-medium">Location:</span> Body area tracked
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Symptoms;
