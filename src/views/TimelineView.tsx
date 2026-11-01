import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TimelineCharts } from '../components/TimelineCharts';
import { computeBaselineComparison } from '../services/timelineData';
import { TimelineDayData } from '../types';
import {
  Calendar,
  AlertTriangle,
  Activity,
  Moon,
  Pill,
  Heart,
  HelpCircle,
  CheckCircle2,
  TrendingUp,
  FileText,
  Clock,
  ArrowRight,
  Sun,
  Coffee,
  CheckSquare,
  Sparkles,
} from 'lucide-react';

interface TimelineViewProps {
  onNavigate: (tab: string) => void;
}

export const TimelineView: React.FC<TimelineViewProps> = ({ onNavigate }) => {
  const { timelineData, patient, isElderlyMode } = useApp();
  const [selectedDay, setSelectedDay] = useState<TimelineDayData | null>(null);
  const [filterOnlyFlagged, setFilterOnlyFlagged] = useState(false);
  const [viewMode, setViewMode] = useState<'charts' | 'routine'>('routine');
  const [selectedRoutineDay, setSelectedRoutineDay] = useState<number>(30); // Day 30 = Today

  const baselineComparison = computeBaselineComparison(timelineData);

  const displayList = filterOnlyFlagged
    ? timelineData.filter((d) => d.isFlagged)
    : [...timelineData].reverse();

  // 30-Day Routine Schedule definition for Ramesh Sharma
  const routineMilestones = [
    {
      period: 'Morning Routine (06:30 - 08:30 AM)',
      icon: Sun,
      color: 'text-amber-600 bg-amber-100',
      tasks: [
        { title: 'Hydration & Bed Mobility', detail: '1 glass warm lemon water + 5 min gentle ankle rotations', time: '06:45 AM' },
        { title: 'Morning BP Cuff Measurement', detail: 'Rest seated for 5 mins before cuff inflation (Target < 135/85)', time: '07:15 AM' },
        { title: 'Morning Garden Walk', detail: '20-25 mins gentle stroll in society park', time: '07:45 AM' },
        { title: 'Breakfast & Morning Meds', detail: 'Oats / Idli with Amlodipine 5mg & Metformin 500mg', time: '08:30 AM' },
      ],
    },
    {
      period: 'Afternoon Nutrition & Rest (12:30 - 02:00 PM)',
      icon: Coffee,
      color: 'text-emerald-700 bg-emerald-100',
      tasks: [
        { title: 'Diabetic-Friendly Lunch', detail: 'Roti, green vegetables, dal with low sodium', time: '12:45 PM' },
        { title: 'Joint Support Tablet', detail: 'Glucosamine & Chondroitin 500mg with water', time: '01:15 PM' },
        { title: 'Post-Lunch Rest & Leg Elevation', detail: '30-40 mins peaceful nap with pillow under ankles', time: '01:30 PM' },
      ],
    },
    {
      period: 'Evening Social & Vitals Check (05:00 - 06:30 PM)',
      icon: Activity,
      color: 'text-blue-700 bg-blue-100',
      tasks: [
        { title: 'Herbal Tea & Neighbor Chat', detail: 'Green tea with neighbor Mr. Joshi or phone call with Pooja', time: '05:15 PM' },
        { title: 'Evening Blood Pressure Check', detail: 'Log evening seated blood pressure in Elderly app', time: '06:00 PM' },
      ],
    },
    {
      period: 'Night Calm & Sleep Routine (08:30 - 10:30 PM)',
      icon: Moon,
      color: 'text-indigo-700 bg-indigo-100',
      tasks: [
        { title: 'Dinner & Night Medications', detail: 'Light khichdi followed by Metformin 500mg & Atorvastatin 10mg', time: '08:45 PM' },
        { title: 'Digital Detox & Chamomile Warm Tea', detail: 'Turn off TV/phone screens; soothing warm beverage', time: '09:45 PM' },
        { title: 'Bedtime for 7+ Hours Rest', detail: 'Target sleep 10:15 PM to 06:00 AM (Target: undisturbed sleep)', time: '10:15 PM' },
      ],
    },
  ];

  // Routine completion rates across 30 days
  const routineScores = timelineData.map((d) => {
    let score = 100;
    if (d.day === 23) score = 50; // Missed morning
    if (d.day === 25) score = 65;
    if (d.day === 27) score = 40; // Emergency day
    if (d.day > 15 && d.day < 20) score = 85;
    return { day: d.day, date: d.date, score, completedCount: score === 100 ? '4/4' : score >= 80 ? '3/4' : '2/4' };
  });

  const activeRoutineDayData = routineScores.find((r) => r.day === selectedRoutineDay) || routineScores[routineScores.length - 1];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* 3D Header Banner */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.06),0_8px_10px_-6px_rgba(0,0,0,0.04)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2.5 rounded-2xl bg-emerald-800 text-white shadow-md shadow-emerald-800/20">
              <Calendar className="w-5 h-5" />
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
              30-Day Routine & Clinical Timeline
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-2xl">
            Structured daily elderly care schedule, 30-day routine completion graphs, and longitudinal vital drift for {patient.name}
          </p>
        </div>

        {/* View Switcher: 30-Day Daily Routine vs. Vitals Charts */}
        <div className="flex items-center gap-2 bg-stone-100 p-1.5 rounded-2xl border border-stone-200 self-start md:self-center shadow-inner">
          <button
            onClick={() => setViewMode('routine')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'routine'
                ? 'bg-white text-emerald-900 shadow-md transform active:scale-95'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-emerald-700" />
            <span>30-Day Daily Routine & Graphs</span>
          </button>

          <button
            onClick={() => setViewMode('charts')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'charts'
                ? 'bg-white text-emerald-900 shadow-md transform active:scale-95'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-emerald-700" />
            <span>Physiological Vitals Graphs</span>
          </button>
        </div>
      </div>

      {viewMode === 'routine' ? (
        /* ================= 30-DAY ROUTINE & ROUTINE GRAPHS ================= */
        <div className="space-y-6 animate-in fade-in">
          {/* Top 3D Routine Graph Card */}
          <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.06)] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-serif text-xl font-bold text-stone-900">
                    30-Day Daily Routine Completion Graph
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    Live Indicator
                  </span>
                </div>
                <p className="text-xs text-stone-500 mt-0.5">
                  Percentage of daily routine milestones completed (Morning, Afternoon, Evening, Night)
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 font-semibold text-emerald-800">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span> 100% Complete
                </span>
                <span className="flex items-center gap-1.5 font-semibold text-amber-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Partial / Missed
                </span>
              </div>
            </div>

            {/* Interactive 30-Day SVG Routine Graph */}
            <div className="relative overflow-x-auto pt-2">
              <svg viewBox="0 0 860 160" className="w-full min-w-[700px] h-auto select-none">
                <defs>
                  <linearGradient id="routineGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#059669" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#059669" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* 100% Target Line */}
                <line x1="45" y1="25" x2="840" y2="25" stroke="#E5E7EB" strokeDasharray="3 3" />
                <text x="12" y="29" fill="#9CA3AF" fontSize="9" fontWeight="bold">100%</text>

                {/* 75% Line */}
                <line x1="45" y1="58" x2="840" y2="58" stroke="#E5E7EB" strokeDasharray="3 3" />
                <text x="18" y="62" fill="#9CA3AF" fontSize="9">75%</text>

                {/* 50% Line */}
                <line x1="45" y1="92" x2="840" y2="92" stroke="#E5E7EB" strokeDasharray="3 3" />
                <text x="18" y="96" fill="#9CA3AF" fontSize="9">50%</text>

                {/* Plot Area */}
                {/* SVG path coordinates: xStep = (840-45)/29 = 27.4 */}
                <path
                  d={`M 45,${125 - routineScores[0].score * 1.0} ` +
                    routineScores
                      .map((r, i) => `L ${45 + i * 27.4},${125 - r.score * 1.0}`)
                      .join(' ') +
                    ` L 840,135 L 45,135 Z`}
                  fill="url(#routineGrad)"
                />
                <path
                  d={`M 45,${125 - routineScores[0].score * 1.0} ` +
                    routineScores
                      .map((r, i) => `L ${45 + i * 27.4},${125 - r.score * 1.0}`)
                      .join(' ')}
                  fill="none"
                  stroke="#059669"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* Data Points */}
                {routineScores.map((r, i) => {
                  const cx = 45 + i * 27.4;
                  const cy = 125 - r.score * 1.0;
                  const isSelected = r.day === selectedRoutineDay;
                  const isDrop = r.score < 80;

                  return (
                    <g key={r.day} onClick={() => setSelectedRoutineDay(r.day)} className="cursor-pointer">
                      <circle
                        cx={cx}
                        cy={cy}
                        r={isSelected ? 6 : isDrop ? 4.5 : 3.5}
                        fill={isDrop ? '#EF4444' : isSelected ? '#1E3A8A' : '#059669'}
                        stroke="#FFFFFF"
                        strokeWidth={isSelected ? 2.5 : 1.5}
                      />
                      {/* Day Label on X Axis */}
                      {(i % 2 === 0 || i === routineScores.length - 1) && (
                        <text
                          x={cx}
                          y={150}
                          textAnchor="middle"
                          fill={isSelected ? '#111827' : '#6B7280'}
                          fontSize="9"
                          fontWeight={isSelected ? 'bold' : 'normal'}
                        >
                          D{r.day}
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Selected Day Indicator Bar */}
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-800" />
                <span className="font-bold text-emerald-950">
                  Inspecting Day {activeRoutineDayData.day} ({activeRoutineDayData.date}):
                </span>
                <span className="bg-emerald-800 text-white font-bold px-2.5 py-0.5 rounded-full">
                  Routine Score: {activeRoutineDayData.score}% ({activeRoutineDayData.completedCount} Milestones)
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-stone-500 text-[11px]">Click any day node on graph to inspect</span>
                <select
                  value={selectedRoutineDay}
                  onChange={(e) => setSelectedRoutineDay(Number(e.target.value))}
                  className="bg-white border border-stone-300 font-bold text-stone-800 px-2.5 py-1 rounded-xl cursor-pointer"
                >
                  {routineScores.map((r) => (
                    <option key={r.day} value={r.day}>
                      Day {r.day} ({r.score}% Complete)
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Daily 4-Part Structured Routine Schedule Cards */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-xl font-bold text-stone-900">
                Daily Geriatric Care Schedule & Milestones
              </h3>
              <span className="text-xs text-stone-500 font-medium">
                Day {selectedRoutineDay} Personalized Routine Checklist
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {routineMilestones.map((milestone, idx) => {
                const Icon = milestone.icon;
                return (
                  <div
                    key={idx}
                    className="bg-white rounded-3xl border border-stone-200 p-6 shadow-[0_8px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-md transition-all space-y-4"
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${milestone.color} shadow-xs`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-serif font-bold text-base text-stone-900">
                            {milestone.period}
                          </h4>
                          <span className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider">
                            Care Milestone #{idx + 1}
                          </span>
                        </div>
                      </div>

                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full">
                        Verified
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {milestone.tasks.map((task, tIdx) => (
                        <div
                          key={tIdx}
                          className="p-3 rounded-2xl bg-stone-50/70 border border-stone-200/80 flex items-start justify-between gap-3 text-xs"
                        >
                          <div className="flex items-start gap-2.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-700 mt-0.5 shrink-0" />
                            <div>
                              <p className="font-bold text-stone-900">{task.title}</p>
                              <p className="text-stone-500 text-[11px] mt-0.5">{task.detail}</p>
                            </div>
                          </div>
                          <span className="font-mono text-[10px] text-stone-400 bg-white px-2 py-0.5 rounded-lg border border-stone-200 shrink-0">
                            {task.time}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* ================= 30-DAY VITALS GRAPHS ================= */
        <div className="space-y-6 animate-in fade-in">
          {/* Baseline vs Recent Comparison Summary Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {baselineComparison.map((m, idx) => (
              <div
                key={idx}
                className={`p-5 rounded-3xl border shadow-xs transition-all ${
                  m.status === 'critical'
                    ? 'bg-red-50 border-red-200'
                    : m.status === 'concerning'
                    ? 'bg-amber-50 border-amber-200'
                    : 'bg-white border-stone-200'
                }`}
              >
                <div className="flex items-center justify-between text-xs text-stone-500">
                  <span className="font-semibold">{m.metricName}</span>
                  <span
                    className={`font-bold px-2 py-0.5 rounded text-[10px] uppercase ${
                      m.status === 'critical'
                        ? 'bg-red-200 text-red-900'
                        : m.status === 'concerning'
                        ? 'bg-amber-200 text-amber-900'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {m.status}
                  </span>
                </div>

                <div className="mt-2 flex items-baseline justify-between">
                  <div>
                    <span className="text-2xl font-bold text-stone-900">{m.recentAvg}</span>
                    <span className="text-xs text-stone-500 ml-1">{m.unit}</span>
                  </div>
                  <span
                    className={`text-xs font-bold ${
                      m.changeValue > 0 ? 'text-red-700' : 'text-emerald-700'
                    }`}
                  >
                    {m.changeValue > 0 ? `+${m.changeValue}` : m.changeValue} {m.unit}
                  </span>
                </div>

                <p className="text-[11px] text-stone-600 mt-2 leading-relaxed">
                  Baseline: {m.baselineAvg} {m.unit} • {m.explanation}
                </p>
              </div>
            ))}
          </div>

          {/* Interactive SVG Chart Component */}
          <TimelineCharts data={timelineData} onSelectDay={(day) => setSelectedDay(day)} />

          {/* Day-by-Day Historical Log List */}
          <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
              <div>
                <h3 className="font-serif text-lg font-bold text-stone-900">
                  Day-by-Day Continuous Observations
                </h3>
                <p className="text-xs text-stone-500">
                  Reverse chronological order (Today: Day 30 down to Day 1)
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFilterOnlyFlagged(!filterOnlyFlagged)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                    filterOnlyFlagged
                      ? 'bg-amber-100 text-amber-900 font-bold border border-amber-300'
                      : 'bg-stone-100 text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {filterOnlyFlagged ? 'Showing Only Flagged Days' : 'Filter Flagged Events'}
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {displayList.map((day) => (
                <div
                  key={day.day}
                  onClick={() => setSelectedDay(day)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    day.isFlagged
                      ? 'border-amber-300 bg-amber-50/40 hover:bg-amber-50'
                      : 'border-stone-200 bg-white hover:border-stone-300'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                          day.isFlagged
                            ? 'bg-amber-600 text-white'
                            : 'bg-stone-100 text-stone-800'
                        }`}
                      >
                        D{day.day}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-stone-900">{day.date}</span>
                          {day.isBaseline && (
                            <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                              Baseline Phase
                            </span>
                          )}
                          {day.eventMarker && (
                            <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                              {day.eventMarker}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-4 text-xs text-stone-600 mt-1 flex-wrap">
                          <span>
                            BP: <strong className="text-stone-900">{day.systolic}/{day.diastolic} mmHg</strong>
                          </span>
                          <span>
                            Pulse: <strong className="text-stone-900">{day.heartRate} bpm</strong>
                          </span>
                          <span>
                            Sleep: <strong className="text-stone-900">{day.sleepHours} hrs</strong>
                          </span>
                          <span>
                            Adherence: <strong className="text-stone-900">{day.adherenceRate}%</strong>
                          </span>
                        </div>
                      </div>
                    </div>

                    {day.isFlagged && (
                      <div className="sm:text-right">
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-lg">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Flagged Observation</span>
                        </span>
                        <p className="text-[11px] text-amber-900 mt-1 max-w-sm font-medium">
                          {day.flagReason}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
