
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Pill, Clock, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useMedications } from '@/hooks/useSupabaseData';
import { useMedicationReminders } from '@/hooks/useMedicationTracking';
import { format, parseISO } from 'date-fns';
import { toast } from 'sonner';

const Medications = () => {
  const navigate = useNavigate();
  const { data: medications, isLoading } = useMedications();
  const { data: reminders } = useMedicationReminders();

  const getMedicationStatus = (startDate: string, endDate?: string) => {
    const start = parseISO(startDate);
    const end = endDate ? parseISO(endDate) : null;
    const now = new Date();

    if (now < start) return 'upcoming';
    if (end && now > end) return 'completed';
    return 'active';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMedicationReminders = (medicationId: string) => {
    return reminders?.filter(reminder => reminder.medication_id === medicationId) || [];
  };

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
          <h1 className="text-2xl font-bold text-gray-900">Medications</h1>
        </div>
        
        <Button 
          onClick={() => navigate('/add?tab=medication')}
          className="bg-[#2ecac8] hover:bg-[#338886]"
          size="sm"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add
        </Button>
      </div>

      {/* Medications List */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2ecac8] mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading medications...</p>
        </div>
      ) : medications && medications.length > 0 ? (
        <div className="space-y-4">
          {medications.map((medication, index) => {
            const status = getMedicationStatus(medication.start_date, medication.end_date);
            const medicationReminders = getMedicationReminders(medication.id);
            
            return (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Pill className="w-5 h-5 text-[#2ecac8]" />
                        <CardTitle className="text-lg">{medication.name}</CardTitle>
                      </div>
                      <Badge className={getStatusColor(status)}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </Badge>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => navigate(`/add?tab=medication&edit=${medication.id}`)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Dosage:</span>
                      <p className="font-medium">{medication.dosage}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Frequency:</span>
                      <p className="font-medium">{medication.frequency}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Start Date:</span>
                      <p className="font-medium">{format(parseISO(medication.start_date), 'MMM dd, yyyy')}</p>
                    </div>
                    {medication.end_date && (
                      <div>
                        <span className="text-gray-600">End Date:</span>
                        <p className="font-medium">{format(parseISO(medication.end_date), 'MMM dd, yyyy')}</p>
                      </div>
                    )}
                  </div>

                  {medication.prescribing_doctor && (
                    <div className="text-sm">
                      <span className="text-gray-600">Prescribed by:</span>
                      <p className="font-medium">{medication.prescribing_doctor}</p>
                    </div>
                  )}

                  {medication.instructions && (
                    <div className="text-sm">
                      <span className="text-gray-600">Instructions:</span>
                      <p className="font-medium">{medication.instructions}</p>
                    </div>
                  )}

                  {medication.notes && (
                    <div className="text-sm">
                      <span className="text-gray-600">Notes:</span>
                      <p className="font-medium">{medication.notes}</p>
                    </div>
                  )}

                  {/* Reminders */}
                  {medicationReminders.length > 0 && (
                    <div className="border-t pt-3">
                      <div className="flex items-center space-x-2 mb-2">
                        <Clock className="w-4 h-4 text-blue-500" />
                        <span className="text-sm font-medium text-gray-700">Reminders</span>
                      </div>
                      <div className="space-y-1">
                        {medicationReminders.map((reminder, idx) => (
                          <div key={idx} className="text-sm text-gray-600">
                            {reminder.reminder_time} • {reminder.days_of_week?.join(', ')}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* View Details Button */}
                  <Button
                    onClick={() => navigate(`/add?tab=medication&view=${medication.id}`)}
                    variant="outline"
                    className="w-full mt-3"
                    size="sm"
                  >
                    View Medication Details
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <Pill className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No medications yet</h3>
          <p className="text-gray-600 mb-6">
            Start tracking your medications to get reminders and insights.
          </p>
          <Button
            onClick={() => navigate('/add?tab=medication')}
            className="bg-[#2ecac8] hover:bg-[#338886]"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Medication
          </Button>
        </div>
      )}
    </div>
  );
};

export default Medications;
