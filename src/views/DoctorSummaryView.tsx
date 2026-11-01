import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { generateDoctorClinicalPdf } from '../services/pdfService';
import {
  FileText,
  Printer,
  Download,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Sparkles,
  Edit3,
  Save,
  HelpCircle,
  Activity,
  Heart,
  Pill,
} from 'lucide-react';

export const DoctorSummaryView: React.FC = () => {
  const {
    doctorSummary,
    updateDoctorSummary,
    patient,
    timelineData,
    isElderlyMode,
    role,
  } = useApp();

  const [isEditing, setIsEditing] = useState(false);
  const [editedOverview, setEditedOverview] = useState(doctorSummary.patientOverview);
  const [editedNotes, setEditedNotes] = useState(doctorSummary.clinicianNotes);
  const [selectedRange, setSelectedRange] = useState(doctorSummary.dateRange);
  const [downloadFeedback, setDownloadFeedback] = useState<string | null>(null);

  const handleSaveEdits = () => {
    updateDoctorSummary({
      patientOverview: editedOverview,
      clinicianNotes: editedNotes,
      dateRange: selectedRange,
    });
    setIsEditing(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    try {
      generateDoctorClinicalPdf(patient, doctorSummary, timelineData);
      setDownloadFeedback('Clinical Visit Summary PDF generated and downloaded successfully.');
      setTimeout(() => setDownloadFeedback(null), 5000);
    } catch (err: any) {
      console.error('PDF error:', err);
      setDownloadFeedback('Error generating PDF. Please try Print Report.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Action Header Banner (Screen Only) */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-100 text-purple-800">
              <FileText className="w-5 h-5" />
            </span>
            <h2 className="font-serif text-2xl font-bold text-stone-900">
              Doctor Clinical Visit Summary
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Synthesized by Elderly Clinician Agent • Ready for Dr. {patient.primaryDoctorName}
          </p>
        </div>

        {/* Real Working Print and Real Working PDF Download */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report (A4)</span>
          </button>

          <button
            onClick={handleDownloadPdf}
            className="px-4 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      {downloadFeedback && (
        <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-2xl text-xs font-semibold animate-in fade-in print:hidden">
          {downloadFeedback}
        </div>
      )}

      {/* Date Range Selector & Clinician Review Advisory */}
      <div className="bg-amber-50/80 border border-amber-300 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
        <div className="flex items-center gap-2.5 text-xs text-amber-950 font-semibold">
          <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
          <span>
            AI-assisted clinical draft — requires clinician review before prescribing or altering therapy.
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 text-stone-500" />
          <select
            value={selectedRange}
            onChange={(e) => setSelectedRange(e.target.value)}
            className="text-xs font-semibold bg-white border border-stone-300 rounded-xl px-2.5 py-1 focus:outline-emerald-700 cursor-pointer"
          >
            <option value="Past 30 Days (Oct 1 – Oct 31, 2026)">Past 30 Days</option>
            <option value="Past 14 Days (Oct 17 – Oct 31, 2026)">Past 14 Days</option>
            <option value="Past 7 Days (Oct 24 – Oct 31, 2026)">Past 7 Days</option>
          </select>
        </div>
      </div>

      {/* Printable Report Document (A4 Styled Layout) */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-10 shadow-sm space-y-6 print:border-none print:shadow-none print:p-0">
        {/* Document Header */}
        <div className="border-b-2 border-emerald-800 pb-5 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-800">
              Elderly • Continuous Telehealth Synthesis
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 mt-1">
              Physician Consultation Briefing
            </h1>
            <p className="text-xs text-stone-500 mt-0.5">
              Report Period: {selectedRange} • Generated: {doctorSummary.lastGenerated}
            </p>
          </div>

          <div className="text-left sm:text-right text-xs text-stone-600">
            <p>
              <strong>Treating Physician:</strong> Dr. {patient.primaryDoctorName}
            </p>
            <p>
              <strong>Primary Caregiver:</strong> {patient.caregiverName} ({patient.caregiverPhone})
            </p>
          </div>
        </div>

        {/* Patient Demographic Card */}
        <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-xs grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <span className="text-stone-400 font-medium">Patient Name:</span>
            <p className="font-bold text-stone-900 text-sm">{patient.name}</p>
          </div>
          <div>
            <span className="text-stone-400 font-medium">Age & Gender:</span>
            <p className="font-bold text-stone-900">{patient.age} years, {patient.gender}</p>
          </div>
          <div>
            <span className="text-stone-400 font-medium">Primary Condition:</span>
            <p className="font-bold text-stone-900">{patient.condition}</p>
          </div>
          <div>
            <span className="text-stone-400 font-medium">Known Allergies:</span>
            <p className="font-bold text-red-700">{patient.allergies.join(', ')}</p>
          </div>
        </div>

        {/* 1. Trajectory Overview */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-base text-stone-900">
              1. 30-Day Wellness & Trajectory Overview
            </h3>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 cursor-pointer print:hidden"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Narrative</span>
              </button>
            )}
          </div>

          {isEditing ? (
            <textarea
              rows={4}
              value={editedOverview}
              onChange={(e) => setEditedOverview(e.target.value)}
              className="w-full text-xs p-3 border border-stone-300 rounded-xl focus:outline-emerald-700 bg-stone-50"
            />
          ) : (
            <p className="text-xs sm:text-sm text-stone-700 leading-relaxed bg-stone-50/60 p-4 rounded-2xl border border-stone-100">
              {doctorSummary.patientOverview}
            </p>
          )}
        </div>

        {/* 2. Key Physiological Changes */}
        <div className="space-y-2">
          <h3 className="font-serif font-bold text-base text-stone-900">
            2. Significant Physiological Observations
          </h3>
          <ul className="space-y-2 text-xs sm:text-sm text-stone-700">
            {doctorSummary.keyChanges.map((change, idx) => (
              <li key={idx} className="flex items-start gap-2 p-2.5 rounded-xl bg-stone-50 border border-stone-100">
                <span className="w-2 h-2 rounded-full bg-emerald-700 mt-1.5 shrink-0" />
                <span>{change}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 3. Embedded Graphical Charts (Printed & Rendered) */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-base text-stone-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-800" />
              <span>3. Longitudinal Blood Pressure & Sleep Graphical Trends</span>
            </h3>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase">
              Embedded Vector Graphs
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* BP Curve Chart */}
            <div className="p-4 rounded-2xl border border-stone-200 bg-stone-50/50 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-stone-900">30-Day BP Curve (Systolic & Diastolic)</span>
                <span className="text-[10px] text-stone-500 font-mono">60 - 160 mmHg</span>
              </div>

              <div className="relative h-36 w-full">
                <svg viewBox="0 0 400 130" className="w-full h-full">
                  {/* Normal Band (90 - 130) */}
                  <rect x="25" y="32" width="365" height="52" fill="#10B981" fillOpacity="0.1" />
                  <line x1="25" y1="32" x2="390" y2="32" stroke="#10B981" strokeDasharray="3 3" strokeWidth="0.8" />
                  <line x1="25" y1="84" x2="390" y2="84" stroke="#10B981" strokeDasharray="3 3" strokeWidth="0.8" />
                  <text x="28" y="42" fill="#065F46" fontSize="8" fontWeight="bold">Optimal Range (90 - 130)</text>

                  {/* Y Axis Grid */}
                  <text x="4" y="20" fill="#9CA3AF" fontSize="7">150</text>
                  <line x1="25" y1="18" x2="390" y2="18" stroke="#E5E7EB" strokeWidth="0.5" />
                  <text x="4" y="58" fill="#9CA3AF" fontSize="7">120</text>
                  <line x1="25" y1="56" x2="390" y2="56" stroke="#E5E7EB" strokeWidth="0.5" />
                  <text x="4" y="96" fill="#9CA3AF" fontSize="7">90</text>
                  <line x1="25" y1="94" x2="390" y2="94" stroke="#E5E7EB" strokeWidth="0.5" />

                  {/* Systolic Line (Red) */}
                  <path
                    d="M 30,55 L 60,54 L 90,53 L 130,50 L 170,44 L 210,38 L 250,32 L 290,26 L 330,12 L 360,28 L 390,36"
                    fill="none"
                    stroke="#DC2626"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  {/* Diastolic Line (Blue) */}
                  <path
                    d="M 30,96 L 60,95 L 90,94 L 130,92 L 170,90 L 210,88 L 250,86 L 290,82 L 330,76 L 360,84 L 390,88"
                    fill="none"
                    stroke="#2563EB"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />

                  {/* Day 27 Critical Spike Dot */}
                  <circle cx="330" cy="12" r="3.5" fill="#DC2626" stroke="#FFFFFF" strokeWidth="1" />
                  <text x="312" y="8" fill="#DC2626" fontSize="7" fontWeight="bold">D27: 148/94</text>

                  {/* X Axis Days */}
                  <text x="30" y="122" fill="#6B7280" fontSize="7">D1</text>
                  <text x="130" y="122" fill="#6B7280" fontSize="7">D10 (Baseline)</text>
                  <text x="250" y="122" fill="#6B7280" fontSize="7">D20</text>
                  <text x="380" y="122" fill="#6B7280" fontSize="7">D30</text>
                </svg>
              </div>

              <div className="flex items-center justify-between text-[10px] text-stone-500 pt-1 border-t border-stone-200">
                <span className="flex items-center gap-1 font-semibold text-red-600">
                  <span className="w-2 h-0.5 bg-red-600"></span> Systolic BP
                </span>
                <span className="flex items-center gap-1 font-semibold text-blue-600">
                  <span className="w-2 h-0.5 bg-blue-600"></span> Diastolic BP
                </span>
                <span className="text-stone-400">Baseline Mean: 122 mmHg</span>
              </div>
            </div>

            {/* Sleep & Adherence Trend Chart */}
            <div className="p-4 rounded-2xl border border-stone-200 bg-stone-50/50 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-stone-900">30-Day Sleep Duration & Adherence</span>
                <span className="text-[10px] text-stone-500 font-mono">0 - 10 Hours</span>
              </div>

              <div className="relative h-36 w-full">
                <svg viewBox="0 0 400 130" className="w-full h-full">
                  {/* Recommended sleep band (6.5 - 8.5) */}
                  <rect x="25" y="30" width="365" height="35" fill="#4F46E5" fillOpacity="0.08" />
                  <text x="28" y="40" fill="#4338CA" fontSize="8" fontWeight="bold">Target Sleep (6.5 - 8.5 hrs)</text>

                  {/* Sleep curve (Indigo) */}
                  <path
                    d="M 30,42 L 70,40 L 110,43 L 150,48 L 190,56 L 230,68 L 270,76 L 310,88 L 330,94 L 360,78 L 390,62"
                    fill="none"
                    stroke="#4F46E5"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />

                  {/* Missed dose markers (Amber dots) */}
                  <circle cx="270" cy="110" r="3" fill="#F59E0B" />
                  <text x="255" y="105" fill="#B45309" fontSize="6.5" fontWeight="bold">Missed D23</text>
                  <circle cx="330" cy="110" r="3" fill="#F59E0B" />
                  <text x="315" y="105" fill="#B45309" fontSize="6.5" fontWeight="bold">Missed D27</text>

                  {/* X Axis */}
                  <text x="30" y="122" fill="#6B7280" fontSize="7">D1</text>
                  <text x="130" y="122" fill="#6B7280" fontSize="7">D10 (7.4h)</text>
                  <text x="250" y="122" fill="#6B7280" fontSize="7">D20</text>
                  <text x="380" y="122" fill="#6B7280" fontSize="7">D30 (6.8h)</text>
                </svg>
              </div>

              <div className="flex items-center justify-between text-[10px] text-stone-500 pt-1 border-t border-stone-200">
                <span className="flex items-center gap-1 font-semibold text-indigo-700">
                  <span className="w-2 h-0.5 bg-indigo-700"></span> Sleep Duration
                </span>
                <span className="flex items-center gap-1 font-semibold text-amber-700">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span> Missed Dose Flag
                </span>
                <span className="text-stone-400">Overall: 88% Compliance</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Vitals & Adherence Table */}
        <div className="space-y-2">
          <h3 className="font-serif font-bold text-base text-stone-900">
            4. Longitudinal Metrics & Medication Adherence Table
          </h3>
          <div className="overflow-x-auto border border-stone-200 rounded-2xl">
            <table className="w-full text-xs text-left">
              <thead className="bg-stone-100 text-stone-600 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3">Metric</th>
                  <th className="p-3">Baseline (Days 1-10)</th>
                  <th className="p-3">Recent (Days 24-30)</th>
                  <th className="p-3">Clinical Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-800">
                <tr>
                  <td className="p-3 font-semibold">Systolic BP</td>
                  <td className="p-3">122 mmHg</td>
                  <td className="p-3 font-bold text-red-700">138 mmHg</td>
                  <td className="p-3 text-red-700 font-semibold">+16 mmHg Drift (Elevated)</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold">Diastolic BP</td>
                  <td className="p-3">80 mmHg</td>
                  <td className="p-3 font-bold">86 mmHg</td>
                  <td className="p-3 text-stone-600">+6 mmHg Drift (Moderate)</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold">Resting Heart Rate</td>
                  <td className="p-3">72 bpm</td>
                  <td className="p-3 font-bold">82 bpm</td>
                  <td className="p-3 text-stone-600">+10 bpm during systolic spikes</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold">Night Sleep Duration</td>
                  <td className="p-3">7.4 hrs/night</td>
                  <td className="p-3 font-bold text-indigo-800">5.2 hrs/night</td>
                  <td className="p-3 text-amber-800 font-semibold">-2.2 hrs (Sleep Fragmented)</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold">Medication Adherence</td>
                  <td className="p-3">100%</td>
                  <td className="p-3 font-bold text-amber-700">{doctorSummary.adherenceRate}%</td>
                  <td className="p-3 text-amber-800 font-semibold">2 Missed Morning Doses</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 4. Consultation Questions for Physician */}
        <div className="space-y-2">
          <h3 className="font-serif font-bold text-base text-stone-900">
            4. Suggested Physician Focus Questions for Today
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {doctorSummary.consultationQuestions.map((q, idx) => (
              <div key={idx} className="p-3 rounded-2xl bg-purple-50/60 border border-purple-200 text-xs text-purple-950">
                <span className="font-bold text-purple-900">Q{idx + 1}: </span>
                <span>{q}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 5. Doctor Clinical Sign-off & Prescription Notes Box */}
        <div className="p-5 rounded-2xl border-2 border-stone-300 space-y-2 bg-stone-50/40">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-xs uppercase tracking-wider text-stone-700">
              Physician Clinical Notes & Prescription Adjustments (Sign-off)
            </h4>
            {isEditing && (
              <button
                onClick={handleSaveEdits}
                className="px-3 py-1 bg-emerald-800 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer print:hidden"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Report</span>
              </button>
            )}
          </div>

          {isEditing ? (
            <textarea
              rows={3}
              value={editedNotes}
              onChange={(e) => setEditedNotes(e.target.value)}
              className="w-full text-xs p-3 border border-stone-300 rounded-xl focus:outline-emerald-700 bg-white"
            />
          ) : (
            <p className="text-xs text-stone-800 font-serif italic leading-relaxed">
              "{doctorSummary.clinicianNotes}"
            </p>
          )}

          <div className="pt-4 flex items-center justify-between text-[11px] text-stone-400 border-t border-stone-200 mt-4">
            <span>Clinician Signature: ____________________________</span>
            <span>Date: ________________________</span>
          </div>
        </div>
      </div>
    </div>
  );
};
