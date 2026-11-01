import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  SupportedLanguage,
  UserRole,
  AgentType,
  AgentInfo,
  PatientProfile,
  CarePlan,
  ChatMessage,
  Medication,
  MedicationOrder,
  VitalsEntry,
  TimelineDayData,
  EmergencyContact,
  EmergencyEvent,
  CallScheduleItem,
  SocialObservation,
  DoctorSummary,
  ChannelBroadcastStatus,
} from '../types';
import { generate30DayTimelineData } from '../services/timelineData';
import { runDeterministicSafetyCheck } from '../services/safetyRules';
import { emergencyAudio } from '../services/emergencyAudio';
import { TRANSLATIONS } from '../i18n/translations';

interface AppContextType {
  role: UserRole;
  setRole: (r: UserRole) => void;
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  isElderlyMode: boolean;
  setIsElderlyMode: (enabled: boolean) => void;
  theme: 'light' | 'dark';
  setTheme: (t: 'light' | 'dark') => void;
  patient: PatientProfile;
  carePlan: CarePlan;
  agents: Record<AgentType, AgentInfo>;
  messages: ChatMessage[];
  timelineData: TimelineDayData[];
  medications: Medication[];
  medicationOrders: MedicationOrder[];
  vitalsHistory: VitalsEntry[];
  emergencyContacts: EmergencyContact[];
  emergencyEvents: EmergencyEvent[];
  callSchedules: CallScheduleItem[];
  socialObservations: SocialObservation[];
  doctorSummary: DoctorSummary;
  locationPermission: 'granted' | 'denied' | 'prompt';
  userLocation: { lat: number; lng: number } | null;
  requestLocation: () => void;
  isAiThinking: boolean;
  activeEmergencyModal: EmergencyEvent | null;
  setActiveEmergencyModal: (ev: EmergencyEvent | null) => void;
  
