import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { VitalsEntry } from '../types';
import {
  Activity,
  Heart,
  Moon,
  Zap,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';

export const VitalsView: React.FC = () => {
  const { vitalsHistory, recordNewVitals, patient, isElderlyMode } = useApp();

  // Form state
  const [systolic, setSystolic] = useState<number>(128);
  const [diastolic, setDiastolic] = useState<number>(82);
  const [heartRate, setHeartRate] = useState<number>(74);
  const [bedtime, setBedtime] = useState<string>('22:30');
  const [wakeTime, setWakeTime] = useState<string>('06:00');
  const [activityMins, setActivityMins] = useState<number>(30);
  const [mood, setMood] = useState<'Energetic' | 'Good' | 'Fair' | 'Low' | 'Distressed'>('Good');
  const [symptomsInput, setSymptomsInput] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [dataSource, setDataSource] = useState<
    'Patient Entered' | 'Caregiver Verified' | 'Connected Blood Pressure Cuff' | 'Calculated Estimate'
  >('Connected Blood Pressure Cuff');

  const [formFeedback, setFormFeedback] = useState<string | null>(null);

  // Auto-calculate sleep duration from bedtime & wake time
  const calculateSleepDuration = (bed: string, wake: string): number => {
    const [bH, bM] = bed.split(':').map(Number);
    const [wH, wM] = wake.split(':').map(Number);
    let diffMinutes = wH * 60 + wM - (bH * 60 + bM);
    if (diffMinutes < 0) diffMinutes += 24 * 60; // Crosses midnight
    return Math.round((diffMinutes / 60) * 10) / 10;
  };

  const calculatedSleepHours = calculateSleepDuration(bedtime, wakeTime);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Range Validations
    if (systolic < 60 || systolic > 260) {
      setFormFeedback('Systolic blood pressure must be between 60 and 260 mmHg.');
      return;
    }
    if (diastolic < 40 || diastolic > 160) {
      setFormFeedback('Diastolic blood pressure must be between 40 and 160 mmHg.');
      return;
    }
    if (heartRate < 35 || heartRate > 200) {
      setFormFeedback('Heart rate must be between 35 and 200 bpm.');
      return;
    }

    const symptomsList = symptomsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    recordNewVitals({
      systolic,
      diastolic,
      heartRate,
      sleepHours: calculatedSleepHours,
      sleepBedtime: bedtime,
      sleepWakeTime: wakeTime,
      sleepConsistencyScore: 84,
      activityMinutes: activityMins,
      mood,
      symptoms: symptomsList,
      notes,
      dataSource,
    });

    setFormFeedback('Vitals and sleep metrics recorded successfully.');
    setSymptomsInput('');
    setNotes('');
    setTimeout(() => setFormFeedback(null), 4000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
              <Activity className="w-5 h-5" />
            </span>
            <h2 className="font-serif text-2xl font-bold text-stone-900">
              Vitals, Sleep & Daily Routine
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Validated health logging, calculated sleep duration & transparent trend tracking
          </p>
        </div>

        <span className="text-xs font-semibold px-3 py-1 bg-stone-100 text-stone-700 rounded-full self-start sm:self-center">
          Patient: {patient.name}
        </span>
      </div>

      {formFeedback && (
        <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-2xl text-xs font-semibold animate-in fade-in">
          {formFeedback}
        </div>
      )}

      {/* Entry Form & Calculator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Card */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-stone-200 p-6 shadow-xs">
          <h3 className="font-serif text-lg font-bold text-stone-900 mb-4 pb-3 border-b border-stone-100">
            Record New Health Reading
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Blood Pressure & Heart Rate */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Systolic (mmHg)
                </label>
                <input
                  type="number"
                  min="60"
                  max="260"
                  value={systolic}
                  onChange={(e) => setSystolic(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl text-sm font-semibold focus:outline-emerald-700"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Diastolic (mmHg)
                </label>
                <input
                  type="number"
                  min="40"
                  max="160"
                  value={diastolic}
                  onChange={(e) => setDiastolic(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl text-sm font-semibold focus:outline-emerald-700"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Heart Rate (bpm)
                </label>
                <input
                  type="number"
                  min="35"
                  max="200"
                  value={heartRate}
                  onChange={(e) => setHeartRate(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl text-sm font-semibold focus:outline-emerald-700"
                  required
                />
              </div>
            </div>

            {/* Sleep Routine Times & Auto Calculator */}
            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
                  <Moon className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Sleep & Wake Routine</span>
                </span>
                <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                  Calculated Estimate: {calculatedSleepHours} hrs
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                    Bedtime (Last Night)
                  </label>
                  <input
                    type="time"
                    value={bedtime}
                    onChange={(e) => setBedtime(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs font-medium bg-white focus:outline-emerald-700"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                    Wake Time (This Morning)
                  </label>
                  <input
                    type="time"
                    value={wakeTime}
                    onChange={(e) => setWakeTime(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs font-medium bg-white focus:outline-emerald-700"
                  />
                </div>
              </div>
            </div>

            {/* Activity & Mood */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Walking Activity (Minutes)
                </label>
                <input
                  type="number"
                  min="0"
                  max="300"
                  value={activityMins}
                  onChange={(e) => setActivityMins(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl text-sm font-semibold focus:outline-emerald-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Mood & Energy
                </label>
                <select
                  value={mood}
                  onChange={(e) => setMood(e.target.value as any)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl text-sm font-semibold bg-white focus:outline-emerald-700 cursor-pointer"
                >
                  <option value="Energetic">Energetic (High Energy)</option>
                  <option value="Good">Good (Comfortable)</option>
                  <option value="Fair">Fair (Mild Tiredness)</option>
                  <option value="Low">Low (Fatigued / Somber)</option>
                  <option value="Distressed">Distressed (Needs Attention)</option>
                </select>
              </div>
            </div>

            {/* Data Source & Symptoms */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Data Source Label
                </label>
                <select
                  value={dataSource}
                  onChange={(e) => setDataSource(e.target.value as any)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs font-medium bg-white focus:outline-emerald-700 cursor-pointer"
                >
                  <option value="Connected Blood Pressure Cuff">Connected Blood Pressure Cuff</option>
                  <option value="Patient Entered">Patient Entered (Manual)</option>
                  <option value="Caregiver Verified">Caregiver Verified</option>
                  <option value="Calculated Estimate">Calculated Estimate</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Symptoms (comma separated)
                </label>
                <input
                  type="text"
                  value={symptomsInput}
                  onChange={(e) => setSymptomsInput(e.target.value)}
                  placeholder="e.g. Mild headache, ankle tightness"
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs font-medium focus:outline-emerald-700"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Context Notes (Optional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Took reading 15 mins after morning tea"
                className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs font-medium focus:outline-emerald-700"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-emerald-800 hover:bg-emerald-900 text-white rounded-2xl font-bold text-sm shadow-xs transition-colors cursor-pointer"
            >
              Save Vital Record
            </button>
          </form>
        </div>

        {/* Clinical Interpretation & Guidelines */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs space-y-3">
            <h4 className="font-serif font-bold text-base text-stone-900">
              Personalized Targets for {patient.name}
            </h4>
            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950">
                <span className="font-bold">Target BP: </span> Below 135/85 mmHg
              </div>
              <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-950">
                <span className="font-bold">Target Sleep: </span> 7.0 – 8.0 hours/night
              </div>
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-950">
                <span className="font-bold">Target Walking: </span> 25 – 45 mins gentle stroll
              </div>
            </div>

            <p className="text-[11px] text-stone-500 italic pt-2">
              Note: Elderly monitors longitudinal trends and does not formulate automated medical diagnoses.
            </p>
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs space-y-4">
        <h3 className="font-serif text-lg font-bold text-stone-900">
          Recorded Vitals Log History
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-stone-200 text-stone-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-2.5">Time</th>
                <th className="py-2.5">Blood Pressure</th>
                <th className="py-2.5">Pulse</th>
                <th className="py-2.5">Sleep</th>
                <th className="py-2.5">Activity</th>
                <th className="py-2.5">Mood</th>
                <th className="py-2.5">Source</th>
                <th className="py-2.5">Flag / Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {vitalsHistory.map((v) => (
                <tr key={v.id} className="hover:bg-stone-50">
                  <td className="py-3 font-semibold text-stone-800">{v.recordedAt}</td>
                  <td className="py-3 font-bold text-stone-900">
                    {v.systolic}/{v.diastolic} mmHg
                  </td>
                  <td className="py-3 font-medium text-stone-700">{v.heartRate} bpm</td>
                  <td className="py-3 font-medium text-stone-700">{v.sleepHours} hrs</td>
                  <td className="py-3 font-medium text-stone-700">{v.activityMinutes}m</td>
                  <td className="py-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        v.mood === 'Energetic' || v.mood === 'Good'
                          ? 'bg-emerald-100 text-emerald-800'
                          : v.mood === 'Distressed'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {v.mood}
                    </span>
                  </td>
                  <td className="py-3 text-stone-500 font-mono text-[10px]">{v.dataSource}</td>
                  <td className="py-3 text-stone-600 max-w-xs truncate">
                    {v.flagged ? (
                      <span className="text-red-700 font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        {v.flagReason}
                      </span>
                    ) : (
                      v.notes || 'Normal routine'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
