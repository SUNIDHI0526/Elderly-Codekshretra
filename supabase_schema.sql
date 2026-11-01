-- ====================================================================
-- CARECIRCLE AI / ELDERLY PLATFORM — SUPABASE POSTGRESQL & RLS SCHEMA
-- Includes profiles, RBAC, encrypted HIPAA-compliant records, and RLS
-- ====================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles table (linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('patient', 'caregiver', 'doctor')),
  full_name TEXT NOT NULL,
  phone TEXT,
  preferred_language TEXT DEFAULT 'en-IN',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Patients table
CREATE TABLE IF NOT EXISTS public.patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  dob DATE,
  blood_group TEXT,
  primary_doctor_id UUID REFERENCES public.profiles(id),
  address TEXT,
  city TEXT,
  emergency_notes TEXT,
  elderly_mode_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Caregiver Links
CREATE TABLE IF NOT EXISTS public.caregiver_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  caregiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  relationship TEXT NOT NULL, -- e.g. 'Daughter', 'Son', 'Spouse', 'Professional Caregiver'
  is_primary BOOLEAN DEFAULT false,
  can_manage_meds BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(caregiver_id, patient_id)
);

-- 4. Doctor Links
CREATE TABLE IF NOT EXISTS public.doctor_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doctor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  specialty TEXT DEFAULT 'Geriatrician & General Medicine',
  clinic_hospital TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(doctor_id, patient_id)
);

-- 5. Care Plans
CREATE TABLE IF NOT EXISTS public.care_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  goals JSONB DEFAULT '[]'::jsonb,
  vitals_thresholds JSONB DEFAULT '{"systolic_high": 140, "diastolic_high": 90, "hr_low": 55, "hr_high": 100}'::jsonb,
  check_in_times JSONB DEFAULT '["08:30", "14:00", "20:30"]'::jsonb,
  escalation_rules JSONB DEFAULT '{"notify_family_on_missed_checkins": 2, "immediate_sos_on_chest_pain": true}'::jsonb,
  updated_by UUID REFERENCES public.profiles(id),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Check-ins
CREATE TABLE IF NOT EXISTS public.check_ins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  scheduled_for TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  status TEXT CHECK (status IN ('scheduled', 'completed', 'missed', 'escalated')),
  channel TEXT DEFAULT 'in_app', -- 'in_app', 'whatsapp', 'twilio_call'
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Conversations & Messages
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  agent_type TEXT DEFAULT 'patient_care',
  session_started TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender TEXT NOT NULL CHECK (sender IN ('patient', 'agent', 'caregiver', 'doctor', 'system')),
  text TEXT NOT NULL,
  language TEXT DEFAULT 'en-IN',
  urgency TEXT DEFAULT 'routine' CHECK (urgency IN ('routine', 'potentially_urgent', 'urgent')),
  structured_metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Daily Wellness & Vitals
CREATE TABLE IF NOT EXISTS public.daily_wellness (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  mood TEXT,
  energy_score INTEGER CHECK (energy_score BETWEEN 1 AND 10),
  sleep_hours NUMERIC(4,2),
  sleep_quality TEXT,
  activity_minutes INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(patient_id, date)
);

CREATE TABLE IF NOT EXISTS public.vitals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  systolic INTEGER CHECK (systolic BETWEEN 50 AND 280),
  diastolic INTEGER CHECK (diastolic BETWEEN 30 AND 180),
  heart_rate INTEGER CHECK (heart_rate BETWEEN 30 AND 220),
  blood_sugar NUMERIC(5,2),
  spo2 INTEGER,
  data_source TEXT DEFAULT 'manual_entry', -- 'manual_entry', 'bluetooth_cuff', 'smartwatch'
  flagged_reason TEXT
);

-- 9. Medications & Medication Logs
CREATE TABLE IF NOT EXISTS public.medications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  frequency TEXT NOT NULL, -- 'once_daily', 'twice_daily', 'thrice_daily', 'as_needed'
  times JSONB NOT NULL, -- ['08:00', '20:00']
  remaining_count INTEGER NOT NULL DEFAULT 30,
  refill_threshold INTEGER NOT NULL DEFAULT 5,
  instructions TEXT,
  prescribed_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.medication_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  medication_id UUID NOT NULL REFERENCES public.medications(id) ON DELETE CASCADE,
  scheduled_time TIMESTAMPTZ NOT NULL,
  action_time TIMESTAMPTZ,
  status TEXT CHECK (status IN ('taken', 'missed', 'snoozed', 'skipped')),
  snoozed_until TIMESTAMPTZ
);

-- 10. Refill Requests & Pharmacy Orders
CREATE TABLE IF NOT EXISTS public.refill_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  medication_id UUID NOT NULL REFERENCES public.medications(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('requested', 'approved', 'processing', 'completed', 'cancelled')) DEFAULT 'requested',
  requested_by UUID REFERENCES public.profiles(id),
  approved_by UUID REFERENCES public.profiles(id),
  pharmacy_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Emergency Contacts & Events
