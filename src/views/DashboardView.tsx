import React from 'react';
import { useApp } from '../context/AppContext';
import { CareCircle3DOrb } from '../components/CareCircle3DOrb';
import {
  Heart,
  Activity,
  Pill,
  Moon,
  Clock,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  PhoneCall,
  Calendar,
  Sparkles,
  TrendingUp,
  Zap,
} from 'lucide-react';

interface DashboardViewProps {
  onNavigate: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const {
    role,
    patient,
    isElderlyMode,
    medications,
    markMedicationStatus,
    triggerEmergencySOS,
    agents,
    t,
  } = useApp();

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 py-6">
      {/* 3D Hero Banner with Floating Tactile Elements */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#183928] via-[#214D36] to-[#163324] text-white p-7 sm:p-9 shadow-[0_20px_40px_-15px_rgba(20,55,36,0.35)] border border-emerald-700/30">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold text-emerald-200 border border-white/15 shadow-inner">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
              <span>3D Continuous Care Circle • Real-time Monitoring</span>
            </div>

            <h2 className={`font-serif font-bold tracking-tight text-white ${isElderlyMode ? 'text-3xl sm:text-5xl' : 'text-3xl sm:text-4xl'}`}>
              Namaste, {patient.name}
            </h2>

            <p className="text-emerald-100 text-sm sm:text-base leading-relaxed">
              Your 4 specialized AI agents and family care circle are active. Morning sitting BP is{' '}
              <strong className="text-white font-bold bg-white/10 px-2 py-0.5 rounded-lg border border-white/10">
                128/82 mmHg
              </strong>{' '}
              and morning antihypertensive doses are completed.
            </p>

            {/* Quick Action 3D Tactile Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => onNavigate('patient_agent')}
                className={`rounded-2xl font-bold flex items-center gap-2.5 bg-emerald-400 hover:bg-emerald-300 text-emerald-950 shadow-[0_10px_20px_-5px_rgba(52,211,153,0.4)] transition-all transform hover:-translate-y-0.5 active:translate-y-0 active:shadow-inner cursor-pointer ${
                  isElderlyMode ? 'px-7 py-3.5 text-lg' : 'px-5 py-3 text-sm'
                }`}
              >
                <Heart className="w-5 h-5 text-emerald-900 fill-emerald-900" />
                <span>Talk to Care Companion AI</span>
              </button>

              <button
                onClick={() => onNavigate('timeline')}
                className="rounded-2xl font-semibold px-5 py-3 text-sm bg-white/15 hover:bg-white/25 text-white backdrop-blur-md transition-all border border-white/15 flex items-center gap-2 shadow-xs cursor-pointer transform hover:-translate-y-0.5"
              >
                <Activity className="w-4 h-4 text-emerald-200" />
                <span>30-Day Routine & Graphs</span>
              </button>
            </div>
          </div>

          {/* Mini 3D Live Vital Indicator Card on Hero */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-5 text-white space-y-3 min-w-[260px] shadow-lg">
            <div className="flex items-center justify-between text-xs text-emerald-200 font-semibold">
              <span>Live Health Status</span>
              <span className="flex items-center gap-1 text-emerald-300 bg-emerald-900/60 px-2 py-0.5 rounded-full text-[10px]">
                <TrendingUp className="w-3 h-3" /> Stabilized
              </span>
            </div>

            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-3xl font-extrabold tracking-tight">128/82</span>
                <span className="text-xs text-emerald-200 ml-1">mmHg</span>
              </div>
              <div className="text-right">
                <span className="text-xl font-bold">75</span>
                <span className="text-xs text-emerald-200 ml-1">bpm</span>
              </div>
            </div>

            {/* Mini Sparkline SVG Wave */}
            <div className="h-8 w-full pt-1">
              <svg viewBox="0 0 200 35" className="w-full h-full">
                <path
                  d="M 5,20 Q 30,5 60,20 T 120,12 T 160,22 T 195,15"
                  fill="none"
                  stroke="#34D399"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <circle cx="195" cy="15" r="3.5" fill="#FFFFFF" stroke="#34D399" strokeWidth="2" />
              </svg>
            </div>

            <p className="text-[11px] text-emerald-100/90 font-medium">
              Daily walk: 25 mins completed • Sleep: 6.8 hrs
            </p>
          </div>
        </div>

        {/* Ambient 3D Glow Orbs */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-20 pointer-events-none hidden md:block">
          <div className="w-72 h-72 rounded-full bg-emerald-300 blur-3xl -mr-20 -mt-20"></div>
        </div>
      </div>

      {/* 4 Health Indicator Cards with Mini Graphs Everywhere */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Blood Pressure with Sparkline */}
        <div
          onClick={() => onNavigate('vitals')}
          className="bg-white rounded-3xl border border-stone-200/90 p-5 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)] hover:shadow-lg transition-all transform hover:-translate-y-1 cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between text-xs text-stone-500 font-semibold">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                <span>Blood Pressure</span>
              </span>
              <Activity className="w-4 h-4 text-rose-500" />
            </div>

            <div className="mt-3 flex items-baseline justify-between">
              <div>
                <span className="text-2xl font-extrabold text-stone-900">128/82</span>
                <span className="text-xs text-stone-500 ml-1 font-semibold">mmHg</span>
              </div>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                Target &lt;135
              </span>
            </div>
          </div>

          {/* Mini Graph Sparkline Indicator */}
          <div className="mt-3 pt-2 border-t border-stone-100">
            <svg viewBox="0 0 140 28" className="w-full h-7">
              <path
                d="M 2,18 L 25,16 L 50,19 L 75,14 L 100,10 L 125,20 L 138,15"
                fill="none"
                stroke="#E11D48"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <circle cx="138" cy="15" r="3" fill="#E11D48" />
            </svg>
            <div className="flex items-center justify-between text-[10px] text-stone-400 mt-1">
              <span>7-Day Trend</span>
              <span className="font-semibold text-stone-600">Resting sitting cuff</span>
            </div>
          </div>
        </div>

        {/* Card 2: Resting Heart Rate with ECG Wave */}
        <div
          onClick={() => onNavigate('vitals')}
          className="bg-white rounded-3xl border border-stone-200/90 p-5 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)] hover:shadow-lg transition-all transform hover:-translate-y-1 cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between text-xs text-stone-500 font-semibold">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                <span>Heart Rate</span>
              </span>
              <Heart className="w-4 h-4 text-red-500" />
            </div>

            <div className="mt-3 flex items-baseline justify-between">
              <div>
                <span className="text-2xl font-extrabold text-stone-900">75</span>
                <span className="text-xs text-stone-500 ml-1 font-semibold">bpm</span>
              </div>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                Optimal
              </span>
            </div>
          </div>

          {/* Mini ECG Waveform Graph */}
          <div className="mt-3 pt-2 border-t border-stone-100">
            <svg viewBox="0 0 140 28" className="w-full h-7">
              <path
                d="M 2,14 L 30,14 L 38,14 L 44,4 L 52,24 L 60,10 L 68,14 L 100,14 L 108,6 L 116,22 L 124,14 L 138,14"
                fill="none"
                stroke="#EF4444"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
            <div className="flex items-center justify-between text-[10px] text-stone-400 mt-1">
              <span>Rhythm Pulse</span>
              <span className="font-semibold text-stone-600">Sinus regular</span>
            </div>
          </div>
        </div>

        {/* Card 3: Sleep Duration with Night Graph */}
        <div
          onClick={() => onNavigate('vitals')}
          className="bg-white rounded-3xl border border-stone-200/90 p-5 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)] hover:shadow-lg transition-all transform hover:-translate-y-1 cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between text-xs text-stone-500 font-semibold">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                <span>Sleep Duration</span>
              </span>
              <Moon className="w-4 h-4 text-indigo-500" />
            </div>

            <div className="mt-3 flex items-baseline justify-between">
              <div>
                <span className="text-2xl font-extrabold text-stone-900">6.8</span>
                <span className="text-xs text-stone-500 ml-1 font-semibold">hrs</span>
              </div>
              <span className="text-[10px] font-bold text-indigo-800 bg-indigo-100 px-2 py-0.5 rounded-md">
                Score: 82/100
              </span>
            </div>
          </div>

          {/* Mini Bar Histogram Graph for Sleep */}
          <div className="mt-3 pt-2 border-t border-stone-100">
            <div className="flex items-end justify-between h-7 px-1 gap-1.5">
              {[7.2, 7.5, 6.9, 7.0, 5.2, 6.4, 6.8].map((val, idx) => (
                <div
                  key={idx}
                  style={{ height: `${(val / 8.5) * 100}%` }}
                  className={`flex-1 rounded-t-sm ${
                    val < 6.0 ? 'bg-amber-400' : 'bg-indigo-500'
                  }`}
                  title={`${val} hrs`}
                />
              ))}
            </div>
            <div className="flex items-center justify-between text-[10px] text-stone-400 mt-1">
              <span>Last 7 Nights</span>
              <span className="font-semibold text-stone-600">Goal: 7.0h+</span>
            </div>
          </div>
        </div>

        {/* Card 4: Adherence with 3D Circular Progress Ring */}
        <div
          onClick={() => onNavigate('medications')}
          className="bg-white rounded-3xl border border-stone-200/90 p-5 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)] hover:shadow-lg transition-all transform hover:-translate-y-1 cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between text-xs text-stone-500 font-semibold">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Med Adherence</span>
              </span>
              <Pill className="w-4 h-4 text-emerald-600" />
            </div>

            <div className="mt-3 flex items-baseline justify-between">
              <div>
                <span className="text-2xl font-extrabold text-stone-900">88%</span>
                <span className="text-xs text-stone-500 ml-1 font-semibold">30d</span>
              </div>
              <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                2 Missed
              </span>
            </div>
          </div>

          {/* Mini Circular Progress Ring Indicator */}
          <div className="mt-3 pt-2 border-t border-stone-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="relative w-7 h-7">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#E5E7EB"
                    strokeWidth="3.8"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#059669"
                    strokeWidth="3.8"
                    strokeDasharray="88, 100"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <span className="text-xs font-bold text-stone-700">88% Taken</span>
            </div>
            <span className="text-[10px] font-semibold text-emerald-800">Next: 08:30 PM</span>
          </div>
        </div>
      </div>

      {/* Main Grid: 3D Care Circle Orb & Status Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: 3D Care Circle Guardian Orb & Agent Statuses */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-stone-200/90 p-6 sm:p-7 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.06)] flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div>
                <h3 className="font-serif text-lg font-bold text-stone-900">3D Care Circle Guardians</h3>
                <p className="text-xs text-stone-500">Autonomous multi-agent continuous care</p>
              </div>
              <button
                onClick={() => onNavigate('agents')}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer"
              >
                <span>View Agents</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 3D Orb Scene */}
            <div className="py-2">
              <CareCircle3DOrb isElderlyMode={isElderlyMode} />
            </div>
          </div>

          {/* Quick 4 Agents Status Pills with 3D Bevel Styling */}
          <div className="space-y-2 mt-2">
            {Object.values(agents).map((agent) => (
              <div
                key={agent.id}
                onClick={() => onNavigate('agents')}
                className="flex items-center justify-between p-3 rounded-2xl border border-stone-200/70 hover:border-emerald-300 bg-stone-50/70 hover:bg-emerald-50/30 transition-all cursor-pointer shadow-xs hover:shadow-sm"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      agent.status === 'needs_attention'
                        ? 'bg-amber-500 animate-pulse shadow-xs shadow-amber-400'
                        : agent.status === 'running'
                        ? 'bg-blue-500'
                        : 'bg-emerald-500 shadow-xs shadow-emerald-400'
                    }`}
                  />
                  <div>
                    <h5 className="font-bold text-xs text-stone-900">{agent.name}</h5>
                    <p className="text-[10px] text-stone-500 truncate max-w-[200px]">
                      {agent.statusLabel}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] text-stone-400 font-mono">{agent.lastActive}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Today's Action Center & Vitals Snapshot */}
        <div className="lg:col-span-7 space-y-6">
          {/* Next Medication Alarm Card with 3D Depth */}
          <div className="bg-white rounded-3xl border border-stone-200/90 p-6 sm:p-7 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.06)] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shadow-xs">
                  <Pill className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-serif text-base font-bold text-stone-900">
                    Next Prescribed Medication
                  </h4>
                  <p className="text-xs text-stone-500">Scheduled for 08:30 PM (Night Dose)</p>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200">
                Glycomet 500mg
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="font-bold text-sm text-stone-900">Metformin Hydrochloride (Glycomet)</p>
                <p className="text-xs text-stone-500 mt-0.5">1 tablet after dinner • 24 tablets remaining in pack</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => markMedicationStatus('med-2', '20:30', 'taken')}
                  className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-700/20 transition-all cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  Mark Taken
                </button>
                <button
                  onClick={() => markMedicationStatus('med-2', '20:30', 'snoozed')}
                  className="px-3.5 py-2.5 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Snooze 15m
                </button>
              </div>
            </div>
          </div>

          {/* Social Wellbeing Banner with 3D Depth */}
          <div className="bg-gradient-to-r from-amber-50/90 to-orange-50/70 rounded-3xl border border-amber-200 p-6 flex items-start gap-4 shadow-sm">
            <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 shadow-xs">
              <AlertTriangle className="w-6 h-6 text-amber-700" />
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h4 className="font-bold text-amber-950 text-sm">
                  Social Wellbeing Agent Recommendation
                </h4>
                <span className="text-[10px] font-bold text-amber-800 bg-amber-200/60 px-2.5 py-0.5 rounded-full border border-amber-300/50">
                  Loneliness Index: 68/100
                </span>
              </div>
              <p className="text-xs text-amber-900 leading-relaxed">
                You spent the last few afternoons at home without your usual park stroll. Pooja has planned an evening video call at 7:00 PM today.
              </p>
              <div className="pt-1 flex items-center gap-3">
                <button
                  onClick={() => onNavigate('calling')}
                  className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  Confirm Family Call
                </button>
                <button
                  onClick={() => onNavigate('agents')}
                  className="text-xs font-semibold text-amber-900 underline cursor-pointer"
                >
                  View Social Observations
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
