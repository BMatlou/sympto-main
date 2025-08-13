
import { jsPDF } from 'jspdf';
import { format } from 'date-fns';

export interface MedicalRecord {
  id: string;
  title: string;
  record_type: string;
  description?: string;
  doctor_name?: string;
  facility_name?: string;
  date_of_record?: string;
  created_at: string;
  file_name?: string;
  file_url?: string;
}

export const generateMedicalRecordPDF = (record: MedicalRecord, patientName: string): jsPDF => {
  const doc = new jsPDF();
  let yPosition = 20;
  const pageHeight = doc.internal.pageSize.height;
  const pageWidth = doc.internal.pageSize.width;
  const margin = 20;

  // Brand colors
  const colors = {
    primary: [46, 202, 200] as const,
    secondary: [51, 136, 134] as const,
    dark: [25, 55, 109] as const,
    text: [51, 51, 51] as const,
    light: [245, 245, 245] as const
  };

  const addNewPageIfNeeded = (requiredSpace: number = 40) => {
    if (yPosition + requiredSpace > pageHeight - margin) {
      doc.addPage();
      yPosition = 20;
      addHeader();
    }
  };

  const addHeader = () => {
    // Header background
    doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.rect(0, 0, pageWidth, 35, 'F');
    
    // Logo placeholder
    doc.setFillColor(255, 255, 255);
    doc.rect(15, 8, 25, 18, 'F');
    doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
    doc.setFontSize(12);
    doc.text('Sympto', 18, 18);
    
    // Title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.text('MEDICAL RECORD', 50, 18);
    
    doc.setFontSize(9);
    doc.text('Symptoms You Manage Proactively Through Tracking for Better Outcomes', 50, 26);
    
    yPosition = 45;
  };

  const addFooter = () => {
    const footerY = pageHeight - 15;
    doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
    doc.setFontSize(8);
    doc.text('Sympto Health Tracking Application | Medical Record Document', 20, footerY);
    doc.text(`Page ${doc.getCurrentPageInfo().pageNumber}`, pageWidth - 40, footerY);
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

  // Build the medical record PDF
  addHeader();

  // Record header
  doc.setFillColor(colors.light[0], colors.light[1], colors.light[2]);
  doc.rect(15, yPosition, pageWidth - 30, 25, 'F');
  
  doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
  doc.setFontSize(16);
  doc.text(record.title, 25, yPosition + 12);
  
  doc.setFontSize(10);
  doc.text(`Record Type: ${record.record_type}`, 25, yPosition + 20);
  yPosition += 35;

  // Patient Information
  addText(`Patient: ${patientName}`, 12, 25, true);
  addText(`Record Date: ${record.date_of_record ? format(new Date(record.date_of_record), 'MMMM dd, yyyy') : 'Not specified'}`, 10, 25);
  addText(`Uploaded: ${format(new Date(record.created_at), 'MMMM dd, yyyy')}`, 10, 25);
  yPosition += 10;

  // Medical Details
  if (record.doctor_name) {
    addText(`Doctor: Dr. ${record.doctor_name}`, 10, 25, true);
  }
  
  if (record.facility_name) {
    addText(`Facility: ${record.facility_name}`, 10, 25, true);
  }
  
  yPosition += 10;

  // Description
  if (record.description) {
    doc.setFillColor(colors.light[0], colors.light[1], colors.light[2]);
    doc.rect(15, yPosition, pageWidth - 30, 8, 'F');
    doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
    doc.setFontSize(12);
    doc.text('Description', 25, yPosition + 5);
    yPosition += 15;
    
    addText(record.description, 10, 25);
    yPosition += 10;
  }

  // File Information
  if (record.file_name) {
    doc.setFillColor(colors.light[0], colors.light[1], colors.light[2]);
    doc.rect(15, yPosition, pageWidth - 30, 8, 'F');
    doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
    doc.setFontSize(12);
    doc.text('Attached File', 25, yPosition + 5);
    yPosition += 15;
    
    addText(`📎 ${record.file_name}`, 10, 25);
    yPosition += 5;
  }

  // Medical Record Disclaimer
  addNewPageIfNeeded(50);
  doc.setFillColor(colors.light[0], colors.light[1], colors.light[2]);
  doc.rect(15, yPosition, pageWidth - 30, 8, 'F');
  doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
  doc.setFontSize(12);
  doc.text('Medical Record Disclaimer', 25, yPosition + 5);
  yPosition += 15;

  const disclaimer = [
    'This document contains medical record information uploaded by the patient through the Sympto Health Tracking Application.',
    'The original file should be reviewed alongside this summary for complete medical assessment.',
    'This record is provided for healthcare professional consultation and should be verified with the original source.',
    `Generated on ${format(new Date(), 'MMMM dd, yyyy')} at ${format(new Date(), 'HH:mm')} for patient consultation purposes.`
  ];

  disclaimer.forEach(line => {
    addText(line, 9, 25);
  });

  // Add footer
  addFooter();

  return doc;
};

export const generateAllMedicalRecordsPDF = (records: MedicalRecord[], patientName: string): jsPDF => {
  const doc = new jsPDF();
  let yPosition = 20;
  const pageHeight = doc.internal.pageSize.height;
  const pageWidth = doc.internal.pageSize.width;

  // Brand colors
  const colors = {
    primary: [46, 202, 200] as const,
    secondary: [51, 136, 134] as const,
    dark: [25, 55, 109] as const,
    text: [51, 51, 51] as const,
    light: [245, 245, 245] as const
  };

  // Header
  doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.rect(0, 0, pageWidth, 35, 'F');
  
  doc.setFillColor(255, 255, 255);
  doc.rect(15, 8, 25, 18, 'F');
  doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
  doc.setFontSize(12);
  doc.text('Sympto', 18, 18);
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.text('COMPLETE MEDICAL RECORDS COLLECTION', 50, 18);
  
  doc.setFontSize(9);
  doc.text('Symptoms You Manage Proactively Through Tracking for Better Outcomes', 50, 26);
  
  yPosition = 50;

  // Patient info
  doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
  doc.setFontSize(14);
  doc.text(`Patient: ${patientName}`, 25, yPosition);
  doc.setFontSize(10);
  doc.text(`Generated: ${format(new Date(), 'MMMM dd, yyyy HH:mm')}`, 25, yPosition + 10);
  yPosition += 25;

  // Records summary
  doc.setFontSize(12);
  doc.text(`Total Medical Records: ${records.length}`, 25, yPosition);
  yPosition += 15;

  // List all records
  records.forEach((record, index) => {
    if (yPosition > pageHeight - 40) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFillColor(colors.light[0], colors.light[1], colors.light[2]);
    doc.rect(20, yPosition - 3, pageWidth - 40, 25, 'F');
    
    doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
    doc.setFontSize(11);
    doc.text(`${index + 1}. ${record.title}`, 25, yPosition + 5);
    
    doc.setFontSize(9);
    doc.text(`Type: ${record.record_type}`, 30, yPosition + 12);
    doc.text(`Date: ${record.date_of_record ? format(new Date(record.date_of_record), 'MMM dd, yyyy') : 'Not specified'}`, 30, yPosition + 18);
    
    if (record.doctor_name) {
      doc.text(`Doctor: Dr. ${record.doctor_name}`, 120, yPosition + 12);
    }
    
    yPosition += 30;
  });

  return doc;
};