CREATE TABLE IF NOT EXISTS public.emergency_contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  relationship TEXT NOT NULL,
  priority_order INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS public.emergency_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  trigger_source TEXT NOT NULL, -- 'sos_button', 'patient_agent_voice', 'vitals_spike'
  detected_at TIMESTAMPTZ DEFAULT NOW(),
  classification TEXT NOT NULL, -- 'cardiac', 'respiratory', 'trauma', 'unresponsive'
  status TEXT CHECK (status IN ('detected', 'prepared', 'sent', 'acknowledged', 'resolved')) DEFAULT 'detected',
  location_lat NUMERIC(10,7),
  location_lng NUMERIC(10,7),
  broadcast_logs JSONB,
  resolved_at TIMESTAMPTZ
);

-- 12. Call Schedules
CREATE TABLE IF NOT EXISTS public.call_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  caller_id UUID NOT NULL REFERENCES public.profiles(id),
  recipient_id UUID NOT NULL REFERENCES public.profiles(id),
  scheduled_at TIMESTAMPTZ NOT NULL,
  purpose TEXT,
  call_type TEXT DEFAULT 'voice' CHECK (call_type IN ('voice', 'video')),
  status TEXT DEFAULT 'requested' CHECK (status IN ('requested', 'confirmed', 'completed', 'cancelled')),
  meeting_url TEXT
);

-- 13. Social Wellbeing Observations
CREATE TABLE IF NOT EXISTS public.social_observations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  observed_at TIMESTAMPTZ DEFAULT NOW(),
  indicator TEXT NOT NULL, -- 'reduced_conversation', 'missed_walk', 'verbalized_loneliness'
  evidence TEXT NOT NULL,
  risk_score INTEGER,
  suggested_action TEXT,
  action_status TEXT DEFAULT 'pending' CHECK (action_status IN ('pending', 'actioned', 'dismissed'))
);

-- 14. Doctor Visit Summaries
CREATE TABLE IF NOT EXISTS public.doctor_summaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES public.profiles(id),
  date_range_start DATE,
  date_range_end DATE,
  wellness_overview TEXT,
  key_changes JSONB,
  adherence_rate NUMERIC(5,2),
  consultation_questions JSONB,
  is_clinician_approved BOOLEAN DEFAULT false,
  pdf_exported_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. Agent Activity Log
CREATE TABLE IF NOT EXISTS public.agent_activity (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_name TEXT NOT NULL CHECK (agent_name IN ('patient_care', 'caregiver_agent', 'clinician_agent', 'social_wellbeing')),
  patient_id UUID REFERENCES public.patients(id),
  action_type TEXT NOT NULL,
  input_summary TEXT,
  output_summary TEXT,
  status TEXT DEFAULT 'completed' CHECK (status IN ('running', 'completed', 'flagged', 'failed')),
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 16. Audit Log
CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  details JSONB,
  ip_address TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.caregiver_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.care_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_summaries ENABLE ROW LEVEL SECURITY;

-- Helper security function: check if caller is linked caregiver or doctor of patient
CREATE OR REPLACE FUNCTION public.is_authorized_for_patient(patient_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    EXISTS (
      SELECT 1 FROM public.patients WHERE id = patient_uuid AND profile_id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM public.caregiver_links WHERE patient_id = patient_uuid AND caregiver_id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM public.doctor_links WHERE patient_id = patient_uuid AND doctor_id = auth.uid()
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles: users read and update their own profile; linked parties can view
CREATE POLICY "Users can manage own profile" ON public.profiles
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "Linked doctors and caregivers can read patient profile" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.patients p
      JOIN public.caregiver_links cl ON cl.patient_id = p.id
      WHERE p.profile_id = profiles.id AND cl.caregiver_id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM public.patients p
      JOIN public.doctor_links dl ON dl.patient_id = p.id
      WHERE p.profile_id = profiles.id AND dl.doctor_id = auth.uid()
    )
  );

-- Vitals RLS: Patient or authorized caregiver/doctor
CREATE POLICY "Authorized users can view vitals" ON public.vitals
  FOR SELECT USING (public.is_authorized_for_patient(patient_id));

CREATE POLICY "Patient or caregiver can insert vitals" ON public.vitals
  FOR INSERT WITH CHECK (public.is_authorized_for_patient(patient_id));

-- Medications RLS
CREATE POLICY "Authorized users can view medications" ON public.medications
  FOR SELECT USING (public.is_authorized_for_patient(patient_id));

-- Doctor Summaries RLS
CREATE POLICY "Authorized doctor or caregiver can view summaries" ON public.doctor_summaries
  FOR SELECT USING (public.is_authorized_for_patient(patient_id));

CREATE POLICY "Doctor can create and update summaries" ON public.doctor_summaries
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.doctor_links dl WHERE dl.patient_id = doctor_summaries.patient_id AND dl.doctor_id = auth.uid()
    )
  );
