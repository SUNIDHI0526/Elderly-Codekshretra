export type SupportedLanguage = 'en-IN' | 'hi-IN' | 'mr-IN' | 'gu-IN' | 'bn-IN' | 'ta-IN';

export type UserRole = 'patient' | 'caregiver' | 'doctor';

export type AgentType = 'patient_care' | 'caregiver_agent' | 'clinician_agent' | 'social_wellbeing';

export type UrgencyLevel = 'routine' | 'potentially_urgent' | 'urgent';

export interface PatientProfile {
  id: string;
  name: string;
  age: number;
  gender: string;
  bloodGroup: string;
  condition: string;
  allergies: string[];
  city: string;
  primaryDoctorName: string;
  caregiverName: string;
  caregiverPhone: string;
  doctorPhone: string;
}

export interface CarePlan {
  id: string;
  patientId: string;
  goals: string[];
  checkInSchedule: string[];
  vitalsThresholds: {
    systolicHigh: number;
    systolicLow: number;
    diastolicHigh: number;
    diastolicLow: number;
    heartRateHigh: number;
    heartRateLow: number;
  };
  escalationRules: {
    notifyCaregiverAfterMissedCheckIns: number;
    immediateEmergencyOnCardiacSymptoms: boolean;
    weeklyDoctorSummaryExport: boolean;
  };
  lastUpdated: string;
}

export interface AgentInfo {
  id: AgentType;
  name: string;
  title: string;
  roleDescription: string;
  status: 'idle' | 'running' | 'needs_attention';
  statusLabel: string;
  lastActive: string;
  inputAccess: string[];
  primaryOutput: string;
  recentActivity: AgentActivityItem[];
}

export interface AgentActivityItem {
  id: string;
  timestamp: string;
  action: string;
  detail: string;
  severity: 'normal' | 'notice' | 'warning' | 'urgent';
}

export interface ChatMessage {
  id: string;
  sender: 'patient' | 'agent' | 'system';
  text: string;
  timestamp: string;
  language: SupportedLanguage;
  urgency?: UrgencyLevel;
  entities?: {
    symptoms?: string[];
    medicines?: string[];
    sleep?: string | null;
    mood?: string;
  };
  nextQuestion?: string | null;
  eventsToLog?: string[];
  isEmergencyAlert?: boolean;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  schedule: string; // e.g. "Morning & Night after meals"
  frequency: 'Once Daily' | 'Twice Daily' | 'Thrice Daily' | 'As Needed';
  times: string[]; // ["08:00", "20:00"]
  remainingQuantity: number;
  totalPackSize: number;
  refillThreshold: number;
  instructions: string;
  prescribedBy: string;
  todayStatus: {
    [timeSlot: string]: 'pending' | 'taken' | 'snoozed' | 'missed';
  };
}

export interface MedicationOrder {
  id: string;
  medicationId: string;
  medicationName: string;
  quantity: number;
  status: 'requested' | 'approved' | 'processing' | 'completed';
  requestDate: string;
  approvedBy?: string;
  pharmacyName: string;
  estimatedDelivery?: string;
}

export interface VitalsEntry {
  id: string;
  recordedAt: string;
  systolic: number;
  diastolic: number;
  heartRate: number;
  sleepHours: number;
  sleepBedtime?: string;
  sleepWakeTime?: string;
  sleepConsistencyScore?: number; // 0-100
  activityMinutes: number;
  mood: 'Energetic' | 'Good' | 'Fair' | 'Low' | 'Distressed';
  symptoms: string[];
  notes?: string;
  dataSource: 'Patient Entered' | 'Caregiver Verified' | 'Connected Blood Pressure Cuff' | 'Calculated Estimate';
  flagged?: boolean;
  flagReason?: string;
}

export interface TimelineDayData {
  day: number;
  date: string;
  systolic: number;
  diastolic: number;
  heartRate: number;
  sleepHours: number;
  activityMinutes: number;
  moodScore: number; // 1-10
  adherenceRate: number; // 0-100%
  checkInCompleted: boolean;
  socialScore: number; // 1-10
  isBaseline: boolean;
  isFlagged: boolean;
  flagReason?: string;
  eventMarker?: string;
  isMissing?: boolean;
}

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  isPrimary: boolean;
  oneTapVerified: boolean;
}

export interface ChannelBroadcastStatus {
  channel: string;
  status: 'Delivered' | 'Sent - awaiting confirmation' | 'Prepared' | 'Prepared (One-tap ready)' | 'Not configured (Simulated in Demo Mode)' | 'Failed';
  recipient: string;
  timestamp: string;
}

export interface EmergencyEvent {
  id: string;
  timestamp: string;
  triggerSource: 'SOS Button' | 'Patient Voice Agent' | 'Vital Threshold Exceeded';
  classification: string;
  urgency: UrgencyLevel;
  patientName: string;
  message: string;
  status: 'detected' | 'prepared' | 'sent' | 'acknowledged' | 'resolved';
  location?: { lat: number; lng: number; address: string };
  channelStatuses: ChannelBroadcastStatus[];
  resolvedAt?: string;
  resolutionNotes?: string;
}

export interface CallScheduleItem {
  id: string;
  callerName: string;
  callerRole: 'Doctor' | 'Caregiver' | 'Patient';
  recipientName: string;
  recipientRole: 'Doctor' | 'Caregiver' | 'Patient';
  dateTime: string;
  purpose: string;
  callType: 'voice' | 'video';
  status: 'requested' | 'confirmed' | 'completed' | 'cancelled';
  meetingUrl?: string;
}

export interface SocialObservation {
  id: string;
  date: string;
  indicator: string;
  evidence: string;
  riskScore: number; // 0-100
  suggestedAction: string;
  status: 'suggested' | 'scheduled' | 'completed';
  caregiverNotified: boolean;
}

export interface DoctorSummary {
  patientOverview: string;
  keyChanges: string[];
  adherenceSummary: string;
  adherenceRate: number;
  reportedSymptoms: string[];
  flaggedEvents: string[];
  consultationQuestions: string[];
  clinicianNotes: string;
  isClinicianApproved: boolean;
  lastGenerated: string;
  dateRange: string;
}