  // Actions
  sendMessage: (text: string) => Promise<ChatMessage>;
  clearConversationMemory: () => void;
  triggerEmergencySOS: (source?: string, notes?: string) => Promise<EmergencyEvent>;
  resolveEmergencyEvent: (id: string, notes: string) => void;
  markMedicationStatus: (medId: string, slot: string, status: 'taken' | 'snoozed' | 'missed') => void;
  requestMedicationRefill: (medId: string) => void;
  approveMedicationOrder: (orderId: string) => void;
  recordNewVitals: (entry: Omit<VitalsEntry, 'id' | 'recordedAt'>) => void;
  scheduleNewCall: (call: Omit<CallScheduleItem, 'id' | 'status'>) => void;
  updateDoctorSummary: (partial: Partial<DoctorSummary>) => void;
  speakText: (text: string, targetLang?: SupportedLanguage) => void;
  t: (key: keyof typeof TRANSLATIONS['en-IN']) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Initial Mock Patient
const INITIAL_PATIENT: PatientProfile = {
  id: 'pt-101',
  name: 'Ramesh Sharma',
  age: 73,
  gender: 'Male',
  bloodGroup: 'B Positive',
  condition: 'Essential Hypertension, Stage 2 & Mild Osteoarthritis',
  allergies: ['Penicillin (mild rash)', 'Sulfa drugs'],
  city: 'Nagpur, Maharashtra',
  primaryDoctorName: 'A. K. Mehta (MD Geriatrics)',
  caregiverName: 'Pooja Sharma (Daughter)',
  caregiverPhone: '+91 98230 45678',
  doctorPhone: '+91 712 2568900',
};

// Initial Mock Care Plan
const INITIAL_CARE_PLAN: CarePlan = {
  id: 'cp-201',
  patientId: 'pt-101',
  goals: [
    'Maintain sitting systolic BP below 135 mmHg',
    'Achieve 7.0+ hours of undisturbed night sleep',
    'Daily 25-minute morning garden stroll before 8:30 AM',
    'Zero missed doses for morning antihypertensives',
  ],
  checkInSchedule: ['08:30 Morning Check-in', '14:00 Post-Lunch Wellness', '20:30 Night Routine'],
  vitalsThresholds: {
    systolicHigh: 140,
    systolicLow: 100,
    diastolicHigh: 90,
    diastolicLow: 60,
    heartRateHigh: 95,
    heartRateLow: 55,
  },
  escalationRules: {
    notifyCaregiverAfterMissedCheckIns: 2,
    immediateEmergencyOnCardiacSymptoms: true,
    weeklyDoctorSummaryExport: true,
  },
  lastUpdated: '2026-10-28',
};

// Initial Agents
const INITIAL_AGENTS: Record<AgentType, AgentInfo> = {
  patient_care: {
    id: 'patient_care',
    name: 'Patient Care Companion',
    title: 'Daily Health & Wellness Voice Agent',
    roleDescription: 'Conducts morning & evening wellness check-ins, tracks medication adherence, monitors reported symptoms, and evaluates real-time clinical urgency.',
    status: 'idle',
    statusLabel: 'Standing by for conversation',
    lastActive: 'Just now',
    inputAccess: ['Voice input', 'Prescribed medication schedule', '30-day vitals trends', 'Language preferences'],
    primaryOutput: 'Context-aware empathetic voice & text replies, structured wellness logs, automated emergency escalations',
    recentActivity: [
      { id: 'act-1', timestamp: '08:30 AM', action: 'Morning Check-in', detail: 'Collected sleep duration (6.8h) and verified morning Amlodipine intake.', severity: 'normal' },
      { id: 'act-2', timestamp: 'Yesterday', action: 'Urgency Evaluation', detail: 'Filtered inquiry about knee soreness; categorized as routine arthritic check.', severity: 'normal' },
    ],
  },
  caregiver_agent: {
    id: 'caregiver_agent',
    name: 'Caregiver Agent',
    title: 'Family Sync & Missed Check-in Monitor',
    roleDescription: 'Alerts family caregivers on missed check-ins, coordinates doctor call appointments, summarizes daily vitals, and flags medication refill requirements.',
    status: 'idle',
    statusLabel: 'Family coordination active',
    lastActive: '12 mins ago',
    inputAccess: ['Patient check-in completion states', 'Pharmacy inventory', 'Caregiver phone notifications'],
    primaryOutput: 'Caregiver SMS/Push alerts, weekly family briefings, restock authorization requests',
    recentActivity: [
      { id: 'act-3', timestamp: '12 mins ago', action: 'Inventory Check', detail: 'Noticed Amlodipine 5mg reached 4 tablets remaining; prompted restock flow.', severity: 'notice' },
      { id: 'act-4', timestamp: '2 days ago', action: 'Check-in Monitor', detail: 'Observed delayed 20:30 check-in; sent gentle nudge before escalation.', severity: 'normal' },
    ],
  },
  clinician_agent: {
    id: 'clinician_agent',
    name: 'Clinician Agent',
    title: 'Doctor-Ready Clinical Synthesizer',
    roleDescription: 'Synthesizes 30-day vitals, drift against baseline, medication compliance, and generates printable/downloadable A4 clinical visit reports.',
    status: 'idle',
    statusLabel: 'Report ready for clinician review',
    lastActive: '1 hour ago',
    inputAccess: ['30-day vitals records', 'Medication logs', 'Escalation history', 'Physician consultation questions'],
    primaryOutput: 'Doctor Visit Summary, vector PDF downloads, A4 print stylesheets, flagged physiological anomalies',
    recentActivity: [
      { id: 'act-5', timestamp: '1 hour ago', action: 'Trend Synthesis', detail: 'Compiled 30-day physiological drift report: systolic +16 mmHg above baseline.', severity: 'warning' },
      { id: 'act-6', timestamp: 'Oct 28', action: 'PDF Generated', detail: 'Generated clinical visit report for Dr. A. K. Mehta.', severity: 'normal' },
    ],
  },
  social_wellbeing: {
    id: 'social_wellbeing',
    name: 'Social Wellbeing Agent',
    title: 'Loneliness & Community Engagement Guardian',
    roleDescription: 'Detects multi-day patterns of social isolation, dropped participation in routine activities, and coordinates warm family calls and community activities.',
    status: 'needs_attention',
    statusLabel: 'Loneliness indicator flagged (68/100)',
    lastActive: '3 hours ago',
    inputAccess: ['Daily conversation sentiment', 'Social activity logs', 'Family call frequencies'],
    primaryOutput: 'Social isolation risk index, family video call suggestions, community engagement tracking',
    recentActivity: [
      { id: 'act-7', timestamp: '3 hours ago', action: 'Pattern Detected', detail: 'Flagged 4 consecutive afternoons spent alone without usual society garden stroll.', severity: 'warning' },
      { id: 'act-8', timestamp: 'Yesterday', action: 'Call Recommendation', detail: 'Suggested a weekend family video call with granddaughter Ananya.', severity: 'notice' },
    ],
  },
};

// Initial Medications
const INITIAL_MEDICATIONS: Medication[] = [
  {
    id: 'med-1',
    name: 'Amlodipine Besylate',
    dosage: '5 mg',
    schedule: 'Morning after breakfast',
    frequency: 'Once Daily',
    times: ['08:30'],
    remainingQuantity: 4, // Low stock trigger
    totalPackSize: 30,
    refillThreshold: 7,
    instructions: 'Take with warm water. Do not skip if feeling dizzy on standing.',
    prescribedBy: 'Dr. A. K. Mehta',
    todayStatus: { '08:30': 'taken' },
  },
  {
    id: 'med-2',
    name: 'Metformin Hydrochloride (Glycomet)',
    dosage: '500 mg',
    schedule: 'Twice daily after meals',
    frequency: 'Twice Daily',
    times: ['08:30', '20:30'],
    remainingQuantity: 24,
    totalPackSize: 60,
    refillThreshold: 10,
    instructions: 'Take immediately after food to avoid gastric irritation.',
    prescribedBy: 'Dr. A. K. Mehta',
    todayStatus: { '08:30': 'taken', '20:30': 'pending' },
  },
  {
    id: 'med-3',
    name: 'Atorvastatin (Atorva)',
    dosage: '10 mg',
    schedule: 'Night before bedtime',
    frequency: 'Once Daily',
    times: ['21:30'],
    remainingQuantity: 18,
    totalPackSize: 30,
    refillThreshold: 5,
    instructions: 'Take at bed time with water.',
    prescribedBy: 'Dr. A. K. Mehta',
    todayStatus: { '21:30': 'pending' },
  },
  {
    id: 'med-4',
    name: 'Glucosamine & Chondroitin',
    dosage: '500 mg',
    schedule: 'After lunch for joint health',
    frequency: 'Once Daily',
    times: ['13:30'],
    remainingQuantity: 14,
    totalPackSize: 30,
    refillThreshold: 5,
    instructions: 'Helps with knee mobility.',
    prescribedBy: 'Dr. A. K. Mehta',
    todayStatus: { '13:30': 'taken' },
  },
];

// Initial Medication Orders
const INITIAL_ORDERS: MedicationOrder[] = [
  {
    id: 'ord-101',
    medicationId: 'med-1',
    medicationName: 'Amlodipine Besylate 5 mg (30 Tablets)',
    quantity: 1,
    status: 'approved',
    requestDate: '2026-10-30',
    approvedBy: 'Pooja Sharma (Caregiver)',
    pharmacyName: 'Apollo Pharmacy & Express Delivery',
    estimatedDelivery: 'Tomorrow, by 11:00 AM',
  },
];

// Initial Emergency Contacts
const INITIAL_CONTACTS: EmergencyContact[] = [
  { id: 'ec-1', name: 'Pooja Sharma (Daughter)', relationship: 'Primary Caregiver', phone: '+919823045678', isPrimary: true, oneTapVerified: true },
  { id: 'ec-2', name: 'Dr. A. K. Mehta', relationship: 'Treating Physician', phone: '+917122568900', isPrimary: false, oneTapVerified: true },
  { id: 'ec-3', name: 'National Medical Ambulance', relationship: 'Emergency Response', phone: '108', isPrimary: false, oneTapVerified: true },
  { id: 'ec-4', name: 'National Emergency Helpline', relationship: 'Disaster / Police / Medical', phone: '112', isPrimary: false, oneTapVerified: true },
];

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>('patient');
  const [language, setLanguage] = useState<SupportedLanguage>('en-IN');
  const [isElderlyMode, setIsElderlyModeState] = useState<boolean>(() => {
    return localStorage.getItem('carecircle_elderly_mode') !== 'false';
  });
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const [patient] = useState<PatientProfile>(INITIAL_PATIENT);
  const [carePlan] = useState<CarePlan>(INITIAL_CARE_PLAN);
  const [agents, setAgents] = useState<Record<AgentType, AgentInfo>>(INITIAL_AGENTS);
  const [timelineData] = useState<TimelineDayData[]>(() => generate30DayTimelineData());
  const [medications, setMedications] = useState<Medication[]>(INITIAL_MEDICATIONS);
  const [medicationOrders, setMedicationOrders] = useState<MedicationOrder[]>(INITIAL_ORDERS);
  const [emergencyContacts] = useState<EmergencyContact[]>(INITIAL_CONTACTS);

