import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Share2, Mail, Download, FileText } from 'lucide-react';
import { 
  useUserProfile, 
  useSymptoms, 
  useAppointments, 
  useMedications, 
  useHealthMetrics, 
  useWaterIntake,
  useMedicalRecords
} from '@/hooks/useSupabaseData';
import { useUserSettings } from '@/hooks/useUserSettings';
import { useNutritionLog } from '@/hooks/useNutrition';
import { useActivitySessions } from '@/hooks/useActivitySessions';
import { useMedicationLogs } from '@/hooks/useMedicationTracking';
import { generatePDFReport } from '@/utils/pdfGenerator';
import { generateMedicalRecordPDF, generateAllMedicalRecordsPDF } from '@/utils/medicalRecordsPdfGenerator';
import { toast } from 'sonner';
import { format } from 'date-fns';

const HealthDataSharingDialog: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [doctorEmail, setDoctorEmail] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  const [shareMethod, setShareMethod] = useState<'email' | 'download'>('email');
  const [showFullIdNumber, setShowFullIdNumber] = useState(false);
  const [includeMedicalRecords, setIncludeMedicalRecords] = useState(true);

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

  const generateReportData = () => {
    const healthScore = calculateHealthScore();
    
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
      medicationReminders: [],
      medicalRecords: medicalRecords || [],
      aiRecommendations: [],
      generatedAt: new Date().toISOString(),
      settings: userSettings,
      showFullIdNumber: showFullIdNumber
    };
  };

  const downloadMedicalRecordsPDFs = (reportData: any) => {
    if (!includeMedicalRecords || !reportData.medicalRecords?.length) return;

    // Generate individual medical record PDFs
    reportData.medicalRecords.forEach((record: any) => {
      const medicalRecordPdf = generateMedicalRecordPDF(record, reportData.patient.name);
      medicalRecordPdf.save(`${record.title.replace(/\s+/g, '-')}-medical-record-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    });

    // Generate combined medical records PDF if multiple records
    if (reportData.medicalRecords.length > 1) {
      const combinedPdf = generateAllMedicalRecordsPDF(reportData.medicalRecords, reportData.patient.name);
      combinedPdf.save(`all-medical-records-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    }
  };

  const handleDownload = async () => {
    try {
      setIsSharing(true);
      const reportData = generateReportData();
      
      // Generate main comprehensive report
      const pdf = generatePDFReport(reportData);
      pdf.save(`comprehensive-health-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
      
      // Generate medical records PDFs
      downloadMedicalRecordsPDFs(reportData);
      
      const attachmentCount = 1 + (includeMedicalRecords ? (reportData.medicalRecords?.length || 0) : 0);
      toast.success(`${attachmentCount} PDF file(s) downloaded successfully! Medical records are included as separate files.`);
      setOpen(false);
    } catch (error) {
      console.error('Error downloading report:', error);
      toast.error('Failed to download report');
    } finally {
      setIsSharing(false);
    }
  };

  const handleEmailShare = async () => {
    if (!doctorEmail.trim()) {
      toast.error('Please enter a healthcare provider\'s email address');
      return;
    }

    try {
      setIsSharing(true);
      const reportData = generateReportData();
      const pdf = generatePDFReport(reportData);
      
      const pdfBlob = pdf.output('blob');
      const reader = new FileReader();
      
      reader.onload = async () => {
        const medicalRecordsNote = includeMedicalRecords && reportData.medicalRecords?.length > 0 
          ? `\n\nMEDICAL RECORDS INCLUDED:\n${reportData.medicalRecords.map((r: any, i: number) => `${i + 1}. ${r.title} (${r.record_type})`).join('\n')}\n\nNote: Individual medical record PDFs are being downloaded separately. Please attach these files along with the comprehensive report.`
          : '';

        const subject = `Comprehensive Health Report with Medical Records - ${reportData.patient.name} | Sympto`;
        const body = `Dear Healthcare Provider,

Please find attached my comprehensive health report generated from Sympto Health Tracking Application on ${format(new Date(), 'MMMM dd, yyyy')}.

PATIENT SUMMARY:
• Name: ${reportData.patient.name}
• Health Score: ${reportData.healthScore}/10
• Age: ${reportData.patient.age} | Gender: ${reportData.patient.gender}
• Current Medications: ${reportData.medications.length}
• Recent Symptoms: ${reportData.symptoms.length} logged entries
• Health Metrics: ${reportData.healthMetrics.length} data points
• Activity Sessions: ${reportData.activitySessions.length} recorded
• Medical Records: ${reportData.medicalRecords.length} documents${medicalRecordsNote}

COMPREHENSIVE REPORT INCLUDES:
✅ Complete patient demographics and medical history
✅ Detailed symptoms tracking with severity levels and triggers
✅ Current medications with adherence tracking
✅ Vital signs trends and health metrics over time
✅ Physical activity and nutrition data
✅ Appointment history and medical records references
✅ AI-generated health insights and recommendations
✅ Data accuracy notes and privacy settings
✅ Individual medical record PDF files (downloaded separately)

This report is designed to facilitate our medical consultation and provide you with comprehensive insight into my health tracking data and uploaded medical records.

Best regards,
${reportData.patient.name}

---
Generated by Sympto Health Tracking Application
"Symptoms Managed Proactively by Tracking for Better Health Outcomes"`;

        await navigator.clipboard.writeText(`To: ${doctorEmail}\nSubject: ${subject}\n\n${body}`);
        
        // Download main report
        pdf.save(`comprehensive-health-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
        
        // Download medical records PDFs
        downloadMedicalRecordsPDFs(reportData);
        
        const totalFiles = 1 + (includeMedicalRecords ? (reportData.medicalRecords?.length || 0) : 0);
        toast.success(`Professional email template copied to clipboard and ${totalFiles} PDF file(s) downloaded! Please attach all PDF files to your email.`);
        setDoctorEmail('');
        setOpen(false);
      };
      
      reader.readAsDataURL(pdfBlob);
    } catch (error) {
      console.error('Failed to share comprehensive health data:', error);
      toast.error('Failed to prepare professional email. Please try downloading the PDFs instead.');
    } finally {
      setIsSharing(false);
    }
  };

  const handleShare = () => {
    if (shareMethod === 'email') {
      handleEmailShare();
    } else {
      handleDownload();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Share2 className="w-4 h-4 mr-2" />
          Share Comprehensive Health Data
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Professional Health Report</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex space-x-2">
            <Button
              onClick={() => setShareMethod('email')}
              variant={shareMethod === 'email' ? 'default' : 'outline'}
              className="flex-1"
            >
              <Mail className="w-4 h-4 mr-2" />
              Email
            </Button>
            <Button
              onClick={() => setShareMethod('download')}
              variant={shareMethod === 'download' ? 'default' : 'outline'}
              className="flex-1"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>

          {shareMethod === 'email' && (
            <div>
              <Label htmlFor="doctor-email">Healthcare Provider's Email</Label>
              <Input
                id="doctor-email"
                type="email"
                placeholder="doctor@example.com"
                value={doctorEmail}
                onChange={(e) => setDoctorEmail(e.target.value)}
              />
            </div>
          )}

          {/* Privacy Options */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="showFullId"
                checked={showFullIdNumber}
                onCheckedChange={(checked) => setShowFullIdNumber(checked === true)}
              />
              <Label htmlFor="showFullId" className="text-sm">
                Include full ID number (unmasked)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="includeMedicalRecords"
                checked={includeMedicalRecords}
                onCheckedChange={(checked) => setIncludeMedicalRecords(checked === true)}
              />
              <Label htmlFor="includeMedicalRecords" className="text-sm">
                Include medical records as separate PDFs
              </Label>
            </div>
            <p className="text-xs text-gray-600">
              Medical records will be generated as individual PDF files for detailed review
            </p>
          </div>
          
          <div className="text-sm text-gray-600">
            <p className="font-medium mb-2">This professional-grade package includes:</p>
            <div className="grid grid-cols-2 gap-1 text-xs">
              <div>✅ Sympto branded letterhead</div>
              <div>✅ Professional medical formatting</div>
              <div>✅ Complete patient demographics</div>
              <div>✅ Medical history & conditions</div>
              <div>✅ Symptoms with severity tracking</div>
              <div>✅ Medication adherence data</div>
              <div>✅ Vital signs & health trends</div>
              <div>✅ Activity & nutrition insights</div>
              <div>✅ Medical records references</div>
              <div>✅ Individual medical record PDFs</div>
              <div>✅ AI health recommendations</div>
              <div>✅ Professional medical disclaimer</div>
            </div>
            {medicalRecords && medicalRecords.length > 0 && (
              <p className="text-xs text-blue-600 mt-2">
                <FileText className="w-3 h-3 inline mr-1" />
                {medicalRecords.length} medical record PDF(s) will be included
              </p>
            )}
          </div>
          
          <div className="flex space-x-2">
            <Button
              onClick={handleShare}
              disabled={shareMethod === 'email' && !doctorEmail.trim() || isSharing}
              className="flex-1 bg-[#2ecac8] hover:bg-[#338886]"
            >
              {isSharing ? 'Generating...' : shareMethod === 'email' ? 'Send Complete Package' : 'Download All PDFs'}
            </Button>
            <Button
              onClick={() => setOpen(false)}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HealthDataSharingDialog;
