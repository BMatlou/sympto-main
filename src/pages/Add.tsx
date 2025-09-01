import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Plus, Upload, FileText, Pill, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAddSymptom, useAddMedication, useAddMedicalRecord, useUploadFile } from "@/hooks/useSupabaseData";
import { useAddHealthMetric } from "@/hooks/useHealthMetrics";
import { useAddWaterIntake } from "@/hooks/useWaterIntake";
import { useAddMedicationReminder } from "@/hooks/useMedicationTracking";
import MedicationInfo from "@/components/MedicationInfo";
import SymptomSearch from "@/components/SymptomSearch";
import { supabase } from '../supabaseClient';
import { toast } from "sonner";

const Add = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'symptom';
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [showMedicationInfo, setShowMedicationInfo] = useState(false);

  const addSymptom = useAddSymptom();
  const addMedication = useAddMedication();
  const addMedicalRecord = useAddMedicalRecord();
  const addHealthMetric = useAddHealthMetric();
  const addWaterIntake = useAddWaterIntake();
  const addMedicationReminder = useAddMedicationReminder();
  const uploadFile = useUploadFile();

  const [symptomData, setSymptomData] = useState({
    symptom: '',
    severity: 5,
    description: '',
    triggers: [] as string[],
    notes: ''
  });

  const [medicationData, setMedicationData] = useState({
    name: '',
    dosage: '',
    frequency: '',
    start_date: '',
    end_date: '',
    prescribing_doctor: '',
    instructions: '',
    notes: ''
  });

  const [medicalRecordData, setMedicalRecordData] = useState({
    title: '',
    record_type: '',
    description: '',
    doctor_name: '',
    facility_name: '',
    date_of_record: '',
    file: null as File | null
  });

  const [healthMetricData, setHealthMetricData] = useState({
    metric_type: '',
    value: '',
    unit: ''
  });

  const [waterAmount, setWaterAmount] = useState('');
  const [reminderData, setReminderData] = useState({
    times: ['08:00'],
    days: [1, 2, 3, 4, 5, 6, 0],
    enabled: true
  });

  const commonSymptoms = [
    'Headache', 'Fatigue', 'Nausea', 'Dizziness', 'Fever',
    'Cough', 'Chest Pain', 'Shortness of Breath', 'Back Pain', 'Joint Pain'
  ];

  const recordTypes = [
    'Lab Results', 'X-Ray', 'MRI', 'CT Scan', 'Prescription',
    'Doctor Visit', 'Surgery Report', 'Vaccination Record', 'Other'
  ];

  const metricTypes = [
    { value: 'heart_rate', label: 'Heart Rate', unit: 'bpm' },
    { value: 'blood_pressure', label: 'Blood Pressure', unit: 'mmHg' },
    { value: 'weight', label: 'Weight', unit: 'kg' },
    { value: 'temperature', label: 'Temperature', unit: '°C' },
    { value: 'blood_sugar', label: 'Blood Sugar', unit: 'mg/dL' },
    { value: 'steps', label: 'Steps', unit: 'steps' }
  ];

  const handleSymptomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptomData.symptom) {
      toast.error('Please enter a symptom');
      return;
    }

    try {
      await addSymptom.mutateAsync({
        ...symptomData,
        logged_at: new Date().toISOString()
      });
      
      setSymptomData({
        symptom: '',
        severity: 5,
        description: '',
        triggers: [],
        notes: ''
      });
      
      // Navigate to AI recommendations
      navigate(`/symptom-recommendations?symptom=${encodeURIComponent(symptomData.symptom)}&severity=${symptomData.severity}`);
    } catch (error) {
      console.error('Error adding symptom:', error);
    }
  };

  const handleMedicationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!medicationData.name || !medicationData.dosage || !medicationData.frequency || !medicationData.start_date) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const medication = await addMedication.mutateAsync(medicationData);
      
      // Set up reminders if enabled
      if (reminderData.enabled && reminderData.times.length > 0) {
        for (const time of reminderData.times) {
          await addMedicationReminder.mutateAsync({
            medication_id: medication.id,
            reminder_time: time,
            days_of_week: reminderData.days,
            is_active: true
          });
        }
      }

      setMedicationData({
        name: '',
        dosage: '',
        frequency: '',
        start_date: '',
        end_date: '',
        prescribing_doctor: '',
        instructions: '',
        notes: ''
      });

      // Navigate to medications page
      navigate('/medications');
    } catch (error) {
      console.error('Error adding medication:', error);
    }
  };
const handleMedicalRecordSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  console.log('Submitting medical record...');

  if (!medicalRecordData.title || !medicalRecordData.record_type) {
    toast.error('Please fill in required fields');
    return;
  }

  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      console.error('User retrieval error:', userError);
      toast.error('User not authenticated');
      return;
    }
    const userId = userData.user.id;
    console.log('User ID:', userId);

    let fileUrl: string | null = null;

    if (medicalRecordData.file) {
      const fileName = `${Date.now()}_${medicalRecordData.file.name}`;
      console.log('Uploading file:', fileName);

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('medical-records')
        .upload(fileName, medicalRecordData.file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        toast.error(`File upload failed: ${uploadError.message}`);
        return;
      }
      console.log('File uploaded successfully:', uploadData);

      const { data: signedData, error: signedError } = await supabase.storage
        .from('medical-records')
        .createSignedUrl(fileName, 60 * 60);

      if (signedError) {
        console.error('Signed URL error:', signedError);
        toast.error(`Failed to generate file URL: ${signedError.message}`);
        return;
      }

      fileUrl = signedData.signedUrl;
      console.log('Signed URL generated:', fileUrl);
    }

    const { error: insertError } = await supabase.from('medical_records').insert([
      {
        title: medicalRecordData.title,
        record_type: medicalRecordData.record_type,
        description: medicalRecordData.description,
        doctor_name: medicalRecordData.doctor_name,
        facility_name: medicalRecordData.facility_name,
        date_of_record: medicalRecordData.date_of_record,
        file_url: fileUrl,
        file_name: medicalRecordData.file?.name || null,
        file_size: medicalRecordData.file?.size || null,
        user_id: userId,
      },
    ]);

    if (insertError) {
      console.error('Database insert error:', insertError);
      toast.error(`Failed to add medical record: ${insertError.message}`);
      return;
    }

    toast.success('Medical record added!');
    setMedicalRecordData({
      title: '',
      record_type: '',
      description: '',
      doctor_name: '',
      facility_name: '',
      date_of_record: '',
      file: null,
    });

    navigate('/medical-records');
  } catch (err) {
    console.error('Unexpected error:', err);
    toast.error('Failed to add medical record');
  }
};

  const handleHealthMetricSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!healthMetricData.metric_type || !healthMetricData.value) {
      toast.error('Please fill in required fields');
      return;
    }

    try {
      await addHealthMetric.mutateAsync({
        ...healthMetricData,
        value: parseFloat(healthMetricData.value),
        recorded_at: new Date().toISOString()
      });

      setHealthMetricData({
        metric_type: '',
        value: '',
        unit: ''
      });
    } catch (error) {
      console.error('Error adding health metric:', error);
    }
  };

  const handleWaterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!waterAmount) {
      toast.error('Please enter water amount');
      return;
    }

    try {
      await addWaterIntake.mutateAsync(parseInt(waterAmount));
      setWaterAmount('');
    } catch (error) {
      console.error('Error adding water intake:', error);
    }
  };

  const handleReminderSet = (newReminderData: any) => {
    setReminderData(newReminderData);
    toast.success('Medication reminders will be set when you save the medication');
  };

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
        <h1 className="text-2xl font-bold text-gray-900">Add Health Data</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="symptom">Symptom</TabsTrigger>
          <TabsTrigger value="medication">Medication</TabsTrigger>
          <TabsTrigger value="records">Records</TabsTrigger>
        </TabsList>

        <TabsContent value="symptom">
          <Card>
            <CardHeader>
              <CardTitle>Log Symptom</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSymptomSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="symptom">Symptom *</Label>
                  <Input
                    id="symptom"
                    value={symptomData.symptom}
                    onChange={(e) => setSymptomData(prev => ({ ...prev, symptom: e.target.value }))}
                    placeholder="e.g., Headache"
                    required
                  />
                  <div className="flex flex-wrap gap-2 mt-2">
                    {commonSymptoms.map((symptom) => (
                      <button
                        key={symptom}
                        type="button"
                        onClick={() => setSymptomData(prev => ({ ...prev, symptom }))}
                        className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                      >
                        {symptom}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="severity">Severity (1-10) *</Label>
                  <div className="flex items-center space-x-4 mt-2">
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={symptomData.severity}
                      onChange={(e) => setSymptomData(prev => ({ ...prev, severity: parseInt(e.target.value) }))}
                      className="flex-1"
                    />
                    <span className="w-8 text-center font-semibold">{symptomData.severity}</span>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={symptomData.description}
                    onChange={(e) => setSymptomData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe the symptom in detail..."
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    value={symptomData.notes}
                    onChange={(e) => setSymptomData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Any other relevant information..."
                  />
                </div>

                <Button type="submit" className="w-full bg-[#2ecac8] hover:bg-[#338886]">
                  Log Symptom
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="medication">
          <Card>
            <CardHeader>
              <CardTitle>Add Medication</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleMedicationSubmit} className="space-y-4">
                <div>
                  <div className="flex justify-between items-center">
                    <Label htmlFor="medication_name">Medication Name *</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowMedicationInfo(true)}
                      disabled={!medicationData.name}
                    >
                      <Info className="w-4 h-4 mr-1" />
                      View Info
                    </Button>
                  </div>
                  <Input
                    id="medication_name"
                    value={medicationData.name}
                    onChange={(e) => setMedicationData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Ibuprofen"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="dosage">Dosage *</Label>
                    <Input
                      id="dosage"
                      value={medicationData.dosage}
                      onChange={(e) => setMedicationData(prev => ({ ...prev, dosage: e.target.value }))}
                      placeholder="e.g., 200mg"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="frequency">Frequency *</Label>
                    <Select value={medicationData.frequency} onValueChange={(value) => setMedicationData(prev => ({ ...prev, frequency: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="How often?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Once daily">Once daily</SelectItem>
                        <SelectItem value="Twice daily">Twice daily</SelectItem>
                        <SelectItem value="Three times daily">Three times daily</SelectItem>
                        <SelectItem value="Four times daily">Four times daily</SelectItem>
                        <SelectItem value="As needed">As needed</SelectItem>
                        <SelectItem value="Weekly">Weekly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start_date">Start Date *</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={medicationData.start_date}
                      onChange={(e) => setMedicationData(prev => ({ ...prev, start_date: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="end_date">End Date</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={medicationData.end_date}
                      onChange={(e) => setMedicationData(prev => ({ ...prev, end_date: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="prescribing_doctor">Prescribing Doctor</Label>
                  <Input
                    id="prescribing_doctor"
                    value={medicationData.prescribing_doctor}
                    onChange={(e) => setMedicationData(prev => ({ ...prev, prescribing_doctor: e.target.value }))}
                    placeholder="Doctor's name"
                  />
                </div>

                <div>
                  <Label htmlFor="instructions">Instructions</Label>
                  <Textarea
                    id="instructions"
                    value={medicationData.instructions}
                    onChange={(e) => setMedicationData(prev => ({ ...prev, instructions: e.target.value }))}
                    placeholder="Special instructions for taking this medication..."
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={medicationData.notes}
                    onChange={(e) => setMedicationData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Additional notes..."
                  />
                </div>

                <Button type="submit" className="w-full bg-[#2ecac8] hover:bg-[#338886]">
                  Save Medication
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="records">
          <div className="space-y-4">
            <Tabs defaultValue="health-metrics" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="health-metrics">Metrics</TabsTrigger>
                <TabsTrigger value="water">Water</TabsTrigger>
                <TabsTrigger value="medical-records">Records</TabsTrigger>
              </TabsList>

              <TabsContent value="health-metrics">
                <Card>
                  <CardHeader>
                    <CardTitle>Health Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleHealthMetricSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="metric_type">Metric Type *</Label>
                        <Select 
                          value={healthMetricData.metric_type} 
                          onValueChange={(value) => {
                            const selectedMetric = metricTypes.find(m => m.value === value);
                            setHealthMetricData(prev => ({ 
                              ...prev, 
                              metric_type: value,
                              unit: selectedMetric?.unit || ''
                            }));
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select metric type" />
                          </SelectTrigger>
                          <SelectContent>
                            {metricTypes.map((metric) => (
                              <SelectItem key={metric.value} value={metric.value}>
                                {metric.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="value">Value *</Label>
                          <Input
                            id="value"
                            type="number"
                            step="0.1"
                            value={healthMetricData.value}
                            onChange={(e) => setHealthMetricData(prev => ({ ...prev, value: e.target.value }))}
                            placeholder="Enter value"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="unit">Unit</Label>
                          <Input
                            id="unit"
                            value={healthMetricData.unit}
                            onChange={(e) => setHealthMetricData(prev => ({ ...prev, unit: e.target.value }))}
                            placeholder="Unit"
                            readOnly
                          />
                        </div>
                      </div>

                      <Button type="submit" className="w-full bg-[#2ecac8] hover:bg-[#338886]">
                        Record Metric
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="water">
                <Card>
                  <CardHeader>
                    <CardTitle>Water Intake</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleWaterSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="water_amount">Amount (ml) *</Label>
                        <Input
                          id="water_amount"
                          type="number"
                          value={waterAmount}
                          onChange={(e) => setWaterAmount(e.target.value)}
                          placeholder="e.g., 250"
                          required
                        />
                        <div className="flex flex-wrap gap-2 mt-2">
                          {[250, 500, 750, 1000].map((amount) => (
                            <button
                              key={amount}
                              type="button"
                              onClick={() => setWaterAmount(amount.toString())}
                              className="px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-full transition-colors"
                            >
                              {amount}ml
                            </button>
                          ))}
                        </div>
                      </div>

                      <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-600">
                        Add Water Intake
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="medical-records">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <FileText className="w-5 h-5" />
                      <span>Add Medical Record</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleMedicalRecordSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="record_title">Title *</Label>
                        <Input
                          id="record_title"
                          value={medicalRecordData.title}
                          onChange={(e) => setMedicalRecordData(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="e.g., Blood Test Results"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="record_type">Record Type *</Label>
                        <Select value={medicalRecordData.record_type} onValueChange={(value) => setMedicalRecordData(prev => ({ ...prev, record_type: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select record type" />
                          </SelectTrigger>
                          <SelectContent>
                            {recordTypes.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="record_description">Description</Label>
                        <Textarea
                          id="record_description"
                          value={medicalRecordData.description}
                          onChange={(e) => setMedicalRecordData(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Brief description of the record..."
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="doctor_name">Doctor Name</Label>
                          <Input
                            id="doctor_name"
                            value={medicalRecordData.doctor_name}
                            onChange={(e) => setMedicalRecordData(prev => ({ ...prev, doctor_name: e.target.value }))}
                            placeholder="Dr. Smith"
                          />
                        </div>
                        <div>
                          <Label htmlFor="facility_name">Facility</Label>
                          <Input
                            id="facility_name"
                            value={medicalRecordData.facility_name}
                            onChange={(e) => setMedicalRecordData(prev => ({ ...prev, facility_name: e.target.value }))}
                            placeholder="Hospital/Clinic"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="date_of_record">Date of Record</Label>
                        <Input
                          id="date_of_record"
                          type="date"
                          value={medicalRecordData.date_of_record}
                          onChange={(e) => setMedicalRecordData(prev => ({ ...prev, date_of_record: e.target.value }))}
                        />
                      </div>

                      <div>
                        <Label htmlFor="file">Upload File (PDF, Image)</Label>
                        <div className="mt-2">
                          <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                            <div className="text-center">
                              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                              <p className="text-sm text-gray-600">
                                {medicalRecordData.file ? medicalRecordData.file.name : 'Click to upload file'}
                              </p>
                              <p className="text-xs text-gray-500">PDF, JPG, PNG up to 10MB</p>
                            </div>
                            <input
                              type="file"
                              className="hidden"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  setMedicalRecordData(prev => ({ ...prev, file }));
                                }
                              }}
                            />
                          </label>
                        </div>
                      </div>

                      <Button type="submit" className="w-full bg-[#2ecac8] hover:bg-[#338886]">
                        Save Medical Record
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </TabsContent>
      </Tabs>

      {/* Medication Info Modal */}
      <Dialog open={showMedicationInfo} onOpenChange={setShowMedicationInfo}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Medication Information</DialogTitle>
          </DialogHeader>
          {medicationData.name && (
            <MedicationInfo
              medicationName={medicationData.name}
              onReminderSet={handleReminderSet}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Add;