  const [emergencyEvents, setEmergencyEvents] = useState<EmergencyEvent[]>([
    {
      id: 'emg-prev-1',
      timestamp: 'Day 27 (3 days ago, 04:15 PM)',
      triggerSource: 'SOS Button',
      classification: 'Acute Systolic Spike (148/94 mmHg) & Severe Dizziness',
      urgency: 'urgent',
      patientName: 'Ramesh Sharma',
      message: 'Patient activated emergency SOS due to severe dizziness and sudden headache.',
      status: 'resolved',
      location: { lat: 21.1458, lng: 79.0882, address: 'Civil Lines, Nagpur, MH' },
      channelStatuses: [
        { channel: 'In-App Alert', status: 'Delivered', recipient: 'Caregiver Portal', timestamp: '04:15 PM' },
        { channel: 'Emergency Hotline (108)', status: 'Prepared', recipient: 'Ambulance Dispatch', timestamp: '04:15 PM' },
        { channel: 'SMS Alert', status: 'Sent - awaiting confirmation', recipient: '+91 98230 45678', timestamp: '04:16 PM' },
      ],
      resolvedAt: '05:30 PM',
      resolutionNotes: 'Family arrived, doctor tele-consulted, patient stabilized with extra hydration and rest.',
    },
  ]);

