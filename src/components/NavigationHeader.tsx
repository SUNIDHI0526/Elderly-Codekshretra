import React from 'react';
import { useApp } from '../context/AppContext';
import { SupportedLanguage, UserRole } from '../types';
import {
  HeartHandshake,
  ShieldAlert,
  Languages,
  User,
  Activity,
  Calendar,
  Pill,
  MapPin,
  PhoneCall,
  FileText,
  Bot,
  Eye,
  CheckCircle,
} from 'lucide-react';

interface NavigationHeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenSafetyTests: () => void;
}

export const NavigationHeader: React.FC<NavigationHeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenSafetyTests,
}) => {
  const {
    role,
    setRole,
    language,
    setLanguage,
    isElderlyMode,
    setIsElderlyMode,
    triggerEmergencySOS,
    t,
  } = useApp();

  const navItems = [
    { id: 'dashboard', label: t('navDashboard'), icon: Activity },
    { id: 'patient_agent', label: t('navPatientAgent'), icon: HeartHandshake },
    { id: 'agents', label: t('navAgents'), icon: Bot },
    { id: 'timeline', label: t('navTimeline'), icon: Calendar },
    { id: 'medications', label: t('navMedications'), icon: Pill },
    { id: 'vitals', label: t('navVitals'), icon: Activity },
    { id: 'emergency', label: t('navEmergency'), icon: MapPin },
    { id: 'calling', label: t('navCalling'), icon: PhoneCall },
    { id: 'doctor_summary', label: t('navDoctorSummary'), icon: FileText },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-xs">
      {/* Top Banner: Local Demo Notice & Quick Settings */}
      <div className="bg-[#1C412E] text-emerald-100 text-xs px-4 py-1.5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-bold text-white tracking-wide">ELDERLY</span>
          <span className="text-emerald-300 hidden sm:inline">| Continuous Elderly Care Between Visits</span>
          <span className="bg-emerald-900/80 text-emerald-200 text-[10px] px-2 py-0.5 rounded-full font-mono border border-emerald-700/50">
            LOCAL DEMO MODE (Supabase & Twilio Keys Optional)
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenSafetyTests}
            className="text-[11px] font-semibold text-emerald-200 hover:text-white underline cursor-pointer"
          >
            Run 24 Safety Tests
          </button>
          <span className="text-emerald-700">|</span>
          <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-[11px] text-white">
            <input
              type="checkbox"
              checked={isElderlyMode}
              onChange={(e) => setIsElderlyMode(e.target.checked)}
              className="accent-emerald-400 w-3.5 h-3.5 rounded"
            />
            <Eye className="w-3.5 h-3.5 text-emerald-300" />
            <span>Elderly Mode (Big Text)</span>
          </label>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Brand */}
        <div
          onClick={() => setActiveTab('dashboard')}
          className="flex items-center gap-2.5 cursor-pointer select-none"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-800 to-stone-900 flex items-center justify-center text-white shadow-sm">
            <HeartHandshake className="w-6 h-6 text-emerald-300" />
          </div>
          <div>
            <h1 className="font-serif text-xl font-black text-stone-900 tracking-tight leading-tight">
              Elderly
            </h1>
            <p className="text-[11px] text-stone-500 font-medium">Multi-Agent Continuous Care</p>
          </div>
        </div>

        {/* Global Controls: Role Switcher, Language & Emergency SOS */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Role Switcher */}
          <div className="flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200 text-xs">
            <button
              onClick={() => setRole('patient')}
              className={`px-2.5 py-1.5 rounded-lg font-semibold transition-all ${
                role === 'patient'
                  ? 'bg-white text-emerald-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Patient
            </button>
            <button
              onClick={() => setRole('caregiver')}
              className={`px-2.5 py-1.5 rounded-lg font-semibold transition-all ${
                role === 'caregiver'
                  ? 'bg-white text-blue-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Caregiver
            </button>
            <button
              onClick={() => setRole('doctor')}
              className={`px-2.5 py-1.5 rounded-lg font-semibold transition-all ${
                role === 'doctor'
                  ? 'bg-white text-purple-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Doctor
            </button>
          </div>

          {/* Language Selector (6 Languages) */}
          <div className="relative flex items-center bg-stone-100 rounded-xl px-2 py-1 border border-stone-200">
            <Languages className="w-3.5 h-3.5 text-stone-500 mr-1.5" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
              className="bg-transparent text-xs font-semibold text-stone-800 focus:outline-hidden cursor-pointer"
            >
              <option value="en-IN">English (India)</option>
              <option value="hi-IN">हिन्दी (Hindi)</option>
              <option value="mr-IN">मराठी (Marathi)</option>
              <option value="gu-IN">ગુજરાતી (Gujarati)</option>
              <option value="bn-IN">বাংলা (Bengali)</option>
              <option value="ta-IN">தமிழ் (Tamil)</option>
            </select>
          </div>

          {/* Persistent Always-Visible Emergency SOS Button */}
          <button
            onClick={() => triggerEmergencySOS('Header One-Tap SOS', 'Manual SOS button pressed by patient')}
            className={`font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-all transform active:scale-95 cursor-pointer ${
              isElderlyMode
                ? 'bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 text-base border-2 border-red-700'
                : 'bg-red-600 hover:bg-red-700 text-white px-3.5 py-1.5 text-xs'
            }`}
          >
            <ShieldAlert className={isElderlyMode ? 'w-5 h-5 animate-pulse' : 'w-4 h-4'} />
            <span>{t('sosButton')}</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className="max-w-7xl mx-auto px-4 overflow-x-auto scrollbar-none border-t border-stone-100">
        <div className="flex items-center gap-1 py-1.5 min-w-max">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </header>
  );
};
