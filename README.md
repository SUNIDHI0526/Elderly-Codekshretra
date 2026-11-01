<div align="center">

# 🌿 Elderly — CareCircle AI

Live website link : https://elderly-careai-3119b.web.app

### **Proactive AI agents for chronic care and healthy ageing**

![React](https://img.shields.io/badge/React-TypeScript-61DAFB?logo=react&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS-06B6D4?logo=tailwindcss&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Auth%20%7C%20DB%20%7C%20RLS-3ECF8E?logo=supabase&logoColor=white)
![Gemini](https://img.shields.io/badge/Gemini-AI-8E75B2?logo=googlegemini&logoColor=white)
![Languages](https://img.shields.io/badge/Languages-6-2F7D62)
![Status](https://img.shields.io/badge/Hackathon-HEALTH--01-E0A03A)

<!-- Add your banner: save an image as docs/banner.png -->
<img src="docs/banner.png" alt="Elderly CareCircle AI banner" width="800"/>

</div>

---

## 🩺 The Problem

India's life expectancy is about **71 years**, but healthy life expectancy is only about **60.6**. Many people spend **more than a decade** living with chronic disease or disability. **Hypertension and diabetes** make up most of the chronic illness among the elderly.

The real issue is the **gap between doctor visits**. A patient meets the doctor for a few minutes every few weeks, and in between:

- 💊 Doses are missed and **nobody notices**
- 📈 BP slowly rises, sleep and mood slowly get worse
- 😔 The patient becomes **lonely** and stops going out
- 👨‍👩‍👧 Family finds out only **after** something goes wrong

Today's care is **reactive**. Elderly makes it **proactive**.

---

## 💡 Our Idea

Elderly places a **network of four AI agents** around one elderly patient. The agents do not wait for the patient to open an app. They **reach out on their own schedule**, listen, remember, notice trends and bring in the right person at the right time.

| Agent | Serves | What it does |
|---|---|---|
| 🤖 **Patient Care Agent** | Patient | Starts **voice / WhatsApp check-ins** in the patient's own language. Asks about sleep, mood, symptoms and medicines, and adapts each next question. Remembers history across months. |
| 👨‍👩‍👧 **Caregiver Agent** | Family | Keeps relatives informed about **missed check-ins** and escalations. Helps schedule calls with the doctor or patient. |
| 🧑‍⚕️ **Clinician Agent** | Doctor | Prepares a **summary of everything between visits**, flags dangerous trends, suggests questions for the consultation. |
| 🤝 **Social Wellbeing Agent** | Patient + family | Notices **repeated** signs of loneliness and nudges a family call or community activity. |

All four share **one evolving care plan**: medicines, check-in schedule, risk flags, escalation rules and contacts.

### ✨ What makes it different from a chatbot

1. **True proactivity**: the agent decides *when* to reach out, not just how to reply
2. **Months-long memory** of one person, with controls to view and clear it
3. **Coordination** between agents that serve different people around the same patient
4. **Safe escalation**: safety rules run **before** the AI, so an alarming message never gets a cheerful greeting

---

## 🚨 Safety-First Message Pipeline

```
Patient message (text or voice)
        │
        ▼
1. Deterministic safety rules   (6 languages + Hinglish, run FIRST)
        │
        ▼
2. Gemini structured output     (urgency, intent, emotion)
        │
        ▼
3. Final urgency = the MORE SEVERE of rules and AI
        │
        ▼
4. Reply · ask one clarification · escalate → log to timeline
```

> **"I'm going to die"** → emergency guidance, one-tap emergency call and verified contacts. **Not** a greeting.
> **"This headache is killing me"** → *potentially urgent*, a short clarifying question.

---

## 🎯 What the 24-Hour Demo Shows

- ✅ **Proactive check-ins** that adapt to the patient's responses
- ✅ **Simulated 30-day timeline** where the agents catch a declining trend and **escalate**
- ✅ **Doctor-facing summary** of everything between visits (Print + PDF)
- ✅ **Social-wellbeing behavior**: spotting isolation and nudging family or community

---

## 📸 Screenshots

| Login | Patient Agent | 30-Day Timeline |
|:---:|:---:|:---:|
| <img src="docs/login.png" width="250"/> | <img src="docs/agent.png" width="250"/> | <img src="docs/timeline.png" width="250"/> |

| Doctor Report | Medicines | SOS + Map |
|:---:|:---:|:---:|
| <img src="docs/report.png" width="250"/> | <img src="docs/medicines.png" width="250"/> | <img src="docs/sos.png" width="250"/> |

---

## 🚀 Features

- 🌐 **6 languages**: English, Hindi, Marathi, Gujarati, Bengali, Tamil (text + voice)
- 📊 **Animated graphs**: BP, heart rate, sleep, activity, mood, adherence
- 💊 **Medicines**: alarms, low-stock alerts, restock request and order tracking
- 🆘 **SOS** with a map of nearby hospitals, clinics and pharmacies
- 📄 **Doctor and caregiver summaries** with Print and PDF download
- 👵 **Elderly Mode** and 🌙 light/dark theme
- 🔐 **Role-based access** for patient, caregiver and doctor

---

## 🛡️ Safety Principles

- **No diagnosis, no prescribing**. Flags come from transparent rules that explain why
- Reports are marked **AI-assisted, requires clinician review**
- Calls, WhatsApp messages and alerts are **never shown as delivered** unless the provider confirms
- All generated patient data is labeled **SIMULATED DEMO DATA**
- Medicines are **never purchased automatically** and doses are never changed

---

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React, TypeScript, Tailwind CSS, Recharts, React Three Fiber |
| **Backend & Data** | Supabase (Auth, PostgreSQL, Row Level Security, Realtime, Edge Functions, pg_cron) |
| **AI** | Gemini API (server-side) + deterministic safety rules |
| **Communication** | Twilio, WhatsApp Business Cloud API, WebRTC, Web Speech API |
| **Maps** | Google Maps, or Leaflet + OpenStreetMap |
| **Reports** | jsPDF + autotable, Noto fonts |

---

## ⚙️ Run Locally

```bash
git clone https://github.com/YOUR-USERNAME/YOUR-REPO.git
cd YOUR-REPO
npm install
cp .env.example .env
npm run dev
```

| Variable | Needed for |
|---|---|
| `GEMINI_API_KEY` | Live AI conversations and summaries |
| `SUPABASE_URL`, `SUPABASE_ANON_KEY` | Cloud auth and database (otherwise **local demo mode**) |
| `GOOGLE_MAPS_API_KEY` | Google Maps (otherwise OpenStreetMap) |
| `TWILIO_*`, `WHATSAPP_*` | Real calls, SMS and WhatsApp (otherwise **demo mode**) |

> 🔒 Keep secrets server-side and never commit your `.env` file.

---

## ⚠️ Disclaimer

Elderly is a care-coordination and wellness-support tool, **not a medical device**. It does not diagnose or treat. In an emergency, call your local emergency number (India: **112 / 108**).

<div align="center">

**Made with 💚 for healthier, connected ageing**

</div>
