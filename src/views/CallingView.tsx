import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CallScheduleItem } from '../types';
import {
  PhoneCall,
  Video,
  Mic,
  MicOff,
  VideoOff,
  Calendar,
  Clock,
  CheckCircle2,
  PhoneForwarded,
  MessageSquare,
  Users,
  ShieldCheck,
  Plus,
} from 'lucide-react';

export const CallingView: React.FC = () => {
  const {
    callSchedules,
    scheduleNewCall,
    patient,
    role,
    isElderlyMode,
  } = useApp();

  const [activeCallRoom, setActiveCallRoom] = useState<CallScheduleItem | null>(null);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);

  // New call schedule form
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [callPurpose, setCallPurpose] = useState('');
  const [callDate, setCallDate] = useState('Tomorrow');
  const [callTime, setCallTime] = useState('05:30 PM');
  const [callType, setCallType] = useState<'voice' | 'video'>('video');

  const handleCreateSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    scheduleNewCall({
      callerName: role === 'doctor' ? `Dr. ${patient.primaryDoctorName}` : patient.caregiverName,
      callerRole: role === 'doctor' ? 'Doctor' : 'Caregiver',
      recipientName: role === 'patient' ? `Dr. ${patient.primaryDoctorName}` : patient.name,
      recipientRole: role === 'patient' ? 'Doctor' : 'Patient',
      dateTime: `${callDate} at ${callTime}`,
      purpose: callPurpose || 'Routine Health & Medication Review',
      callType,
    });
    setCallPurpose('');
    setShowScheduleForm(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
              <PhoneCall className="w-5 h-5" />
            </span>
            <h2 className="font-serif text-2xl font-bold text-stone-900">
              Care Circle Telehealth & Call Center
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Doctor tele-consultations, scheduled family check-ins, and direct phone/WhatsApp links
          </p>
        </div>

        <button
          onClick={() => setShowScheduleForm(!showScheduleForm)}
          className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule New Call</span>
        </button>
      </div>

      {/* Direct Call & WhatsApp Deep Links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Direct Call Doctor */}
        <div className="p-5 bg-white rounded-3xl border border-stone-200 shadow-xs flex flex-col justify-between space-y-3">
          <div>
            <span className="text-[10px] font-bold uppercase text-purple-700 bg-purple-100 px-2 py-0.5 rounded">
              Treating Clinician
            </span>
            <h4 className="font-serif font-bold text-base text-stone-900 mt-2">
              Dr. {patient.primaryDoctorName}
            </h4>
            <p className="text-xs text-stone-500">{patient.doctorPhone}</p>
          </div>
          <a
            href={`tel:${patient.doctorPhone}`}
            className="w-full py-2.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Direct Doctor Call</span>
          </a>
        </div>

        {/* Direct Call Family Caregiver */}
        <div className="p-5 bg-white rounded-3xl border border-stone-200 shadow-xs flex flex-col justify-between space-y-3">
          <div>
            <span className="text-[10px] font-bold uppercase text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
              Primary Caregiver
            </span>
            <h4 className="font-serif font-bold text-base text-stone-900 mt-2">
              {patient.caregiverName}
            </h4>
            <p className="text-xs text-stone-500">{patient.caregiverPhone}</p>
          </div>
          <a
            href={`tel:${patient.caregiverPhone}`}
            className="w-full py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Direct Family Call</span>
          </a>
        </div>

        {/* Family WhatsApp Group Link (Real wa.me deep link fallback) */}
        <div className="p-5 bg-white rounded-3xl border border-stone-200 shadow-xs flex flex-col justify-between space-y-3">
          <div>
            <span className="text-[10px] font-bold uppercase text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
              Family WhatsApp Link
            </span>
            <h4 className="font-serif font-bold text-base text-stone-900 mt-2">
              Care Circle Chat
            </h4>
            <p className="text-xs text-stone-500">Verified wa.me link for updates</p>
          </div>
          <a
            href={`https://wa.me/${patient.caregiverPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
              `Namaste Pooja, this is an update regarding Ramesh Sharma's daily care from Elderly.`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 bg-[#25D366] hover:bg-[#1EBE5D] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-xs"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Open WhatsApp Chat</span>
          </a>
        </div>
      </div>

      {/* Schedule Form Modal */}
      {showScheduleForm && (
        <div className="bg-stone-50 rounded-3xl border border-stone-200 p-6 space-y-4 animate-in fade-in">
          <h3 className="font-serif font-bold text-base text-stone-900">
            Schedule a New Care Consultation Call
          </h3>

          <form onSubmit={handleCreateSchedule} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Date</label>
                <input
                  type="text"
                  value={callDate}
                  onChange={(e) => setCallDate(e.target.value)}
                  placeholder="e.g. Tomorrow or 2026-11-02"
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs bg-white focus:outline-emerald-700"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Time</label>
                <input
                  type="text"
                  value={callTime}
                  onChange={(e) => setCallTime(e.target.value)}
                  placeholder="e.g. 05:30 PM"
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs bg-white focus:outline-emerald-700"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Call Format</label>
                <select
                  value={callType}
                  onChange={(e) => setCallType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs bg-white focus:outline-emerald-700 cursor-pointer"
                >
                  <option value="video">Telehealth Video Call</option>
                  <option value="voice">Audio Phone Call</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Consultation Purpose</label>
              <input
                type="text"
                value={callPurpose}
                onChange={(e) => setCallPurpose(e.target.value)}
                placeholder="e.g. Discuss recent blood pressure fluctuations and sleep patterns"
                className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs bg-white focus:outline-emerald-700"
                required
              />
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowScheduleForm(false)}
                className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Confirm Appointment
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Simulated WebRTC Video Consultation Room */}
      {activeCallRoom && (
        <div className="bg-stone-900 text-white rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-stone-800">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded">
                WebRTC Video Consultation Room (Prototype Simulator)
              </span>
              <h3 className="text-xl font-bold mt-1">
                {activeCallRoom.purpose}
              </h3>
              <p className="text-stone-400 text-xs">
                With: {activeCallRoom.callerName} • Status: Connected
              </p>
            </div>

            <button
              onClick={() => setActiveCallRoom(null)}
              className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              End Call
            </button>
          </div>

          {/* Video Frames Simulation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-64 sm:h-80">
            {/* Remote Physician Video Feed */}
            <div className="bg-stone-800 rounded-2xl relative overflow-hidden flex items-center justify-center border border-stone-700">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 rounded-full bg-purple-900/60 text-purple-300 mx-auto flex items-center justify-center font-bold text-xl border border-purple-500">
                  AK
                </div>
                <p className="font-bold text-sm text-stone-200">{activeCallRoom.callerName}</p>
                <p className="text-[11px] text-emerald-400 flex items-center justify-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span> Live Audio/Video Stream
                </p>
              </div>

              <span className="absolute bottom-3 left-3 bg-black/60 px-2 py-1 rounded text-[10px] text-white">
                Remote Video (Dr. Mehta)
              </span>
            </div>

            {/* Local Patient Video Feed */}
            <div className="bg-stone-800 rounded-2xl relative overflow-hidden flex items-center justify-center border border-stone-700">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 rounded-full bg-emerald-900/60 text-emerald-300 mx-auto flex items-center justify-center font-bold text-xl border border-emerald-500">
                  RS
                </div>
                <p className="font-bold text-sm text-stone-200">{patient.name} (Patient)</p>
                <p className="text-[11px] text-stone-400">Camera Active</p>
              </div>

              <span className="absolute bottom-3 left-3 bg-black/60 px-2 py-1 rounded text-[10px] text-white">
                You ({patient.name})
              </span>
            </div>
          </div>

          {/* Call Controls Bar */}
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setIsAudioMuted(!isAudioMuted)}
              className={`p-3 rounded-2xl flex items-center justify-center transition-colors cursor-pointer ${
                isAudioMuted ? 'bg-red-600 text-white' : 'bg-stone-800 hover:bg-stone-700 text-stone-200'
              }`}
            >
              {isAudioMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            <button
              onClick={() => setIsVideoMuted(!isVideoMuted)}
              className={`p-3 rounded-2xl flex items-center justify-center transition-colors cursor-pointer ${
                isVideoMuted ? 'bg-red-600 text-white' : 'bg-stone-800 hover:bg-stone-700 text-stone-200'
              }`}
            >
              {isVideoMuted ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
            </button>

            <button
              onClick={() => setActiveCallRoom(null)}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold text-sm transition-colors cursor-pointer"
            >
              Disconnect Consultation
            </button>
          </div>
        </div>
      )}

      {/* Scheduled Calls List */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs space-y-4">
        <h3 className="font-serif text-lg font-bold text-stone-900">
          Upcoming Care Circle Appointments
        </h3>

        {callSchedules.length === 0 ? (
          <p className="text-xs text-stone-500 py-4 text-center">No calls scheduled.</p>
        ) : (
          <div className="space-y-3">
            {callSchedules.map((call) => (
              <div
                key={call.id}
                className="p-4 rounded-2xl border border-stone-200 bg-stone-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-stone-900">{call.purpose}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        call.callType === 'video' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {call.callType}
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 mt-1">
                    Between: <strong>{call.callerName}</strong> ({call.callerRole}) and{' '}
                    <strong>{call.recipientName}</strong>
                  </p>
                  <p className="text-xs text-stone-400 mt-0.5 font-medium">{call.dateTime}</p>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-xl uppercase ${
                      call.status === 'confirmed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {call.status}
                  </span>

                  {call.callType === 'video' && (
                    <button
                      onClick={() => setActiveCallRoom(call)}
                      className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Join Video Call</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
