import { jsPDF } from 'jspdf';
import { format } from 'date-fns';

export interface ReportData {
  patient: {
    name: string;
    age: string | number;
    gender: string;
    id: string;
    height: string | number;
    weight: string | number;
    bmi: string;
    conditions: string[];
    allergies: string[];
    address: string;
    phone?: string;
    emergency_contact?: string;
    citizenship_status?: string;
    date_of_birth?: string;
  };
  healthScore: string;
  symptoms: any[];
  medications: any[];
  appointments: any[];
  healthMetrics: any[];
  waterIntake: any[];
  nutritionLog: any[];
  activitySessions: any[];
  medicationLogs: any[];
  medicationReminders: any[];
  medicalRecords: any[];
  aiRecommendations?: any[];
  generatedAt: string;
  settings: any;
  showFullIdNumber?: boolean;
}

export const generatePDFReport = (reportData: ReportData): jsPDF => {
  const doc = new jsPDF();
  let yPosition = 20;
  const pageHeight = doc.internal.pageSize.height;
  const pageWidth = doc.internal.pageSize.width;
  const margin = 20;

  // Brand colors (Sympto palette)
  const colors = {
    primary: [46, 202, 200] as const, // #2ecac8
    secondary: [51, 136, 134] as const, // #338886
    dark: [25, 55, 109] as const, // #19376d
    text: [51, 51, 51] as const, // #333333
    light: [245, 245, 245] as const, // #f5f5f5
    accent: [102, 204, 255] as const // #66ccff
  };

  const addNewPageIfNeeded = (requiredSpace: number = 40) => {
    if (yPosition + requiredSpace > pageHeight - margin) {
      doc.addPage();
      yPosition = 20;
      addHeader(); // Add header to each new page
    }
  };

  const addHeader = () => {
    // Header background
    doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.rect(0, 0, pageWidth, 35, 'F');
    
    // Logo placeholder (you can add actual logo image here)
    doc.setFillColor(255, 255, 255);
    doc.rect(15, 8, 25, 18, 'F');
    doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
    doc.setFontSize(12);
    doc.text('Sympto', 18, 18);
    
    // Title and tagline
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.text('COMPREHENSIVE HEALTH REPORT', 50, 18);
    
    doc.setFontSize(9);
    doc.text('Symptoms Managed Proactively by Tracking for Better Health Outcomes', 50, 26);
    
    yPosition = 45;
  };

  const addFooter = () => {
    const footerY = pageHeight - 15;
    doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
    doc.setFontSize(8);
    doc.text('Sympto Health Tracking Application | Generated for medical consultation purposes', 20, footerY);
    doc.text(`Page ${doc.getCurrentPageInfo().pageNumber}`, pageWidth - 40, footerY);
  };

  const addSectionHeader = (title: string, icon: string = '') => {
    addNewPageIfNeeded(25);
    
    // Section header background
    doc.setFillColor(colors.light[0], colors.light[1], colors.light[2]);
    doc.rect(15, yPosition - 5, pageWidth - 30, 15, 'F');
    
    // Section border
    doc.setDrawColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.setLineWidth(0.5);
    doc.line(15, yPosition - 5, pageWidth - 15, yPosition - 5);
    
    doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
    doc.setFontSize(14);
    doc.text(`${icon} ${title}`, 20, yPosition + 5);
    yPosition += 20;
  };

  const addText = (text: string, fontSize: number = 10, indent: number = 20, bold: boolean = false) => {
    addNewPageIfNeeded(8);
    doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
    doc.setFontSize(fontSize);
    
    if (bold) {
      doc.setFont(undefined, 'bold');
    } else {
      doc.setFont(undefined, 'normal');
    }
    
    const lines = doc.splitTextToSize(text, pageWidth - indent - margin);
    lines.forEach((line: string) => {
      addNewPageIfNeeded(8);
      doc.text(line, indent, yPosition);
      yPosition += fontSize === 10 ? 6 : 8;
    });
  };

  const addBulletPoint = (text: string, fontSize: number = 10) => {
    addNewPageIfNeeded(8);
    doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
    doc.setFontSize(fontSize);
    doc.setFont(undefined, 'normal');
    
    // Add colored bullet
    doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.circle(25, yPosition - 2, 1, 'F');
    
    const lines = doc.splitTextToSize(text, pageWidth - 50);
    lines.forEach((line: string, index: number) => {
      addNewPageIfNeeded(8);
      doc.text(line, 30, yPosition);
      yPosition += fontSize === 10 ? 6 : 8;
    });
  };

  const addHealthScoreCard = () => {
    addNewPageIfNeeded(40);
    
    // Health Score Card
    doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.roundedRect(20, yPosition, pageWidth - 40, 30, 5, 5, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.text('CURRENT HEALTH SCORE', 30, yPosition + 12);
    
    doc.setFontSize(24);
    doc.text(`${reportData.healthScore}/10`, 30, yPosition + 25);
    
    // Add health score interpretation
    const score = parseFloat(reportData.healthScore);
    let interpretation = 'Getting Started';
    if (score >= 8) interpretation = 'Excellent';
    else if (score >= 6) interpretation = 'Good';
    else if (score >= 4) interpretation = 'Fair';
    
    doc.setFontSize(12);
    doc.text(interpretation, pageWidth - 80, yPosition + 20);
    
    yPosition += 40;
  };

  const addMetricTable = (title: string, data: any[], columns: string[]) => {
    if (!data || data.length === 0) return;
    
    addSectionHeader(title, '📊');
    
    // Table header
    doc.setFillColor(colors.light[0], colors.light[1], colors.light[2]);
    doc.rect(20, yPosition, pageWidth - 40, 8, 'F');
    doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
    doc.setFontSize(9);
    doc.setFont(undefined, 'bold');
    
    const colWidth = (pageWidth - 40) / columns.length;
    columns.forEach((col, index) => {
      doc.text(col, 25 + (index * colWidth), yPosition + 5);
    });
    yPosition += 12;
    
    // Table data
    doc.setFont(undefined, 'normal');
    data.slice(0, 10).forEach((item, rowIndex) => {
      addNewPageIfNeeded(8);
      if (rowIndex % 2 === 0) {
        doc.setFillColor(250, 250, 250);
        doc.rect(20, yPosition - 2, pageWidth - 40, 8, 'F');
      }
      
      doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
      columns.forEach((col, colIndex) => {
        let value = '';
        switch(col) {
          case 'Date':
            value = format(new Date(item.logged_at || item.recorded_at || item.created_at), 'MM/dd/yy');
            break;
          case 'Symptom':
            value = item.symptom || '';
            break;
          case 'Severity':
            value = item.severity ? `${item.severity}/10` : '';
            break;
          case 'Medication':
            value = item.name || '';
            break;
          case 'Dosage':
            value = item.dosage || '';
            break;
          case 'Value':
            value = item.value ? `${item.value} ${item.unit || ''}` : '';
            break;
          case 'Type':
            value = item.metric_type || item.activity_type || item.record_type || '';
            break;
        }
        
        const truncated = value.length > 15 ? value.substring(0, 15) + '...' : value;
        doc.text(truncated, 25 + (colIndex * colWidth), yPosition + 3);
      });
      yPosition += 8;
    });
    yPosition += 10;
  };

  // Start building the report
  addHeader();
  
  // Generated date
  doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
  doc.setFontSize(10);
  doc.text(`Generated on ${format(new Date(reportData.generatedAt), 'MMMM dd, yyyy HH:mm')}`, 20, yPosition);
  yPosition += 20;

  // Health Score Card (prominent display)
  addHealthScoreCard();

  // Patient Information Section
  addSectionHeader('PATIENT INFORMATION', '👤');
  
  // Create a two-column layout for patient info
  const leftCol = [
    `Full Name: ${reportData.patient.name || 'Not provided'}`,
    `Age: ${reportData.patient.age || 'Not provided'}`,
    `Gender: ${reportData.patient.gender || 'Not provided'}`,
    `Height: ${reportData.patient.height || 'Not provided'} cm`,
    `Weight: ${reportData.patient.weight || 'Not provided'} kg`,
    `BMI: ${reportData.patient.bmi || 'Not calculated'}`
  ];
  
  const rightCol = [
    `Date of Birth: ${reportData.patient.date_of_birth ? format(new Date(reportData.patient.date_of_birth), 'MMM dd, yyyy') : 'Not provided'}`,
    `Phone: ${reportData.patient.phone || 'Not provided'}`,
    `Emergency Contact: ${reportData.patient.emergency_contact || 'Not provided'}`,
    `Address: ${reportData.patient.address || 'Not provided'}`,
    `Citizenship: ${reportData.patient.citizenship_status || 'Not provided'}`,
    `ID: ${reportData.patient.id ? (reportData.showFullIdNumber ? reportData.patient.id : `****${reportData.patient.id.slice(-4)}`) : 'Not provided'}`
  ];

  const startY = yPosition;
  leftCol.forEach(info => addText(info, 9, 25));
  
  const leftEndY = yPosition;
  yPosition = startY;
  rightCol.forEach(info => addText(info, 9, pageWidth / 2 + 10));
  
  yPosition = Math.max(leftEndY, yPosition) + 10;

  // Medical Conditions & Allergies
  if (reportData.patient.conditions && reportData.patient.conditions.length > 0) {
    addSectionHeader('MEDICAL CONDITIONS', '🏥');
    reportData.patient.conditions.forEach(condition => addBulletPoint(condition));
    yPosition += 5;
  }

  if (reportData.patient.allergies && reportData.patient.allergies.length > 0) {
    addSectionHeader('KNOWN ALLERGIES', '⚠️');
    reportData.patient.allergies.forEach(allergy => addBulletPoint(allergy));
    yPosition += 5;
  }

  // Current Medications Table
  if (reportData.medications && reportData.medications.length > 0) {
    addMetricTable('CURRENT MEDICATIONS', reportData.medications, ['Medication', 'Dosage', 'Type']);
    
    // Detailed medication info
    reportData.medications.slice(0, 5).forEach(medication => {
      addText(`${medication.name} - ${medication.dosage}`, 10, 25, true);
      addText(`Frequency: ${medication.frequency}`, 9, 30);
      if (medication.prescribing_doctor) {
        addText(`Prescribed by: Dr. ${medication.prescribing_doctor}`, 9, 30);
      }
      if (medication.start_date) {
        addText(`Started: ${format(new Date(medication.start_date), 'MMM dd, yyyy')}`, 9, 30);
      }
      yPosition += 3;
    });
  }

  // Symptoms History Table
  if (reportData.symptoms && reportData.symptoms.length > 0) {
    addMetricTable('SYMPTOMS HISTORY', reportData.symptoms, ['Date', 'Symptom', 'Severity']);
  }

  // Vital Signs & Health Metrics
  if (reportData.healthMetrics && reportData.healthMetrics.length > 0) {
    addMetricTable('VITAL SIGNS & HEALTH METRICS', reportData.healthMetrics, ['Date', 'Type', 'Value']);
  }

  // Activity & Exercise Data
  if (reportData.activitySessions && reportData.activitySessions.length > 0) {
    addSectionHeader('ACTIVITY & EXERCISE SESSIONS', '🏃');
    reportData.activitySessions.slice(0, 10).forEach(activity => {
      const startDate = format(new Date(activity.started_at), 'MMM dd, HH:mm');
      addText(`${startDate}: ${activity.activity_type}`, 10, 25, true);
      addText(`Duration: ${activity.duration_minutes} min | Calories: ${activity.calories_burned || 'N/A'}`, 9, 30);
      if (activity.distance_meters) {
        addText(`Distance: ${(activity.distance_meters / 1000).toFixed(2)} km`, 9, 30);
      }
      yPosition += 3;
    });
  }

  // Medical Records Section - Enhanced with links
  if (reportData.medicalRecords && reportData.medicalRecords.length > 0) {
    addSectionHeader('UPLOADED MEDICAL RECORDS', '📋');
    addText('The following medical records have been uploaded and are available for review:', 10, 25);
    addText('Note: Individual PDF files for each medical record are attached separately for detailed review.', 10, 25, true);
    yPosition += 10;
    
    reportData.medicalRecords.forEach((record, index) => {
      addNewPageIfNeeded(50);
      
      // Record card background
      doc.setFillColor(colors.light[0], colors.light[1], colors.light[2]);
      doc.rect(20, yPosition - 5, pageWidth - 40, 35, 'F');
      
      // Record title and type
      doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
      doc.setFontSize(12);
      doc.text(`${index + 1}. ${record.title}`, 25, yPosition + 5);
      
      // Record details
      const recordDate = record.date_of_record 
        ? format(new Date(record.date_of_record), 'MMM dd, yyyy')
        : format(new Date(record.created_at), 'MMM dd, yyyy');
      
      doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
      doc.setFontSize(10);
      doc.text(`Type: ${record.record_type}`, 25, yPosition + 12);
      doc.text(`Date: ${recordDate}`, 25, yPosition + 18);
      
      if (record.doctor_name) {
        doc.text(`Doctor: Dr. ${record.doctor_name}`, 120, yPosition + 12);
      }
      if (record.facility_name) {
        doc.text(`Facility: ${record.facility_name}`, 120, yPosition + 18);
      }
      
      if (record.description) {
        doc.setFontSize(9);
        const descLines = doc.splitTextToSize(record.description, pageWidth - 60);
        descLines.slice(0, 2).forEach((line: string, lineIndex: number) => {
          doc.text(line, 25, yPosition + 24 + (lineIndex * 5));
        });
      }
      
      // Add link reference for attached PDF
      if (record.file_name) {
        doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
        doc.setFontSize(8);
        doc.text(`📎 Attached PDF: ${record.file_name.replace(/\.[^/.]+$/, '')}-medical-record.pdf`, 25, yPosition + 32);
      }
      
      yPosition += 45;
    });
    
    // Medical records attachment note
    addNewPageIfNeeded(30);
    doc.setFillColor(colors.accent[0], colors.accent[1], colors.accent[2], 0.1);
    doc.rect(20, yPosition, pageWidth - 40, 25, 'F');
    doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
    doc.setFontSize(10);
    doc.text('📋 MEDICAL RECORDS ATTACHMENTS', 25, yPosition + 8);
    doc.setFontSize(9);
    doc.text('The following files are attached with this comprehensive report:', 25, yPosition + 15);
    doc.text('• Individual PDF files for each uploaded medical record', 25, yPosition + 20);
    if (reportData.medicalRecords.length > 1) {
      doc.text('• Combined medical records PDF (all-medical-records.pdf)', 25, yPosition + 25);
    }
    yPosition += 35;
  }

  // Health Trends Analysis
  addSectionHeader('HEALTH TRENDS ANALYSIS', '📈');
  
  const last7DaysSteps = reportData.healthMetrics
    ?.filter(m => m.metric_type === 'steps')
    ?.slice(0, 7)
    ?.reduce((sum, m) => sum + m.value, 0) || 0;
  
  const avgSteps = Math.round(last7DaysSteps / 7);
  
  const last7DaysWater = reportData.waterIntake
    ?.slice(0, 7)
    ?.reduce((sum, w) => sum + w.amount_ml, 0) || 0;
  
  const avgWater = Math.round(last7DaysWater / (7 * 1000) * 10) / 10;

  addText(`• Average daily steps (last 7 days): ${avgSteps || 'No data available'}`, 10, 25);
  addText(`• Average daily water intake: ${avgWater || 'No data available'} L`, 10, 25);
  addText(`• Recent symptoms reported: ${reportData.symptoms?.length || 0} entries`, 10, 25);
  addText(`• Active medications: ${reportData.medications?.length || 0} prescriptions`, 10, 25);
  addText(`• Medical records on file: ${reportData.medicalRecords?.length || 0} documents`, 10, 25);

  // AI Recommendations Section
  if (reportData.aiRecommendations && reportData.aiRecommendations.length > 0) {
    addSectionHeader('AI HEALTH RECOMMENDATIONS', '🤖');
    reportData.aiRecommendations.forEach(recommendation => {
      addText(`For symptom: ${recommendation.symptom}`, 10, 25, true);
      if (recommendation.recommendedFoods && recommendation.recommendedFoods.length > 0) {
        addBulletPoint(`Recommended foods: ${recommendation.recommendedFoods.slice(0, 3).join(', ')}`);
      }
      if (recommendation.exercises && recommendation.exercises.length > 0) {
        addBulletPoint(`Recommended exercises: ${recommendation.exercises.slice(0, 3).join(', ')}`);
      }
      if (recommendation.reliefTips && recommendation.reliefTips.length > 0) {
        addBulletPoint(`Relief tips: ${recommendation.reliefTips[0]}`);
      }
      yPosition += 5;
    });
  }

  // Data Sources & Accuracy Note
  addSectionHeader('DATA SOURCES & ACCURACY', 'ℹ️');
  addText('This report is compiled from the following data sources:', 10, 25);
  addBulletPoint('User-inputted health information and symptoms');
  addBulletPoint('Connected fitness devices and health apps');
  addBulletPoint('Manually logged medications and vital signs');
  addBulletPoint('Uploaded medical records and documents');
  addBulletPoint('Healthcare provider appointment records');
  yPosition += 5;

  // Medical Disclaimer
  addNewPageIfNeeded(80);
  addSectionHeader('MEDICAL DISCLAIMER', '⚖️');
  
  const disclaimer = [
    'This comprehensive health report is generated from user-inputted data and connected health devices for informational purposes only.',
    'This report should not replace professional medical advice, diagnosis, or treatment from qualified healthcare providers.',
    'Always consult with licensed healthcare professionals for medical decisions, treatment plans, and health assessments.',
    'The accuracy of this data depends on user input, device calibration, and synchronization with health applications.',
    'AI recommendations are educational suggestions based on general health information and should not be considered medical advice.',
    'In case of medical emergencies, contact emergency services immediately.',
    '',
    'This report is designed to facilitate communication between patients and healthcare providers.',
    `Report generated by Sympto Health Tracking Application on ${format(new Date(), 'MMMM dd, yyyy')} at ${format(new Date(), 'HH:mm')}.`
  ];

  disclaimer.forEach(line => {
    if (line === '') {
      yPosition += 5;
    } else {
      addText(line, 9, 25);
    }
  });

  // Add footer to all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addFooter();
  }

  return doc;
};
