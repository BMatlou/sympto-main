
import React, { useState, useEffect } from 'react';
import { AlertTriangle, Info, Calendar, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface MedicationInfoProps {
  medicationName: string;
  onReminderSet?: (reminderData: any) => void;
}

interface MedicationData {
  id: string;
  medication_name: string;
  side_effects: string[];
  masked_symptoms: string[];
  drug_interactions: string[];
  description: string;
}

const MedicationInfo: React.FC<MedicationInfoProps> = ({ medicationName, onReminderSet }) => {
  const [medicationData, setMedicationData] = useState<MedicationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [showReminderForm, setShowReminderForm] = useState(false);
  const [reminderData, setReminderData] = useState({
    times: ['08:00'],
    days: [1, 2, 3, 4, 5, 6, 0], // All days by default
    enabled: true
  });

  useEffect(() => {
    if (medicationName) {
      loadMedicationInfo();
    }
  }, [medicationName]);

  const loadMedicationInfo = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('medication_info')
        .select('*')
        .ilike('medication_name', `%${medicationName}%`)
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading medication info:', error);
        // Create a placeholder entry for unknown medications
        setMedicationData({
          id: 'unknown',
          medication_name: medicationName,
          side_effects: ['Consult your doctor or pharmacist for detailed side effect information'],
          masked_symptoms: ['Unknown - please consult healthcare provider'],
          drug_interactions: ['Consult healthcare provider before combining with other medications'],
          description: 'Please consult your healthcare provider for detailed information about this medication.'
        });
        return;
      }

      if (data) {
        setMedicationData(data);
      }
    } catch (error) {
      console.error('Error loading medication info:', error);
      setMedicationData({
        id: 'unknown',
        medication_name: medicationName,
        side_effects: ['Consult your doctor or pharmacist for detailed side effect information'],
        masked_symptoms: ['Unknown - please consult healthcare provider'],
        drug_interactions: ['Consult healthcare provider before combining with other medications'],
        description: 'Please consult your healthcare provider for detailed information about this medication.'
      });
    } finally {
      setLoading(false);
    }
  };

  const addReminderTime = () => {
    setReminderData(prev => ({
      ...prev,
      times: [...prev.times, '08:00']
    }));
  };

  const removeReminderTime = (index: number) => {
    setReminderData(prev => ({
      ...prev,
      times: prev.times.filter((_, i) => i !== index)
    }));
  };

  const updateReminderTime = (index: number, time: string) => {
    setReminderData(prev => ({
      ...prev,
      times: prev.times.map((t, i) => i === index ? time : t)
    }));
  };

  const toggleDay = (day: number) => {
    setReminderData(prev => ({
      ...prev,
      days: prev.days.includes(day) 
        ? prev.days.filter(d => d !== day)
        : [...prev.days, day]
    }));
  };

  const handleSetReminder = () => {
    if (reminderData.times.length === 0) {
      toast.error('Please add at least one reminder time');
      return;
    }
    
    if (reminderData.days.length === 0) {
      toast.error('Please select at least one day');
      return;
    }

    onReminderSet?.(reminderData);
    toast.success('Medication reminder set successfully!');
    setShowReminderForm(false);
  };

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="p-6">
          <div className="text-center">Loading medication information...</div>
        </CardContent>
      </Card>
    );
  }

  if (!medicationData) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Description */}
      {medicationData.description && (
        <Card className="border-l-4 border-l-[#2ecac8]">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-[#2ecac8]">
              <Info className="w-5 h-5" />
              <span>About {medicationData.medication_name}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">{medicationData.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Side Effects */}
      <Card className="border-l-4 border-l-orange-500">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-orange-600">
            <AlertTriangle className="w-5 h-5" />
            <span>Potential Side Effects</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            {medicationData.side_effects.map((effect, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-orange-50 rounded-lg">
                <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
                <span className="text-gray-700">{effect}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Masked Symptoms */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-blue-600">
            <Info className="w-5 h-5" />
            <span>Symptoms This Medication May Mask</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            {medicationData.masked_symptoms.map((symptom, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                <span className="text-gray-700">{symptom}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Drug Interactions */}
      <Card className="border-l-4 border-l-red-500">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            <span>Drug Interactions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            {medicationData.drug_interactions.map((interaction, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg">
                <span className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                <span className="text-gray-700">{interaction}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Medication Reminders */}
      <Card className="border-l-4 border-l-[#2ecac8]">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-[#2ecac8]">
            <Clock className="w-5 h-5" />
            <span>Set Medication Reminders</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!showReminderForm ? (
            <Button
              onClick={() => setShowReminderForm(true)}
              className="w-full bg-gradient-to-r from-[#2ecac8] to-[#338886] hover:from-[#338886] hover:to-[#2ecac8] text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Set Up Reminders
            </Button>
          ) : (
            <div className="space-y-6">
              <div>
                <Label className="text-sm font-medium text-gray-700">Reminder Times</Label>
                <div className="space-y-3 mt-2">
                  {reminderData.times.map((time, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <Input
                        type="time"
                        value={time}
                        onChange={(e) => updateReminderTime(index, e.target.value)}
                        className="flex-1"
                      />
                      {reminderData.times.length > 1 && (
                        <Button
                          onClick={() => removeReminderTime(index)}
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    onClick={addReminderTime}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    Add Another Time
                  </Button>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700">Days of Week</Label>
                <div className="flex flex-wrap gap-2 mt-3">
                  {dayNames.map((day, index) => (
                    <button
                      key={index}
                      onClick={() => toggleDay(index)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                        reminderData.days.includes(index)
                          ? 'bg-gradient-to-r from-[#2ecac8] to-[#338886] text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <Label className="text-sm font-medium text-gray-700">Enable Reminders</Label>
                <Switch
                  checked={reminderData.enabled}
                  onCheckedChange={(checked) => setReminderData(prev => ({ ...prev, enabled: checked }))}
                />
              </div>

              <div className="flex space-x-3">
                <Button
                  onClick={handleSetReminder}
                  className="flex-1 bg-gradient-to-r from-[#2ecac8] to-[#338886] hover:from-[#338886] hover:to-[#2ecac8] text-white shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Set Reminders
                </Button>
                <Button
                  onClick={() => setShowReminderForm(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MedicationInfo;