  const [activeEmergencyModal, setActiveEmergencyModal] = useState<EmergencyEvent | null>(null);

  const [callSchedules, setCallSchedules] = useState<CallScheduleItem[]>([
    {
      id: 'call-1',
      callerName: 'Dr. A. K. Mehta',
      callerRole: 'Doctor',
      recipientName: 'Ramesh Sharma & Pooja Sharma',
      recipientRole: 'Patient',
      dateTime: 'Tomorrow at 05:30 PM',
      purpose: 'Review of 30-day BP escalation and Amlodipine dosage adjustment',
      callType: 'video',
      status: 'confirmed',
      meetingUrl: 'https://meet.carecircle.ai/room/dr-mehta-ramesh',
    },
    {
      id: 'call-2',
      callerName: 'Pooja Sharma',
      callerRole: 'Caregiver',
      recipientName: 'Ramesh Sharma',
      recipientRole: 'Patient',
      dateTime: 'Today at 07:00 PM',
      purpose: 'Evening family check-in & reminder for dinner medicine',
      callType: 'voice',
      status: 'requested',
    },
  ]);

  const [socialObservations] = useState<SocialObservation[]>([
    {
      id: 'soc-1',
      date: 'Day 28',
      indicator: 'Reduced Afternoon Interactions',
      evidence: 'Patient stayed indoors for 4 consecutive afternoons instead of visiting neighborhood garden.',
      riskScore: 68,
      suggestedAction: 'Organize a weekend video call with granddaughter Ananya and invite Mr. Joshi for tea.',
      status: 'suggested',
      caregiverNotified: true,
    },
    {
      id: 'soc-2',
      date: 'Day 22',
      indicator: 'Mentioned missing old colleagues',
      evidence: 'Expressed feeling lonely in conversation with AI care companion.',
      riskScore: 55,
      suggestedAction: 'Encourage attendance at Thursday Senior Citizens Club meeting.',
      status: 'completed',
      caregiverNotified: true,
    },
  ]);

  const [doctorSummary, setDoctorSummary] = useState<DoctorSummary>({
    patientOverview:
      'Patient exhibits significant physiological drift over the final 10 days of the 30-day observation window, characterized by rising systolic BP (peaking at 148 mmHg on Day 27), accompanied by fragmented sleep (mean 5.2 hrs/night) and missed morning medication doses.',
    keyChanges: [
      'Systolic BP drifted +16 mmHg above the stable 122 mmHg baseline.',
      'Nightly sleep duration decreased from 7.4 hrs to 5.2 hrs with late night restlessness.',
      'Average daily walking steps decreased by 35% compared to week 1.',
      'Two missed doses of morning Amlodipine correlated directly with systolic spikes.',
    ],
    adherenceSummary: 'Overall adherence rate is 88%. Two morning doses missed on Day 23 and Day 27.',
    adherenceRate: 88,
    reportedSymptoms: [
      'Episodes of sudden postural dizziness when getting out of bed',
      'Mild bilateral ankle puffiness reported on Day 25',
      'Feelings of restlessness around 3:00 AM',
    ],
    flaggedEvents: [
      'Day 27: Systolic spike to 148/94 mmHg triggering Emergency SOS notification.',
      'Day 23: Missed 08:30 AM check-in, resolved after caregiver SMS ping.',
    ],
    consultationQuestions: [
      'Have you felt dizzy or unsteady when standing up from your armchair?',
      'Are you taking your blood pressure tablets with or right after your breakfast?',
      'How many times do you wake up during the night to use the washroom?',
      'Have you noticed any swelling or tightness around your socks or ankles in the evening?',
    ],
    clinicianNotes:
      'Consider titrating Amlodipine from 5mg to 7.5mg or adding Telmisartan 20mg if systolic remains >135 mmHg for 3 consecutive days. Urge daily sodium restriction.',
    isClinicianApproved: false,
    lastGenerated: new Date().toLocaleDateString(),
    dateRange: 'Past 30 Days (Oct 1 – Oct 31, 2026)',
  });

