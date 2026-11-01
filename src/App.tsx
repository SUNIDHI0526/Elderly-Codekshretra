import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { NavigationHeader } from './components/NavigationHeader';
import { EmergencyModal } from './components/EmergencyModal';
import { SafetyTestSuiteModal } from './components/SafetyTestSuiteModal';

// Views
import { DashboardView } from './views/DashboardView';
import { PatientAgentView } from './views/PatientAgentView';
import { AgentsView } from './views/AgentsView';
import { TimelineView } from './views/TimelineView';
import { MedicationsView } from './views/MedicationsView';
import { VitalsView } from './views/VitalsView';
import { EmergencyView } from './views/EmergencyView';
import { CallingView } from './views/CallingView';
import { DoctorSummaryView } from './views/DoctorSummaryView';

const MainAppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isSafetyModalOpen, setIsSafetyModalOpen] = useState<boolean>(false);
  const { isElderlyMode, setLanguage } = useApp();

  const handleTestPhraseSelected = (phrase: string, lang: any) => {
    setLanguage(lang);
    setActiveTab('patient_agent');
  };

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-200 ${
        isElderlyMode ? 'text-lg bg-[#FAF9F5]' : 'text-base bg-[#F8F7F2]'
      }`}
    >
      {/* Navigation Header */}
      <NavigationHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSafetyTests={() => setIsSafetyModalOpen(true)}
      />

      {/* Main Content View Switcher */}
      <main className="flex-1 pb-16">
        {activeTab === 'dashboard' && <DashboardView onNavigate={(tab) => setActiveTab(tab)} />}
        {activeTab === 'patient_agent' && (
          <PatientAgentView onOpenSafetyTests={() => setIsSafetyModalOpen(true)} />
        )}
        {activeTab === 'agents' && <AgentsView onNavigate={(tab) => setActiveTab(tab)} />}
        {activeTab === 'timeline' && <TimelineView onNavigate={(tab) => setActiveTab(tab)} />}
        {activeTab === 'medications' && <MedicationsView />}
        {activeTab === 'vitals' && <VitalsView />}
        {activeTab === 'emergency' && <EmergencyView />}
        {activeTab === 'calling' && <CallingView />}
        {activeTab === 'doctor_summary' && <DoctorSummaryView />}
      </main>

      {/* Persistent Emergency Interrupt Modal */}
      <EmergencyModal onOpenHospitalMap={() => setActiveTab('emergency')} />

      {/* 24-Case Safety Suite Modal */}
      <SafetyTestSuiteModal
        isOpen={isSafetyModalOpen}
        onClose={() => setIsSafetyModalOpen(false)}
        onTestPhraseSelected={handleTestPhraseSelected}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
