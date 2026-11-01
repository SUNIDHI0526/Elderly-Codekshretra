import React from 'react';
import { useApp } from '../context/AppContext';
import { EmergencyMap } from '../components/EmergencyMap';
import {
  ShieldAlert,
  Phone,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Heart,
  Navigation,
} from 'lucide-react';

export const EmergencyView: React.FC = () => {
  const {
    emergencyContacts,
    emergencyEvents,
    triggerEmergencySOS,
    userLocation,
    locationPermission,
    requestLocation,
    patient,
    isElderlyMode,
  } = useApp();

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Top Critical Action Card */}
      <div className="bg-red-600 text-white rounded-3xl p-6 sm:p-8 shadow-lg shadow-red-600/10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-800/80 rounded-full text-xs font-bold uppercase tracking-wider text-red-200">
            <ShieldAlert className="w-4 h-4" />
            <span>Emergency Rapid Response Hub</span>
          </div>
          <h2 className={`font-serif font-black ${isElderlyMode ? 'text-3xl sm:text-4xl' : 'text-2xl sm:text-3xl'}`}>
            Immediate Emergency Assistance
          </h2>
          <p className="text-red-100 text-sm max-w-xl">
            One-tap activation alerts family caregivers, Dr. A. K. Mehta, and prepares verified local ambulance dispatch.
          </p>
        </div>

        <button
          onClick={() => triggerEmergencySOS('Emergency Screen Button', 'Direct SOS button pressed')}
          className={`font-black uppercase tracking-wider rounded-2xl flex items-center justify-center gap-3 bg-white text-red-600 hover:bg-red-50 transition-all transform active:scale-95 shadow-xl cursor-pointer shrink-0 ${
            isElderlyMode ? 'px-8 py-5 text-xl' : 'px-6 py-4 text-base'
          }`}
        >
          <ShieldAlert className="w-6 h-6 animate-pulse" />
          <span>Trigger Emergency SOS</span>
        </button>
      </div>

      {/* Emergency Hotlines & Verified Contacts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <a
          href="tel:112"
          className="p-4 bg-white rounded-2xl border-2 border-red-500 hover:bg-red-50/50 shadow-xs transition-colors flex items-center justify-between"
        >
          <div>
            <span className="text-[10px] font-bold uppercase text-red-600">National Helpline</span>
            <h4 className="text-xl font-black text-stone-900 mt-0.5">Call 112</h4>
            <p className="text-xs text-stone-500">Police, Fire & Medical</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-red-100 text-red-700 flex items-center justify-center">
            <Phone className="w-5 h-5" />
          </div>
        </a>

        <a
          href="tel:108"
          className="p-4 bg-white rounded-2xl border-2 border-amber-500 hover:bg-amber-50/50 shadow-xs transition-colors flex items-center justify-between"
        >
          <div>
            <span className="text-[10px] font-bold uppercase text-amber-700">Ambulance Service</span>
            <h4 className="text-xl font-black text-stone-900 mt-0.5">Call 108</h4>
            <p className="text-xs text-stone-500">Government Ambulance</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center">
            <Phone className="w-5 h-5" />
          </div>
        </a>

        <a
          href={`tel:${patient.doctorPhone}`}
          className="p-4 bg-white rounded-2xl border border-stone-200 hover:border-emerald-300 shadow-xs transition-colors flex items-center justify-between"
        >
          <div>
            <span className="text-[10px] font-bold uppercase text-emerald-800">Primary Doctor</span>
            <h4 className="text-sm font-bold text-stone-900 mt-0.5 truncate max-w-[140px]">
              Dr. {patient.primaryDoctorName}
            </h4>
            <p className="text-xs text-stone-500">{patient.doctorPhone}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <Phone className="w-5 h-5" />
          </div>
        </a>

        <a
          href={`tel:${patient.caregiverPhone}`}
          className="p-4 bg-white rounded-2xl border border-stone-200 hover:border-blue-300 shadow-xs transition-colors flex items-center justify-between"
        >
          <div>
            <span className="text-[10px] font-bold uppercase text-blue-800">Caregiver (Daughter)</span>
            <h4 className="text-sm font-bold text-stone-900 mt-0.5 truncate max-w-[140px]">
              {patient.caregiverName}
            </h4>
            <p className="text-xs text-stone-500">{patient.caregiverPhone}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center">
            <Phone className="w-5 h-5" />
          </div>
        </a>
      </div>

      {/* Interactive Leaflet Map with Real Facilities from Overpass API */}
      <EmergencyMap
        userLocation={userLocation}
        locationPermission={locationPermission}
        onRequestLocation={requestLocation}
      />

      {/* Emergency Event Escalation History */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs space-y-4">
        <h3 className="font-serif text-lg font-bold text-stone-900">
          Emergency Escalation Audit Trail
        </h3>

        {emergencyEvents.length === 0 ? (
          <p className="text-xs text-stone-500 py-4 text-center">No emergency escalations recorded.</p>
        ) : (
          <div className="space-y-3">
            {emergencyEvents.map((ev) => (
              <div
                key={ev.id}
                className="p-4 rounded-2xl border border-stone-200 bg-stone-50/50 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-3 h-3 rounded-full ${
                        ev.status === 'resolved' ? 'bg-emerald-500' : 'bg-red-500 animate-ping'
                      }`}
                    />
                    <span className="font-bold text-sm text-stone-900">{ev.classification}</span>
                    <span className="text-[10px] font-mono text-stone-400">({ev.id})</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full uppercase ${
                        ev.status === 'resolved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {ev.status}
                    </span>
                    <span className="text-xs text-stone-500 font-mono">{ev.timestamp}</span>
                  </div>
                </div>

                <p className="text-xs text-stone-700">{ev.message}</p>

                {ev.resolutionNotes && (
                  <p className="text-xs text-emerald-900 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                    <strong>Resolution Sign-off:</strong> {ev.resolutionNotes} (Resolved at {ev.resolvedAt})
                  </p>
                )}

                {/* Real channel delivery audit */}
                <div className="pt-2 border-t border-stone-200/80 flex flex-wrap gap-2 text-[11px]">
                  {ev.channelStatuses.map((ch, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-stone-200 rounded-lg text-stone-600"
                    >
                      <strong>{ch.channel}:</strong> {ch.status}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
