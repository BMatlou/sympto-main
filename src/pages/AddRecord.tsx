
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Plus, Pill, Activity, FileText, Droplet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useAddSymptom, useAddMedication } from '@/hooks/useSupabaseData';
import SymptomSearch from '@/components/SymptomSearch';
import MedicationInfo from '@/components/MedicationInfo';
import { toast } from 'sonner';

const AddRecord = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const addSymptom = useAddSymptom();
  const addMedication = useAddMedication();

  const recordType = searchParams.get('type') || 'symptom';
  const preselectedSymptom = searchParams.get('symptom') || '';

  const [symptomForm, setSymptomForm] = useState({
    symptom: preselectedSymptom,
    severity: 5,
    description: '',
    triggers: [] as string[],
    notes: ''
  });

  const [medicationForm, setMedicationForm] = useState({
    name: '',
    dosage: '',
    frequency: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    instructions: '',
    prescribing_doctor: '',
    notes: ''
  });

  const [triggerInput, setTriggerInput] = useState('');
  const [showMedicationInfo, setShowMedicationInfo] = useState(false);

  const handleSymptomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!symptomForm.symptom.trim()) {
      toast.error('Please select or enter a symptom');
      return;
    }

    try {
      const symptomData = {
        symptom: symptomForm.symptom,
        severity: symptomForm.severity,
        description: symptomForm.description || null,
        triggers: symptomForm.triggers.length > 0 ? symptomForm.triggers : null,
        notes: symptomForm.notes || null,
        logged_at: new Date().toISOString()
      };

      await addSymptom.mutateAsync(symptomData);
      
      // Store symptom data for AI recommendations
      localStorage.setItem('lastSymptom', symptomForm.symptom);
      localStorage.setItem('lastSeverity', symptomForm.severity.toString());
      
      // Navigate to AI recommendations
      navigate(`/symptom-recommendations?symptom=${encodeURIComponent(symptomForm.symptom)}&severity=${symptomForm.severity}`);
    } catch (error) {
      console.error('Error logging symptom:', error);
      toast.error('Failed to log symptom');
    }
  };

  const handleMedicationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!medicationForm.name.trim()) {
      toast.error('Please enter medication name');
      return;
    }

    try {
      await addMedication.mutateAsync({
        name: medicationForm.name,
        dosage: medicationForm.dosage,
        frequency: medicationForm.frequency,
        start_date: medicationForm.start_date,
        end_date: medicationForm.end_date || null,
        instructions: medicationForm.instructions || null,
        prescribing_doctor: medicationForm.prescribing_doctor || null,
        notes: medicationForm.notes || null
      });

      navigate('/add');
    } catch (error) {
      console.error('Error adding medication:', error);
      toast.error('Failed to add medication');
    }
  };

  const addTrigger = () => {
    if (triggerInput.trim() && !symptomForm.triggers.includes(triggerInput.trim())) {
      setSymptomForm(prev => ({
        ...prev,
        triggers: [...prev.triggers, triggerInput.trim()]
      }));
      setTriggerInput('');
    }
  };

  const removeTrigger = (trigger: string) => {
    setSymptomForm(prev => ({
      ...prev,
      triggers: prev.triggers.filter(t => t !== trigger)
    }));
  };

  const handleMedicationReminderSet = (reminderData: any) => {
    // Handle reminder data - this would typically be saved to a reminders table
    console.log('Reminder set:', reminderData);
    toast.success('Medication reminder configured!');
  };

  const frequencyOptions = [
    'Once daily', 'Twice daily', 'Three times daily', 'Four times daily',
    'Every 4 hours', 'Every 6 hours', 'Every 8 hours', 'Every 12 hours',
    'As needed', 'Weekly', 'Monthly', 'Other'
  ];

  return (
    <div className="p-4 pb-20 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center mb-6">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors mr-3"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          {recordType === 'symptom' ? 'Log Symptom' : 'Add Medication'}
        </h1>
      </div>

      {/* Record Type Selector */}
      <div className="flex space-x-2 mb-6">
        <Button
          onClick={() => navigate('/add-record?type=symptom')}
          variant={recordType === 'symptom' ? 'default' : 'outline'}
          className={`flex-1 ${recordType === 'symptom' ? 'bg-[#2ecac8] hover:bg-[#338886]' : ''}`}
        >
          <Activity className="w-4 h-4 mr-2" />
          Symptom
        </Button>
        <Button
          onClick={() => navigate('/add-record?type=medication')}
          variant={recordType === 'medication' ? 'default' : 'outline'}
          className={`flex-1 ${recordType === 'medication' ? 'bg-[#2ecac8] hover:bg-[#338886]' : ''}`}
        >
          <Pill className="w-4 h-4 mr-2" />
          Medication
        </Button>
      </div>

      {recordType === 'symptom' ? (
        /* Symptom Form */
        <form onSubmit={handleSymptomSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Symptom Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="symptom">Symptom *</Label>
                <SymptomSearch 
                  onSymptomSelect={(symptom) => setSymptomForm(prev => ({ ...prev, symptom }))}
                  selectedSymptom={symptomForm.symptom}
                />
              </div>

              <div>
                <Label htmlFor="severity">Severity: {symptomForm.severity}/10</Label>
                <Slider
                  value={[symptomForm.severity]}
                  onValueChange={(value) => setSymptomForm(prev => ({ ...prev, severity: value[0] }))}
                  max={10}
                  min={1}
                  step={1}
                  className="mt-2"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Mild</span>
                  <span>Moderate</span>
                  <span>Severe</span>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={symptomForm.description}
                  onChange={(e) => setSymptomForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your symptom in detail..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="triggers">Triggers</Label>
                <div className="flex space-x-2 mt-1">
                  <Input
                    value={triggerInput}
                    onChange={(e) => setTriggerInput(e.target.value)}
                    placeholder="e.g., stress, food, weather"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTrigger())}
                  />
                  <Button type="button" onClick={addTrigger} size="sm">
                    Add
                  </Button>
                </div>
                {symptomForm.triggers.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {symptomForm.triggers.map((trigger) => (
                      <span
                        key={trigger}
                        onClick={() => removeTrigger(trigger)}
                        className="px-2 py-1 bg-[#2ecac8]/10 text-[#2ecac8] text-sm rounded cursor-pointer hover:bg-[#2ecac8]/20"
                      >
                        {trigger} ×
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={symptomForm.notes}
                  onChange={(e) => setSymptomForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Any additional information..."
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          <Button
            type="submit"
            disabled={addSymptom.isPending || !symptomForm.symptom.trim()}
            className="w-full bg-[#2ecac8] hover:bg-[#338886] text-white"
          >
            {addSymptom.isPending ? 'Logging Symptom...' : 'Log Symptom & Get AI Recommendations'}
          </Button>
        </form>
      ) : (
        /* Medication Form */
        <form onSubmit={handleMedicationSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Medication Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="med_name">Medication Name *</Label>
                <Input
                  id="med_name"
                  value={medicationForm.name}
                  onChange={(e) => {
                    setMedicationForm(prev => ({ ...prev, name: e.target.value }));
                    setShowMedicationInfo(false);
                  }}
                  placeholder="Enter medication name"
                  required
                />
                {medicationForm.name.length > 2 && (
                  <Button
                    type="button"
                    onClick={() => setShowMedicationInfo(true)}
                    variant="outline"
                    size="sm"
                    className="mt-2"
                  >
                    View Medication Information
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dosage">Dosage *</Label>
                  <Input
                    id="dosage"
                    value={medicationForm.dosage}
                    onChange={(e) => setMedicationForm(prev => ({ ...prev, dosage: e.target.value }))}
                    placeholder="e.g., 10mg, 1 tablet"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="frequency">Frequency *</Label>
                  <Select
                    value={medicationForm.frequency}
                    onValueChange={(value) => setMedicationForm(prev => ({ ...prev, frequency: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      {frequencyOptions.map(option => (
                        <SelectItem key={option} value={option}>{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_date">Start Date *</Label>
                  <Input
                    type="date"
                    id="start_date"
                    value={medicationForm.start_date}
                    onChange={(e) => setMedicationForm(prev => ({ ...prev, start_date: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="end_date">End Date</Label>
                  <Input
                    type="date"
                    id="end_date"
                    value={medicationForm.end_date}
                    onChange={(e) => setMedicationForm(prev => ({ ...prev, end_date: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="doctor">Prescribing Doctor</Label>
                <Input
                  id="doctor"
                  value={medicationForm.prescribing_doctor}
                  onChange={(e) => setMedicationForm(prev => ({ ...prev, prescribing_doctor: e.target.value }))}
                  placeholder="Doctor's name"
                />
              </div>

              <div>
                <Label htmlFor="instructions">Instructions</Label>
                <Textarea
                  id="instructions"
                  value={medicationForm.instructions}
                  onChange={(e) => setMedicationForm(prev => ({ ...prev, instructions: e.target.value }))}
                  placeholder="Take with food, before meals, etc."
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="med_notes">Notes</Label>
                <Textarea
                  id="med_notes"
                  value={medicationForm.notes}
                  onChange={(e) => setMedicationForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes about this medication"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {showMedicationInfo && medicationForm.name && (
            <MedicationInfo 
              medicationName={medicationForm.name}
              onReminderSet={handleMedicationReminderSet}
            />
          )}

          <Button
            type="submit"
            disabled={addMedication.isPending || !medicationForm.name.trim()}
            className="w-full bg-[#2ecac8] hover:bg-[#338886] text-white"
          >
            {addMedication.isPending ? 'Adding Medication...' : 'Add Medication'}
          </Button>
        </form>
      )}
    </div>
  );
};

export default AddRecord;
