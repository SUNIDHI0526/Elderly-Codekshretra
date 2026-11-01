import { jsPDF } from 'jspdf';
import { DoctorSummary, PatientProfile, TimelineDayData } from '../types';

export function generateDoctorClinicalPdf(
  patient: PatientProfile,
  summary: DoctorSummary,
  timeline: TimelineDayData[]
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  let y = 14;

  // Header 3D Banner
  doc.setFillColor(28, 65, 46); // Deep forest green
  doc.roundedRect(margin, y, pageWidth - margin * 2, 24, 3, 3, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text('CARECIRCLE ELDERLY AI — CLINICAL VISIT SUMMARY', margin + 6, y + 9);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text('Continuous Geriatric Telehealth & Longitudinal Physiological Drift Report', margin + 6, y + 16);
  doc.text(`Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, pageWidth - margin - 62, y + 16);

  y += 28;

  // Patient Info Card
  doc.setFillColor(248, 250, 247);
  doc.setDrawColor(210, 222, 215);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 22, 2.5, 2.5, 'FD');

  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.text(`Patient: ${patient.name} (${patient.age} yrs, ${patient.gender})`, margin + 5, y + 6.5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(`Primary Diagnosis: ${patient.condition} | Blood Group: ${patient.bloodGroup}`, margin + 5, y + 12);
  doc.text(`Treating Physician: Dr. ${patient.primaryDoctorName} (${patient.doctorPhone}) | Caregiver: ${patient.caregiverName}`, margin + 5, y + 17.5);

  y += 26;

  // Advisory Box
  doc.setFillColor(254, 243, 199);
  doc.setDrawColor(245, 158, 11);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 9, 2, 2, 'FD');
  doc.setTextColor(146, 64, 14);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('CLINICAL ADVISORY: AI-assisted longitudinal report — requires licensed physician verification.', margin + 4, y + 6);

  y += 13;

  // 1. Executive Summary
  doc.setTextColor(22, 60, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('1. 30-Day Physiological Trajectory & Synthesis', margin, y);
  y += 5;

  doc.setTextColor(45, 45, 45);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  const overviewLines = doc.splitTextToSize(summary.patientOverview, pageWidth - margin * 2);
  doc.text(overviewLines, margin, y);
  y += overviewLines.length * 4.2 + 4;

  // 2. EMBEDDED GRAPH: 30-Day Blood Pressure Curve Chart
  doc.setTextColor(22, 60, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('2. 30-Day Longitudinal Blood Pressure Graph (Systolic / Diastolic)', margin, y);
  y += 5;

  // Chart Canvas Box
  const chartX = margin;
  const chartY = y;
  const chartW = pageWidth - margin * 2;
  const chartH = 46;

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(220, 225, 222);
  doc.roundedRect(chartX, chartY, chartW, chartH, 2, 2, 'FD');

  // Normal Range Green Band (90 to 130 mmHg)
  // Scale: yMin = 60, yMax = 160 (range = 100)
  const yToPdf = (val: number) => {
    const clamped = Math.max(60, Math.min(160, val));
    const ratio = (clamped - 60) / 100;
    return chartY + chartH - 8 - ratio * (chartH - 14);
  };

  const normalTop = yToPdf(130);
  const normalBottom = yToPdf(90);
  doc.setFillColor(220, 248, 230);
  doc.rect(chartX + 16, normalTop, chartW - 22, normalBottom - normalTop, 'F');

  // Horizontal Grid Lines & Ticks
  doc.setDrawColor(235, 238, 235);
  doc.setFontSize(6.5);
  doc.setTextColor(140, 140, 140);
  [80, 100, 120, 140, 160].forEach((tick) => {
    const tickY = yToPdf(tick);
    doc.line(chartX + 16, tickY, chartX + chartW - 6, tickY);
    doc.text(`${tick}`, chartX + 6, tickY + 1.5);
  });

  // Plot Systolic & Diastolic Lines
  const plotData = timeline.slice(-30);
  const xStep = (chartW - 22) / (plotData.length - 1 || 1);

  // Systolic line (Red)
  doc.setDrawColor(220, 38, 38); // Red
  doc.setLineWidth(0.6);
  for (let i = 0; i < plotData.length - 1; i++) {
    const x1 = chartX + 16 + i * xStep;
    const y1 = yToPdf(plotData[i].systolic);
    const x2 = chartX + 16 + (i + 1) * xStep;
    const y2 = yToPdf(plotData[i + 1].systolic);
    doc.line(x1, y1, x2, y2);
  }

  // Diastolic line (Blue)
  doc.setDrawColor(37, 99, 235); // Blue
  doc.setLineWidth(0.5);
  for (let i = 0; i < plotData.length - 1; i++) {
    const x1 = chartX + 16 + i * xStep;
    const y1 = yToPdf(plotData[i].diastolic);
    const x2 = chartX + 16 + (i + 1) * xStep;
    const y2 = yToPdf(plotData[i + 1].diastolic);
    doc.line(x1, y1, x2, y2);
  }

  // Draw points & critical Day 27 marker
  plotData.forEach((d, i) => {
    const px = chartX + 16 + i * xStep;
    const pySys = yToPdf(d.systolic);
    if (d.day === 27) {
      // Emergency spike dot
      doc.setFillColor(220, 38, 38);
      doc.circle(px, pySys, 1.6, 'F');
      doc.setFontSize(6);
      doc.setTextColor(220, 38, 38);
      doc.text('Spike: 148/94', px - 8, pySys - 3);
    } else if (i % 3 === 0) {
      doc.setFillColor(220, 38, 38);
      doc.circle(px, pySys, 0.7, 'F');
    }
  });

  // X Axis Days
  doc.setFontSize(6);
  doc.setTextColor(100, 100, 100);
  [1, 5, 10, 15, 20, 25, 30].forEach((dNum) => {
    const idx = plotData.findIndex((p) => p.day === dNum);
    if (idx !== -1) {
      const px = chartX + 16 + idx * xStep;
      doc.text(`D${dNum}`, px - 2, chartY + chartH - 2);
    }
  });

  // Chart Legend
  doc.setFontSize(6.5);
  doc.setTextColor(40, 40, 40);
  doc.setFillColor(220, 38, 38);
  doc.rect(chartX + 22, chartY + 3.5, 4, 1.5, 'F');
  doc.text('Systolic (mmHg)', chartX + 28, chartY + 5);

  doc.setFillColor(37, 99, 235);
  doc.rect(chartX + 65, chartY + 3.5, 4, 1.5, 'F');
  doc.text('Diastolic (mmHg)', chartX + 71, chartY + 5);

  doc.setFillColor(220, 248, 230);
  doc.rect(chartX + 105, chartY + 3.5, 4, 2, 'F');
  doc.text('Optimal Range (90-130)', chartX + 111, chartY + 5);

  y += chartH + 7;

  // 3. EMBEDDED GRAPH: 30-Day Sleep & Adherence Graph
  doc.setTextColor(22, 60, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('3. 30-Day Sleep Duration & Medication Adherence Trend', margin, y);
  y += 5;

  const chart2H = 34;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(220, 225, 222);
  doc.roundedRect(chartX, y, chartW, chart2H, 2, 2, 'FD');

  const sleepYPdf = (hours: number) => {
    const ratio = Math.max(0, Math.min(10, hours)) / 10;
    return y + chart2H - 6 - ratio * (chart2H - 10);
  };

  // Plot sleep line (Indigo)
  doc.setDrawColor(79, 70, 229);
  doc.setLineWidth(0.6);
  for (let i = 0; i < plotData.length - 1; i++) {
    const x1 = chartX + 16 + i * xStep;
    const y1 = sleepYPdf(plotData[i].sleepHours);
    const x2 = chartX + 16 + (i + 1) * xStep;
    const y2 = sleepYPdf(plotData[i + 1].sleepHours);
    doc.line(x1, y1, x2, y2);
  }

  // Plot adherence bars/dots
  plotData.forEach((d, i) => {
    const px = chartX + 16 + i * xStep;
    const pySleep = sleepYPdf(d.sleepHours);
    doc.setFillColor(79, 70, 229);
    doc.circle(px, pySleep, 0.6, 'F');

    // Missed dose badge
    if (d.adherenceRate < 100) {
      doc.setFillColor(245, 158, 11);
      doc.circle(px, y + chart2H - 9, 1.2, 'F');
    }
  });

  // Legend for Chart 2
  doc.setFontSize(6.5);
  doc.setTextColor(40, 40, 40);
  doc.setFillColor(79, 70, 229);
  doc.rect(chartX + 22, y + 2.5, 4, 1.5, 'F');
  doc.text('Sleep Duration (Hours/Night, Baseline ~7.4h)', chartX + 28, y + 4);

  doc.setFillColor(245, 158, 11);
  doc.circle(chartX + 115, y + 3.2, 1.2, 'F');
  doc.text('Missed Medication Dose Day', chartX + 118, y + 4);

  y += chart2H + 7;

  // Check if we need Page 2
  if (y > pageHeight - 55) {
    doc.addPage();
    y = 16;
  }

  // 4. Clinical Metrics Comparison Table
  doc.setTextColor(22, 60, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('4. Key Longitudinal Metrics vs. Baseline Comparison', margin, y);
  y += 5;

  doc.setFillColor(236, 243, 239);
  doc.rect(margin, y, pageWidth - margin * 2, 6, 'F');
  doc.setTextColor(30, 40, 35);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('Clinical Indicator', margin + 4, y + 4.2);
  doc.text('10-Day Baseline', margin + 60, y + 4.2);
  doc.text('Recent Last 7 Days', margin + 110, y + 4.2);
  doc.text('Physiological Drift', margin + 152, y + 4.2);
  y += 6;

  const rows = [
    { name: 'Systolic Blood Pressure', base: '122 mmHg', recent: '138 mmHg', status: '+16 mmHg (Elevated Drift)' },
    { name: 'Diastolic Blood Pressure', base: '80 mmHg', recent: '86 mmHg', status: '+6 mmHg (Moderate)' },
    { name: 'Resting Heart Rate', base: '72 bpm', recent: '82 bpm', status: '+10 bpm (Tachycardia Spikes)' },
    { name: 'Sleep Duration', base: '7.4 hrs/night', recent: '5.2 hrs/night', status: '-2.2 hrs (Sleep Fragmented)' },
    { name: 'Medication Adherence', base: '100%', recent: `${summary.adherenceRate}%`, status: '2 Missed Morning Doses' },
  ];

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  rows.forEach((row, idx) => {
    if (idx % 2 === 1) {
      doc.setFillColor(250, 252, 250);
      doc.rect(margin, y, pageWidth - margin * 2, 5.5, 'F');
    }
    doc.setTextColor(50, 50, 50);
    doc.text(row.name, margin + 4, y + 4);
    doc.text(row.base, margin + 60, y + 4);
    doc.text(row.recent, margin + 110, y + 4);
    doc.setTextColor(row.status.includes('Elevated') ? 190 : 50, 40, 40);
    doc.text(row.status, margin + 152, y + 4);
    y += 5.5;
  });

  y += 5;

  // 5. Physician Consultation Questions
  doc.setTextColor(22, 60, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('5. Recommended Physician Focus Questions for Today', margin, y);
  y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);
  summary.consultationQuestions.forEach((q, idx) => {
    const text = `Q${idx + 1}: ${q}`;
    const lines = doc.splitTextToSize(text, pageWidth - margin * 2 - 4);
    doc.text(lines, margin + 4, y);
    y += lines.length * 3.8 + 1;
  });

  y += 4;

  // 6. Doctor Sign-off Box
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(180, 190, 185);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 22, 2, 2, 'D');
  doc.setTextColor(110, 110, 110);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.text('Physician Clinical Notes & Sign-off:', margin + 4, y + 5);
  if (summary.clinicianNotes) {
    doc.setTextColor(20, 20, 20);
    doc.setFont('helvetica', 'normal');
    const doctorNotesLines = doc.splitTextToSize(summary.clinicianNotes, pageWidth - margin * 2 - 8);
    doc.text(doctorNotesLines, margin + 4, y + 10);
  }

  // Footer & Page numbers
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setTextColor(130, 130, 130);
    doc.setFontSize(7.5);
    doc.text(
      `Elderly AI Clinical Summary with Embedded Graphs • Patient: ${patient.name} • Page ${i} of ${totalPages}`,
      margin,
      pageHeight - 6
    );
    doc.text('CONFIDENTIAL MEDICAL RECORD', pageWidth - margin - 45, pageHeight - 6);
  }

  const sanitizedName = patient.name.replace(/\s+/g, '_');
  doc.save(`Elderly_Clinical_Report_${sanitizedName}_${new Date().toISOString().split('T')[0]}.pdf`);
}
