import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AgentType } from '../types';
import {
  Bot,
  HeartHandshake,
  Users,
  Stethoscope,
  Smile,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Play,
  Clock,
  Shield,
  FileText,
  Calendar,
  Send,
  Sparkles,
} from 'lucide-react';

interface AgentsViewProps {
  onNavigate: (tab: string) => void;
}

export const AgentsView: React.FC<AgentsViewProps> = ({ onNavigate }) => {
  const {
    agents,
    carePlan,
    patient,
    socialObservations,
    callSchedules,
    isElderlyMode,
  } = useApp();

  const [selectedAgent, setSelectedAgent] = useState<AgentType>('patient_care');
  const [simulationTriggering, setSimulationTriggering] = useState(false);
  const [simulationMessage, setSimulationMessage] = useState<string | null>(null);

  const activeAgentInfo = agents[selectedAgent];

  const agentIcons: Record<AgentType, any> = {
    patient_care: HeartHandshake,
    caregiver_agent: Users,
    clinician_agent: Stethoscope,
    social_wellbeing: Smile,
  };

  const agentColors: Record<AgentType, { border: string; bg: string; text: string; lightBg: string }> = {
    patient_care: { border: 'border-emerald-600', bg: 'bg-emerald-700', text: 'text-emerald-800', lightBg: 'bg-emerald-50' },
    caregiver_agent: { border: 'border-blue-600', bg: 'bg-blue-700', text: 'text-blue-800', lightBg: 'bg-blue-50' },
    clinician_agent: { border: 'border-purple-600', bg: 'bg-purple-700', text: 'text-purple-800', lightBg: 'bg-purple-50' },
    social_wellbeing: { border: 'border-amber-600', bg: 'bg-amber-700', text: 'text-amber-800', lightBg: 'bg-amber-50' },
  };

  const handleSimulateScheduledCheckIn = () => {
    setSimulationTriggering(true);
    setSimulationMessage('Triggering simulated 08:30 scheduled check-in via Caregiver & Patient pipeline...');
    setTimeout(() => {
      setSimulationTriggering(false);
      setSimulationMessage('Simulated check-in dispatched. Verification logged in agent activity timeline.');
      setTimeout(() => setSimulationMessage(null), 4000);
    }, 1200);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Overview Banner */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
              <Bot className="w-5 h-5" />
            </span>
            <h2 className="font-serif text-2xl font-bold text-stone-900">
              The 4 Elderly AI Agents
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-2xl">
            Each agent has specialized clinical boundaries, explicit input permissions, and auditable outputs coordinated through a single evolving Care Plan.
          </p>
        </div>

        <button
          onClick={handleSimulateScheduledCheckIn}
          disabled={simulationTriggering}
          className="px-4 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-2xl text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer self-start md:self-center"
        >
          <Play className="w-3.5 h-3.5 fill-white" />
          <span>Simulate Scheduled Check-in (pg_cron)</span>
        </button>
      </div>

      {simulationMessage && (
        <div className="p-3 bg-emerald-100 border border-emerald-300 rounded-2xl text-xs font-semibold text-emerald-900 animate-in fade-in">
          {simulationMessage}
        </div>
      )}

      {/* 4 Agent Navigation Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {(Object.keys(agents) as AgentType[]).map((agentKey) => {
          const info = agents[agentKey];
          const Icon = agentIcons[agentKey];
          const isSelected = selectedAgent === agentKey;
          const styling = agentColors[agentKey];

          return (
            <div
              key={agentKey}
              onClick={() => setSelectedAgent(agentKey)}
              className={`p-5 rounded-3xl border cursor-pointer transition-all ${
                isSelected
                  ? `${styling.border} ${styling.lightBg} shadow-md`
                  : 'bg-white border-stone-200 hover:border-stone-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white ${styling.bg}`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    info.status === 'needs_attention'
                      ? 'bg-amber-100 text-amber-800 animate-pulse'
                      : info.status === 'running'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {info.status === 'needs_attention'
                    ? 'Needs Attention'
                    : info.status === 'running'
                    ? 'Active'
                    : 'Idle / Ready'}
                </span>
              </div>

              <h3 className="font-serif font-bold text-base text-stone-900 mt-3">{info.name}</h3>
              <p className="text-xs text-stone-500 mt-0.5 font-medium">{info.title}</p>
            </div>
          );
        })}
      </div>

      {/* Active Agent Dedicated Workspace */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-100 gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif text-xl font-bold text-stone-900">
                {activeAgentInfo.name} Workspace
              </h3>
              <span className="text-xs font-mono text-stone-400">({activeAgentInfo.id})</span>
            </div>
            <p className="text-xs sm:text-sm text-stone-600 mt-1">
              {activeAgentInfo.roleDescription}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {selectedAgent === 'patient_care' && (
              <button
                onClick={() => onNavigate('patient_agent')}
                className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Launch Conversation UI
              </button>
            )}
            {selectedAgent === 'clinician_agent' && (
              <button
                onClick={() => onNavigate('doctor_summary')}
                className="px-4 py-2 bg-purple-800 hover:bg-purple-900 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Open Doctor Report & PDF
              </button>
            )}
            {selectedAgent === 'caregiver_agent' && (
              <button
                onClick={() => onNavigate('calling')}
                className="px-4 py-2 bg-blue-800 hover:bg-blue-900 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                View Call Schedules
              </button>
            )}
          </div>
        </div>

        {/* Permissions & Boundary Specs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
            <h4 className="font-bold text-stone-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-stone-600" />
              <span>Inputs & Data It May Access</span>
            </h4>
            <ul className="space-y-1.5 text-stone-600">
              {activeAgentInfo.inputAccess.map((inp, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-700" />
                  <span>{inp}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
            <h4 className="font-bold text-stone-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-stone-600" />
              <span>Primary Outputs & Responsibilities</span>
            </h4>
            <p className="text-stone-700 leading-relaxed">{activeAgentInfo.primaryOutput}</p>
          </div>
        </div>

        {/* Specialized content based on selected agent */}
        {selectedAgent === 'social_wellbeing' && (
          <div className="space-y-4 pt-2">
            <h4 className="font-serif font-bold text-base text-stone-900 flex items-center gap-2">
              <Smile className="w-5 h-5 text-amber-600" />
              <span>Social Observations & Loneliness Tracking (Repeated Observations)</span>
            </h4>

            <div className="space-y-3">
              {socialObservations.map((obs) => (
                <div
                  key={obs.id}
                  className="p-4 rounded-2xl border border-amber-200 bg-amber-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-amber-900 bg-amber-200/70 px-2 py-0.5 rounded">
                        {obs.date}
                      </span>
                      <span className="text-xs font-bold text-stone-800">{obs.indicator}</span>
                      <span className="text-[10px] text-amber-800 font-bold">
                        Loneliness Risk: {obs.riskScore}/100
                      </span>
                    </div>
                    <p className="text-xs text-stone-600 mt-1">{obs.evidence}</p>
                    <p className="text-xs text-emerald-800 font-semibold mt-1">
                      Action: {obs.suggestedAction}
                    </p>
                  </div>

                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-xl shrink-0 ${
                      obs.status === 'completed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {obs.status === 'completed' ? 'Action Completed' : 'Action Suggested'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Agent Activity Log */}
        <div>
          <h4 className="font-serif font-bold text-base text-stone-900 mb-3 flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-700" />
            <span>Real Activity Log for {activeAgentInfo.name}</span>
          </h4>

          <div className="space-y-2">
            {activeAgentInfo.recentActivity.map((act) => (
              <div
                key={act.id}
                className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/50 flex items-start justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-stone-900">{act.action}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.2 rounded ${
                        act.severity === 'warning'
                          ? 'bg-red-100 text-red-800'
                          : act.severity === 'notice'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {act.severity.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-stone-600 mt-0.5">{act.detail}</p>
                </div>
                <span className="text-stone-400 font-mono text-[11px] shrink-0">{act.timestamp}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Shared Evolving Care Plan Coordination Box */}
        <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-200">
          <div className="flex items-center justify-between pb-2 border-b border-emerald-200/60">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-800" />
              <h4 className="font-bold text-xs uppercase tracking-wider text-emerald-950">
                Shared Evolving Care Plan (Central Coordination Backbone)
              </h4>
            </div>
            <span className="text-[10px] text-emerald-700 font-mono">
              Version updated: {carePlan.lastUpdated}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3 text-xs text-stone-700">
            <div>
              <p className="font-bold text-stone-900">Current Health Goals:</p>
              <ul className="list-disc list-inside space-y-1 mt-1 text-stone-600">
                {carePlan.goals.map((g, idx) => (
                  <li key={idx}>{g}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-bold text-stone-900">Configured Escalation Rules:</p>
              <p className="mt-1 text-stone-600">
                • Notify caregiver Pooja after {carePlan.escalationRules.notifyCaregiverAfterMissedCheckIns} missed check-ins.
              </p>
              <p className="text-stone-600">
                • Immediate emergency SOS trigger on acute cardiac or respiratory symptoms.
              </p>
              <p className="text-stone-600">
                • Weekly clinician summary compile for Dr. A. K. Mehta.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
