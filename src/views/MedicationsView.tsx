import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Medication } from '../types';
import {
  Pill,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Bell,
  RefreshCw,
  ShoppingBag,
  Truck,
  ShieldCheck,
  Plus,
  Info,
} from 'lucide-react';

export const MedicationsView: React.FC = () => {
  const {
    medications,
    markMedicationStatus,
    medicationOrders,
    requestMedicationRefill,
    approveMedicationOrder,
    role,
    isElderlyMode,
  } = useApp();

  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(() => {
    return 'Notification' in window ? Notification.permission : 'default';
  });

  const [alarmFeedback, setAlarmFeedback] = useState<string | null>(null);

  const requestNotificationAccess = async () => {
    if ('Notification' in window) {
      const perm = await Notification.requestPermission();
      setNotificationPermission(perm);
      if (perm === 'granted') {
        new Notification('Elderly Medication Alarm', {
          body: 'Browser pill notifications are now active for Ramesh Sharma.',
          icon: '/favicon.ico',
        });
        setAlarmFeedback('Browser notification granted & test chime sent.');
        setTimeout(() => setAlarmFeedback(null), 4000);
      }
    }
  };

  const triggerTestAlarm = (med: Medication, slot: string) => {
    if (notificationPermission === 'granted') {
      new Notification(`Medication Reminder: ${med.name}`, {
        body: `Time for your ${slot} dose (${med.dosage}). Instructions: ${med.instructions}`,
      });
    }
    setAlarmFeedback(`Reminder chime triggered for ${med.name} (${slot}).`);
    setTimeout(() => setAlarmFeedback(null), 4000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
              <Pill className="w-5 h-5" />
            </span>
            <h2 className="font-serif text-2xl font-bold text-stone-900">
              Medications, Alarms & Restock Tracking
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Prescribed schedule, accessible alarm reminders, and verified pharmacy refill orders
          </p>
        </div>

        {/* Browser Alarm Notification Permission Button */}
        <div>
          {notificationPermission === 'granted' ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold">
              <Bell className="w-3.5 h-3.5" /> Notifications Enabled
            </span>
          ) : (
            <button
              onClick={requestNotificationAccess}
              className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Enable Browser Pill Alarms</span>
            </button>
          )}
        </div>
      </div>

      {alarmFeedback && (
        <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-2xl text-xs font-semibold animate-in fade-in">
          {alarmFeedback}
        </div>
      )}

      {/* Honest Architecture Disclosure Box */}
      <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 text-xs text-stone-600 flex items-start gap-3">
        <Info className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-stone-800">Honest Limitation & Scheduled Infrastructure Architecture:</p>
          <p className="mt-0.5 leading-relaxed">
            In-browser Web Notifications function when your browser tab is open. For round-the-clock reminders when your phone or PC is asleep, Elderly connects to a Supabase Edge Function with pg_cron scheduler dispatching Twilio SMS and WhatsApp Cloud API templates to the patient and family.
          </p>
        </div>
      </div>

      {/* Daily Medication Cards */}
      <div className="space-y-4">
        <h3 className="font-serif text-lg font-bold text-stone-900">Today's Prescribed Regimen</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {medications.map((med) => {
            const isLowStock = med.remainingQuantity <= med.refillThreshold;

            return (
              <div
                key={med.id}
                className={`bg-white rounded-3xl border p-6 shadow-xs transition-all space-y-4 ${
                  isLowStock ? 'border-amber-300 bg-amber-50/20' : 'border-stone-200'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-serif font-bold text-base text-stone-900">{med.name}</h4>
                      <span className="text-xs font-bold bg-stone-100 text-stone-700 px-2 py-0.5 rounded">
                        {med.dosage}
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 mt-0.5 font-medium">{med.schedule}</p>
                  </div>

                  {/* Stock Badge */}
                  <div className="text-right">
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        isLowStock
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-stone-100 text-stone-700'
                      }`}
                    >
                      {med.remainingQuantity} left
                    </span>
                    {isLowStock && (
                      <p className="text-[10px] text-amber-700 font-bold mt-1">Refill threshold reached</p>
                    )}
                  </div>
                </div>

                <div className="p-3 bg-stone-50 rounded-xl text-xs text-stone-600">
                  <p>
                    <strong>Instructions:</strong> {med.instructions}
                  </p>
                  <p className="text-stone-400 text-[10px] mt-0.5">Prescribed by {med.prescribedBy}</p>
                </div>

                {/* Dose Times & Action Buttons */}
                <div className="space-y-2 pt-2 border-t border-stone-100">
                  {med.times.map((slot) => {
                    const status = med.todayStatus[slot] || 'pending';

                    return (
                      <div
                        key={slot}
                        className="p-3 rounded-2xl bg-stone-50/80 border border-stone-200/80 flex flex-wrap items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-emerald-800" />
                          <span className="font-bold text-xs text-stone-800">{slot} Dose</span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                              status === 'taken'
                                ? 'bg-emerald-100 text-emerald-800'
                                : status === 'snoozed'
                                ? 'bg-blue-100 text-blue-800'
                                : status === 'missed'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {status}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => triggerTestAlarm(med, slot)}
                            className="p-1.5 text-stone-500 hover:text-stone-800 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
                            title="Test alarm chime"
                          >
                            <Bell className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => markMedicationStatus(med.id, slot, 'taken')}
                            className={`font-bold rounded-xl text-xs transition-colors cursor-pointer ${
                              status === 'taken'
                                ? 'bg-emerald-700 text-white px-3 py-1.5'
                                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300 px-3 py-1.5'
                            }`}
                          >
                            Taken
                          </button>

                          <button
                            onClick={() => markMedicationStatus(med.id, slot, 'snoozed')}
                            className="px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                          >
                            Snooze
                          </button>

                          <button
                            onClick={() => markMedicationStatus(med.id, slot, 'missed')}
                            className="px-2.5 py-1.5 bg-stone-100 hover:bg-red-50 text-stone-600 hover:text-red-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                          >
                            Missed
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Restock action if low stock */}
                {isLowStock && (
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => requestMedicationRefill(med.id)}
                      className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Request Refill (Send to Caregiver)</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Medication Order & Restock Tracking Pipeline */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div>
            <h3 className="font-serif text-lg font-bold text-stone-900">
              Pharmacy Restock Order Pipeline
            </h3>
            <p className="text-xs text-stone-500">
              Safety rule: Never auto-purchases. Requires explicit family caregiver approval.
            </p>
          </div>
          <span className="text-xs font-bold bg-stone-100 text-stone-700 px-3 py-1 rounded-full">
            {medicationOrders.length} Orders
          </span>
        </div>

        {medicationOrders.length === 0 ? (
          <p className="text-stone-500 text-xs py-4 text-center">No active refill requests.</p>
        ) : (
          <div className="space-y-3">
            {medicationOrders.map((order) => (
              <div
                key={order.id}
                className="p-4 rounded-2xl border border-stone-200 bg-stone-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-stone-900">{order.medicationName}</span>
                    <span className="text-[10px] font-mono text-stone-400">({order.id})</span>
                  </div>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Pharmacy: <strong>{order.pharmacyName}</strong> • Requested: {order.requestDate}
                  </p>
                  {order.approvedBy && (
                    <p className="text-xs text-emerald-800 font-semibold mt-0.5">
                      Approved by: {order.approvedBy} • {order.estimatedDelivery}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-xl uppercase ${
                      order.status === 'completed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : order.status === 'approved'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {order.status}
                  </span>

                  {order.status === 'requested' && (
                    <button
                      onClick={() => approveMedicationOrder(order.id)}
                      className="px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      Caregiver Approve
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
