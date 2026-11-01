import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ShieldAlert, Phone, MapPin, CheckCircle, Clock, AlertTriangle, X, Volume2, VolumeX } from 'lucide-react';
import { emergencyAudio } from '../services/emergencyAudio';

interface EmergencyModalProps {
  onOpenHospitalMap?: () => void;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({ onOpenHospitalMap }) => {
  const {
    activeEmergencyModal,
    setActiveEmergencyModal,
    resolveEmergencyEvent,
    emergencyContacts,
    patient,
    isElderlyMode,
  } = useApp();

  const [resolutionNotes, setResolutionNotes] = useState('');
  const [resolving, setResolving] = useState(false);
  const [isSirenActive, setIsSirenActive] = useState(true);

  useEffect(() => {
    // Sync state with emergencyAudio
    setIsSirenActive(emergencyAudio.getIsPlaying());
  }, [activeEmergencyModal]);

  if (!activeEmergencyModal) return null;

  const handleClose = () => {
    emergencyAudio.stopEmergencySiren();
    setIsSirenActive(false);
    setActiveEmergencyModal(null);
  };

  const handleResolve = () => {
    emergencyAudio.stopEmergencySiren();
    setIsSirenActive(false);
    resolveEmergencyEvent(
      activeEmergencyModal.id,
      resolutionNotes || 'Patient reported feeling safe; family/doctor confirmed stabilization.'
    );
  };

  const toggleSiren = () => {
    if (isSirenActive) {
      emergencyAudio.stopEmergencySiren();
      setIsSirenActive(false);
    } else {
      emergencyAudio.playEmergencySiren(25000);
      setIsSirenActive(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full border-4 border-red-500 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 my-8">
        {/* Urgent Header */}
        <div className="bg-red-600 text-white p-6 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center animate-pulse">
              <ShieldAlert className="w-7 h-7 text-white" />
            </div>
            <div>
              <span className="text-xs uppercase font-extrabold tracking-widest bg-red-800 px-2.5 py-0.5 rounded-full">
                CRITICAL EMERGENCY PROTOCOL ACTIVE
              </span>
              <h2 className="text-xl sm:text-2xl font-serif font-black mt-1">
                Emergency Care Circle Activated
              </h2>
              <p className="text-red-100 text-xs sm:text-sm mt-0.5">
                Triggered by: {activeEmergencyModal.triggerSource} • {activeEmergencyModal.timestamp}
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="text-red-200 hover:text-white p-1 rounded-lg cursor-pointer"
            title="Dismiss Alert"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* High-Volume Emergency Audio Siren Indicator */}
          <div className="bg-red-950 text-white p-3.5 rounded-2xl flex items-center justify-between gap-3 border border-red-800 shadow-md">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isSirenActive ? 'bg-red-600 animate-pulse text-white' : 'bg-stone-800 text-stone-400'}`}>
                {isSirenActive ? <Volume2 className="w-5 h-5 animate-bounce" /> : <VolumeX className="w-5 h-5" />}
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-red-200">
                  {isSirenActive ? 'Loud Emergency Siren Sounding (Max Volume: 100%)' : 'Emergency Siren Paused'}
                </p>
                <p className="text-[11px] text-red-300">
                  Dual-tone 960Hz / 770Hz alert sounding through device speakers to wake family & neighbors
                </p>
              </div>
            </div>

            <button
              onClick={toggleSiren}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                isSirenActive
                  ? 'bg-red-800 hover:bg-red-700 text-white border border-red-600'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              {isSirenActive ? (
                <>
                  <VolumeX className="w-3.5 h-3.5" />
                  <span>Silence Siren</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Re-sound Siren</span>
                </>
              )}
            </button>
          </div>

          {/* Calming, safety-first message */}
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
            <h4 className="font-bold text-red-950 text-base">
              Stay seated, take slow deep breaths. We are alerting help.
            </h4>
            <p className="text-sm text-red-900 mt-1 leading-relaxed">
              {activeEmergencyModal.message}
            </p>
          </div>

          {/* Big One-Tap Calling Links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a
              href="tel:112"
              className={`flex items-center justify-center gap-3 rounded-2xl font-black text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-500/20 transition-all ${
                isElderlyMode ? 'py-5 text-xl' : 'py-3.5 text-base'
              }`}
            >
              <Phone className="w-6 h-6 animate-bounce" />
              <span>Call Emergency 112</span>
            </a>

            <a
              href="tel:108"
              className={`flex items-center justify-center gap-3 rounded-2xl font-black text-white bg-amber-600 hover:bg-amber-700 shadow-lg shadow-amber-500/20 transition-all ${
                isElderlyMode ? 'py-5 text-xl' : 'py-3.5 text-base'
              }`}
            >
              <Phone className="w-6 h-6 animate-bounce" />
              <span>Call Ambulance 108</span>
            </a>
          </div>

          {/* Verified Emergency Contacts One-Tap List */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
              Verified Emergency Contacts (One-Tap Tel:)
            </h4>
            <div className="space-y-2">
              {emergencyContacts.map((contact) => (
                <div
                  key={contact.id}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 transition-colors"
                >
                  <div>
                    <p className="font-bold text-stone-900 text-sm">{contact.name}</p>
                    <p className="text-xs text-stone-500">{contact.relationship} • {contact.phone}</p>
                  </div>
                  <a
                    href={`tel:${contact.phone}`}
                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition-all shadow-xs"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Now</span>
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Real Broadcast Channel Delivery Status */}
          <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-600">
                Escalation Delivery Channels (Real Verification)
              </h4>
              <span className="text-[10px] text-stone-500">Live Delivery Log</span>
            </div>

            <div className="space-y-2 text-xs">
              {activeEmergencyModal.channelStatuses.map((ch, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-stone-200"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        ch.status.includes('Delivered')
                          ? 'bg-emerald-500'
                          : ch.status.includes('Sent')
                          ? 'bg-blue-500'
                          : ch.status.includes('Prepared')
                          ? 'bg-amber-500'
                          : 'bg-stone-400'
                      }`}
                    />
                    <span className="font-semibold text-stone-800">{ch.channel}</span>
                    <span className="text-stone-400">({ch.recipient})</span>
                  </div>

                  <span
                    className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                      ch.status.includes('Delivered')
                        ? 'bg-emerald-100 text-emerald-800'
                        : ch.status.includes('Sent')
                        ? 'bg-blue-100 text-blue-800'
                        : ch.status.includes('Not configured')
                        ? 'bg-stone-100 text-stone-600'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {ch.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Resolution Box */}
          <div className="pt-3 border-t border-stone-200">
            {resolving ? (
              <div className="space-y-3">
                <label className="block text-xs font-bold text-stone-700">
                  Resolution Notes (Clinician / Family Sign-off):
                </label>
                <input
                  type="text"
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="e.g. Doctor contacted, BP checked, resting safely."
                  className="w-full text-xs p-3 rounded-xl border border-stone-300 focus:outline-emerald-700"
                />
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => setResolving(false)}
                    className="px-3 py-1.5 text-xs text-stone-600 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleResolve}
                    className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold"
                  >
                    Confirm Resolution
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3">
                {onOpenHospitalMap && (
                  <button
                    onClick={() => {
                      handleClose();
                      onOpenHospitalMap();
                    }}
                    className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-950 underline cursor-pointer"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>View Nearby Hospitals on Map</span>
                  </button>
                )}

                <button
                  onClick={() => setResolving(true)}
                  className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold text-xs rounded-xl transition-colors ml-auto"
                >
                  Mark Emergency Resolved
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