  const [vitalsHistory, setVitalsHistory] = useState<VitalsEntry[]>([
    {
      id: 'vit-today',
      recordedAt: 'Today, 08:30 AM',
      systolic: 128,
      diastolic: 82,
      heartRate: 75,
      sleepHours: 6.8,
      sleepBedtime: '10:45 PM',
      sleepWakeTime: '05:35 AM',
      sleepConsistencyScore: 82,
      activityMinutes: 25,
      mood: 'Good',
      symptoms: ['Mild knee stiffness'],
      notes: 'Slept better after chamomile tea; morning BP stabilizing nicely.',
      dataSource: 'Connected Blood Pressure Cuff',
      flagged: false,
    },
    {
      id: 'vit-day27',
      recordedAt: 'Day 27, 04:15 PM',
      systolic: 148,
      diastolic: 94,
      heartRate: 92,
      sleepHours: 4.2,
      activityMinutes: 10,
      mood: 'Distressed',
      symptoms: ['Severe dizziness', 'Headache', 'Fast heartbeat'],
      notes: 'Emergency SOS activated. Caregiver notified.',
      dataSource: 'Patient Entered',
      flagged: true,
      flagReason: 'Systolic exceeded threshold (148 > 140 mmHg)',
    },
  ]);

  // Initial Chat Messages in patient's selected language
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'agent',
      text: 'Good morning, Ramesh ji. I hope you had a restful night. Have you taken your morning Amlodipine tablet with breakfast?',
      timestamp: '08:30 AM',
      language: 'en-IN',
      urgency: 'routine',
      nextQuestion: 'Did you get 7 hours of sleep last night?',
    },
  ]);

  const [isAiThinking, setIsAiThinking] = useState(false);
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  const setIsElderlyMode = (val: boolean) => {
    setIsElderlyModeState(val);
    localStorage.setItem('carecircle_elderly_mode', String(val));
  };

  const t = (key: keyof typeof TRANSLATIONS['en-IN']): string => {
    const dict = TRANSLATIONS[language] || TRANSLATIONS['en-IN'];
    return dict[key] || TRANSLATIONS['en-IN'][key] || String(key);
  };

  // Request browser GPS location
  const requestLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setLocationPermission('granted');
        },
        (err) => {
          console.warn('Geolocation denied or error:', err.message);
          setLocationPermission('denied');
          // Default to Nagpur city center for realistic demonstration
          setUserLocation({ lat: 21.1458, lng: 79.0882 });
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      setLocationPermission('denied');
    }
  };

  // Text to speech with language fallback awareness
  const speakText = (text: string, targetLang: SupportedLanguage = language) => {
    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = isElderlyMode ? 0.85 : 0.95; // Slightly slower and clearer for elderly
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const langCode = targetLang.split('-')[0]; // 'hi', 'en', 'mr', 'gu', 'bn', 'ta'

    // Try finding exact voice, else fallback to best available Indian voice
    let voice = voices.find((v) => v.lang.toLowerCase().includes(targetLang.toLowerCase()));
    if (!voice) {
      voice = voices.find((v) => v.lang.toLowerCase().startsWith(langCode));
    }
    if (!voice) {
      voice = voices.find((v) => v.lang.includes('IN') || v.name.includes('India'));
    }

    if (voice) {
      utterance.voice = voice;
    }
    utterance.lang = targetLang;

    window.speechSynthesis.speak(utterance);
  };

  // Multi-tier Patient message pipeline
  const sendMessage = async (text: string): Promise<ChatMessage> => {
    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'patient',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      language,
    };

    setMessages((prev) => [...prev, userMsg]);

    // Step 1: Deterministic Safety Rule Check Runs BEFORE Any AI Call
    const safety = runDeterministicSafetyCheck(text, language);

    // If URGENT: Immediately trigger safety flow & alert care circle, skip greeting
    if (safety.urgency === 'urgent') {
      const emergencyEvent = await triggerEmergencySOS(
        'Patient Voice / Chat Agent',
        `Critical symptom expressed: "${text}" [Rule: ${safety.category}]`
      );

      const urgentReplies: Record<SupportedLanguage, string> = {
        'en-IN': "Please take good care of yourself right now and stay seated comfortably. If you feel severe pain or acute distress, please trigger the Emergency Alert immediately or call 112/108. I am alerting your family and doctor right now. I am right here with you.",
        'hi-IN': "ठीक है, आप अपनी केयर करो और बिल्कुल घबराओ मत। अगर आपको बहुत ज्यादा कुछ फील हो रहा है या असहनीय तकलीफ है, तो तुरंत इमरजेंसी अलर्ट (SOS) करो और 112 या 108 पर कॉल करो। मैं आपके परिवार और डॉक्टर को तुरंत अलर्ट भेज रहा हूँ। शांत रहें, मैं आपके साथ हूँ।",
        'mr-IN': "शांत बसा आणि स्वतःची काळजी घ्या. जर जास्त त्रास जाणवत असेल, तर त्वरित इमर्जन्सी अलर्ट (SOS) बटण दाबा किंवा 112/108 वर संपर्क साधा. मी डॉक्टरांना आणि कुटुंबियांना आत्ताच कळवत आहे.",
        'gu-IN': "જરા પણ ગભરાશો નહીં અને પોતાની સંભાળ રાખો. જો તકલીફ વધુ જણાય તો તરત જ ઇમરજન્સી એલર્ટ (SOS) દબાવો અથવા 112/108 પર કૉલ કરો. હું તમારા પરિવારને અને ડૉક્ટરને તાત્કાલિક જાણ કરું છું.",
        'bn-IN': "শান্ত হয়ে বসুন এবং নিজের যত্ন নিন। বেশি কষ্ট বা যন্ত্রণা হলে অবিলম্বে ইমার্জেন্সি অ্যালার্ট (SOS) টিপুন বা ১১২/১০৮ নম্বরে কল করুন। আমি আপনার ডাক্তার ও পরিবারকে সতর্ক করছি।",
        'ta-IN': "அமைதியாக அமர்ந்து உங்களை கவனித்துக் கொள்ளுங்கள். வலி அதிகமாக இருந்தால் உடனே அவசர உதவி (SOS) பொத்தானை அழுத்துங்கள் அல்லது 112/108 அழைக்கவும். நான் உங்கள் மருத்துவர் மற்றும் குடும்பத்தினருக்கு தகவல் தெரிவிக்கிறேன்."
      };

      const agentReply: ChatMessage = {
        id: `agt-${Date.now()}`,
        sender: 'agent',
        text: urgentReplies[language] || urgentReplies['en-IN'],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        language,
        urgency: 'urgent',
        isEmergencyAlert: true,
        nextQuestion: null,
      };

      setMessages((prev) => [...prev, agentReply]);
      speakText(agentReply.text, language);
      setActiveEmergencyModal(emergencyEvent);
      return agentReply;
    }

    // Step 2: Call Server-Side Gemini API pipeline with patient context & history
    setIsAiThinking(true);
    try {
      const res = await fetch('/api/gemini/patient-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          language,
          conversationHistory: messages.slice(-6).map((m) => ({ sender: m.sender, text: m.text })),
          patientContext: {
            medications: medications.map((m) => `${m.name} (${m.dosage})`),
            recentBP: '128/82 mmHg',
            symptoms: ['Mild knee pain'],
            todayCheckIn: 'Morning complete',
          },
        }),
      });

      const data = await res.json();
      setIsAiThinking(false);

      // Final decision: the more severe of rules and AI
      let urgency = data.urgency || 'routine';
      if (safety.urgency === 'potentially_urgent' && urgency === 'routine') {
        urgency = 'potentially_urgent';
      }

      const agentReply: ChatMessage = {
        id: `agt-${Date.now()}`,
        sender: 'agent',
        text: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        language,
        urgency,
        entities: data.entities,
        nextQuestion: data.next_question,
        eventsToLog: data.events_to_log,
      };

      setMessages((prev) => [...prev, agentReply]);
      speakText(agentReply.text, language);

      // If potentially urgent, notify caregiver agent activity
      if (urgency === 'potentially_urgent') {
        setAgents((prev) => ({
          ...prev,
          caregiver_agent: {
            ...prev.caregiver_agent,
            recentActivity: [
              {
                id: `act-${Date.now()}`,
                timestamp: 'Just now',
                action: 'Borderline Symptom Flagged',
                detail: `Patient reported: "${text}". Monitoring for persistence.`,
                severity: 'warning',
              },
              ...prev.caregiver_agent.recentActivity,
            ],
          },
        }));
      }

      return agentReply;
    } catch (err) {
      setIsAiThinking(false);
      console.warn('Failed to call Gemini API, using contextual fallback:', err);

      let doctorText = "Please sit or lie down in a comfortable position and take gentle, calm breaths. Take good care of yourself right now. If the pain or discomfort becomes severe or unbearable, please tap the Emergency Alert (SOS) button immediately so we can notify your doctor and family.";
      let doctorFollowUp = "Are you experiencing any nausea, dizziness, or radiating pain?";

      if (language === 'hi-IN') {
        doctorText = "ठीक है, आप आराम से बैठ जाएं या लेट जाएं और खुद की अच्छी केयर करें। अगर दर्द बहुत तेज या असहनीय महसूस हो रहा है, तो तुरंत नीचे दिए गए इमरजेंसी अलर्ट (SOS) बटन को दबाएं ताकि डॉक्टर और परिवार को तुरंत सूचित किया जा सके।";
        doctorFollowUp = "क्या आपको उल्टी, चक्कर या सांस लेने में कोई परेशानी महसूस हो रही है?";
      } else if (language === 'mr-IN') {
        doctorText = "शांत बसा आणि स्वतःची काळजी घ्या. जर त्रास खूप जास्त जाणवत असेल, तर त्वरित इमर्जन्सी अलर्ट (SOS) बटण दाबा.";
        doctorFollowUp = "आपल्याला मळमळ किंवा चक्कर जाणवत आहे का?";
      } else if (language === 'gu-IN') {
        doctorText = "શાંતિથી બેસી જાઓ અને પોતાની સંભાળ રાખો. જો દુખાવો કે તકલીફ ખૂબ વધી જાય, તો તરત જ ઇમરજન્સી એલર્ટ (SOS) બટન દબાવો.";
        doctorFollowUp = "શું તમને ઊલટી કે ચક્કર જેવું લાગે છે?";
      }

      const fallbackReply: ChatMessage = {
        id: `agt-${Date.now()}`,
        sender: 'agent',
        text: doctorText,
        nextQuestion: doctorFollowUp,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        language,
        urgency: safety.urgency,
      };

      setMessages((prev) => [...prev, fallbackReply]);
      speakText(fallbackReply.text, language);
      return fallbackReply;
    }
  };

  const clearConversationMemory = () => {
    setMessages([
      {
        id: `reset-${Date.now()}`,
        sender: 'system',
        text: 'Conversation history and agent memory have been cleared per your privacy request.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        language,
        urgency: 'routine',
      },
    ]);
  };

  // Real Emergency Escalation Pipeline
  const triggerEmergencySOS = async (source = 'SOS Button', notes = 'Emergency SOS triggered'): Promise<EmergencyEvent> => {
    const lat = userLocation?.lat ?? 21.1458;
    const lng = userLocation?.lng ?? 79.0882;

    let broadcastResults: ChannelBroadcastStatus[] = [
      { channel: 'In-App Portal Notification', status: 'Delivered', recipient: 'Caregiver & Clinician Dashboard', timestamp: 'Just now' },
      { channel: 'Emergency Hotline (112/108)', status: 'Prepared (One-tap ready)', recipient: 'Emergency Ambulance', timestamp: 'Just now' },
      { channel: 'Family Caregiver SMS', status: 'Not configured (Simulated in Demo Mode)', recipient: patient.caregiverPhone, timestamp: 'Just now' },
      { channel: 'WhatsApp Family Broadcast', status: 'Not configured (Simulated in Demo Mode)', recipient: 'Care Circle Family', timestamp: 'Just now' },
    ];

    try {
      const res = await fetch('/api/emergency/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: patient.id,
          patientName: patient.name,
          emergencyType: 'Cardiac / Acute Distress',
          location: { lat, lng },
          contacts: emergencyContacts,
        }),
      });
      const data = await res.json();
      if (data.channelStatuses) {
        broadcastResults = data.channelStatuses;
      }
    } catch (e) {
      console.warn('Using local emergency broadcast execution:', e);
    }

    // Play loud Emergency Siren (Max volume, alternating warble alert)
    try {
      emergencyAudio.playEmergencySiren(25000);
    } catch (e) {
      console.warn('Audio siren start failed:', e);
    }

    const newEvent: EmergencyEvent = {
      id: `emg-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      triggerSource: source as any,
      classification: notes,
      urgency: 'urgent',
      patientName: patient.name,
      message: notes,
      status: 'sent',
      location: { lat, lng, address: patient.city },
      channelStatuses: broadcastResults,
    };

    setEmergencyEvents((prev) => [newEvent, ...prev]);
    setActiveEmergencyModal(newEvent);
    return newEvent;
  };

  const resolveEmergencyEvent = (id: string, notes: string) => {
    try {
      emergencyAudio.stopEmergencySiren();
    } catch (e) {}
    setEmergencyEvents((prev) =>
      prev.map((ev) =>
        ev.id === id ? { ...ev, status: 'resolved', resolvedAt: new Date().toLocaleTimeString(), resolutionNotes: notes } : ev
      )
    );
    if (activeEmergencyModal?.id === id) {
      setActiveEmergencyModal(null);
    }
  };

  const markMedicationStatus = (medId: string, slot: string, status: 'taken' | 'snoozed' | 'missed') => {
    setMedications((prev) =>
      prev.map((med) => {
        if (med.id === medId) {
          const updatedStatus = { ...med.todayStatus, [slot]: status };
          const newQty = status === 'taken' ? Math.max(0, med.remainingQuantity - 1) : med.remainingQuantity;
          return { ...med, todayStatus: updatedStatus, remainingQuantity: newQty };
        }
        return med;
      })
    );
  };

  const requestMedicationRefill = (medId: string) => {
    const med = medications.find((m) => m.id === medId);
    if (!med) return;

    const newOrder: MedicationOrder = {
      id: `ord-${Date.now()}`,
      medicationId: med.id,
      medicationName: `${med.name} ${med.dosage} (${med.totalPackSize} Tablets)`,
      quantity: 1,
      status: 'requested',
      requestDate: new Date().toISOString().split('T')[0],
      pharmacyName: 'Apollo 24x7 Pharmacy (Nearby)',
    };

    setMedicationOrders((prev) => [newOrder, ...prev]);
  };

  const approveMedicationOrder = (orderId: string) => {
    setMedicationOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: 'approved',
              approvedBy: `${patient.caregiverName} (Caregiver)`,
              estimatedDelivery: 'Tomorrow, by 12:00 PM',
            }
          : o
      )
    );
  };

  const recordNewVitals = (entry: Omit<VitalsEntry, 'id' | 'recordedAt'>) => {
    const isSystolicHigh = entry.systolic > 140;
    const isDiastolicHigh = entry.diastolic > 90;
    const isFlagged = isSystolicHigh || isDiastolicHigh;

    const newEntry: VitalsEntry = {
      ...entry,
      id: `vit-${Date.now()}`,
      recordedAt: 'Just now',
      flagged: isFlagged,
      flagReason: isFlagged ? `Elevated reading (${entry.systolic}/${entry.diastolic} mmHg)` : undefined,
    };

    setVitalsHistory((prev) => [newEntry, ...prev]);

    if (isFlagged) {
      setAgents((prev) => ({
        ...prev,
        clinician_agent: {
          ...prev.clinician_agent,
          status: 'needs_attention',
          recentActivity: [
            {
              id: `act-${Date.now()}`,
              timestamp: 'Just now',
              action: 'High Vital Reading Recorded',
              detail: `BP ${entry.systolic}/${entry.diastolic} mmHg recorded via ${entry.dataSource}.`,
              severity: 'warning',
            },
            ...prev.clinician_agent.recentActivity,
          ],
        },
      }));
    }
  };

  const scheduleNewCall = (call: Omit<CallScheduleItem, 'id' | 'status'>) => {
    const newCall: CallScheduleItem = {
      ...call,
      id: `call-${Date.now()}`,
      status: 'requested',
      meetingUrl: call.callType === 'video' ? `https://meet.carecircle.ai/room/call-${Date.now()}` : undefined,
    };
    setCallSchedules((prev) => [newCall, ...prev]);
  };

  const updateDoctorSummary = (partial: Partial<DoctorSummary>) => {
    setDoctorSummary((prev) => ({ ...prev, ...partial }));
  };

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        language,
        setLanguage,
        isElderlyMode,
        setIsElderlyMode,
        theme,
        setTheme,
        patient,
        carePlan,
        agents,
        messages,
        timelineData,
        medications,
        medicationOrders,
        vitalsHistory,
        emergencyContacts,
        emergencyEvents,
        callSchedules,
        socialObservations,
        doctorSummary,
        locationPermission,
        userLocation,
        requestLocation,
        isAiThinking,
        activeEmergencyModal,
        setActiveEmergencyModal,
        sendMessage,
        clearConversationMemory,
        triggerEmergencySOS,
        resolveEmergencyEvent,
        markMedicationStatus,
        requestMedicationRefill,
        approveMedicationOrder,
        recordNewVitals,
        scheduleNewCall,
        updateDoctorSummary,
        speakText,
        t,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
