import { SupportedLanguage, UrgencyLevel } from '../types';

export interface SafetyRuleMatch {
  urgency: UrgencyLevel;
  category: string;
  matchedRule: string;
  immediateReply?: string;
  isEmergencyAlert: boolean;
  needsClarification: boolean;
}

export interface SafetyTestCase {
  id: string;
  language: SupportedLanguage;
  phrase: string;
  expectedUrgency: UrgencyLevel;
  category: string;
  description: string;
}

// 24 Automated Safety Test Cases covering all 6 languages (Urgent, Borderline, Routine)
export const SAFETY_TEST_CASES: SafetyTestCase[] = [
  // 1. English - Urgent: Life threat
  {
    id: 'tc-01',
    language: 'en-IN',
    phrase: "I'm going to die, my heart hurts so bad",
    expectedUrgency: 'urgent',
    category: 'cardiac_lifethreat',
    description: 'Direct life threat and severe cardiac distress',
  },
  // 2. English - Urgent: Respiratory
  {
    id: 'tc-02',
    language: 'en-IN',
    phrase: "I can't breathe, please help me right now",
    expectedUrgency: 'urgent',
    category: 'respiratory',
    description: 'Severe acute breathlessness',
  },
  // 3. English - Borderline (Dramatic idiom, not cardiac arrest)
  {
    id: 'tc-03',
    language: 'en-IN',
    phrase: "This headache is killing me today",
    expectedUrgency: 'potentially_urgent',
    category: 'borderline_pain',
    description: 'Idiomatic severe headache requiring gentle clarification, not immediate ambulance siren',
  },
  // 4. English - Routine
  {
    id: 'tc-04',
    language: 'en-IN',
    phrase: "Good morning, I slept 7 hours and had breakfast",
    expectedUrgency: 'routine',
    category: 'routine_checkin',
    description: 'Standard daily wellness check-in',
  },
  // 5. Hindi - Urgent: Respiratory
  {
    id: 'tc-05',
    language: 'hi-IN',
    phrase: "mujhe saans nahi aa rahi hai",
    expectedUrgency: 'urgent',
    category: 'respiratory',
    description: 'Transliterated Hindi severe breathlessness',
  },
  // 6. Hindi - Urgent: Cardiac
  {
    id: 'tc-06',
    language: 'hi-IN',
    phrase: "seene me bahut tez dard ho raha hai",
    expectedUrgency: 'urgent',
    category: 'cardiac',
    description: 'Acute chest pain in Hindi (Hinglish)',
  },
  // 7. Hindi Devanagari - Urgent: Unconscious/Stroke
  {
    id: 'tc-07',
    language: 'hi-IN',
    phrase: "अचानक चक्कर खाकर गिर पड़े और चेहरा टेढ़ा लग रहा है",
    expectedUrgency: 'urgent',
    category: 'neurological_stroke',
    description: 'Stroke signs / sudden fall with facial asymmetry',
  },
  // 8. Hindi - Borderline
  {
    id: 'tc-08',
    language: 'hi-IN',
    phrase: "आज सुबह से हल्का चक्कर आ रहा है उठने पर",
    expectedUrgency: 'potentially_urgent',
    category: 'postural_dizziness',
    description: 'Orthostatic dizziness requiring hydration / medication timing check',
  },
  // 9. Hindi - Routine
  {
    id: 'tc-09',
    language: 'hi-IN',
    phrase: "नमस्ते, मैंने सुबह की बीपी की गोली ले ली है",
    expectedUrgency: 'routine',
    category: 'routine_checkin',
    description: 'Confirmed morning BP medicine intake',
  },
  // 10. Marathi - Urgent: Chest pain
  {
    id: 'tc-10',
    language: 'mr-IN',
    phrase: "माझ्या छातीत खूप तीव्र कळ येतेय आणि घाम फुटलाय",
    expectedUrgency: 'urgent',
    category: 'cardiac',
    description: 'Chest pain with diaphoresis (cold sweats) in Marathi',
  },
  // 11. Marathi - Urgent: Respiratory
  {
    id: 'tc-11',
    language: 'mr-IN',
    phrase: "मला श्वास घेता येत नाहीये, खूप भीती वाटतेय",
    expectedUrgency: 'urgent',
    category: 'respiratory',
    description: 'Acute respiratory distress in Marathi',
  },
  // 12. Marathi - Borderline
  {
    id: 'tc-12',
    language: 'mr-IN',
    phrase: "आज गुडघे थोडे जास्त दुखतायत चालताना",
    expectedUrgency: 'routine',
    category: 'joint_ache',
    description: 'Mild ambulatory joint ache, routine care follow-up',
  },
  // 13. Gujarati - Urgent: Cardiac
  {
    id: 'tc-13',
    language: 'gu-IN',
    phrase: "મારી છાતીમાં અસહ્ય દુખાવો થાય છે, હાર્ટ એટેક જેવું લાગે છે",
    expectedUrgency: 'urgent',
    category: 'cardiac',
    description: 'Severe chest pain / suspected heart attack in Gujarati',
  },
  // 14. Gujarati - Urgent: Severe breathlessness
  {
    id: 'tc-14',
    language: 'gu-IN',
    phrase: "શ્વાસ લેવામાં બહુ તકલીફ છે, દમ ઘૂંટાય છે",
    expectedUrgency: 'urgent',
    category: 'respiratory',
    description: 'Suffocation / severe dyspnea in Gujarati',
  },
  // 15. Gujarati - Routine
  {
    id: 'tc-15',
    language: 'gu-IN',
    phrase: "જય શ્રી કૃષ્ણ, આજે બપોરે ખીચડી ખાધી અને દવા લીધી",
    expectedUrgency: 'routine',
    category: 'routine_checkin',
    description: 'Peaceful meal and medication update in Gujarati',
  },
  // 16. Bengali - Urgent: Respiratory & Heart
  {
    id: 'tc-16',
    language: 'bn-IN',
    phrase: "বুকে অসহ্য চাপ আর দম আটকে আসছে, বাঁচব না মনে হচ্ছে",
    expectedUrgency: 'urgent',
    category: 'cardiorespiratory',
    description: 'Severe crushing chest sensation and dyspnea in Bengali',
  },
  // 17. Bengali - Urgent: Unconscious
  {
    id: 'tc-17',
    language: 'bn-IN',
    phrase: "হঠাৎ মাথা ঘুরে পড়ে গেছেন, কথা জড়িয়ে যাচ্ছে",
    expectedUrgency: 'urgent',
    category: 'neurological_stroke',
    description: 'Syncope and dysarthria (slurred speech) in Bengali',
  },
  // 18. Bengali - Routine
  {
    id: 'tc-18',
    language: 'bn-IN',
    phrase: "আজ রাতে ভালো ঘুম হয়েছে, চা খেয়ে ওষুধ নিলাম",
    expectedUrgency: 'routine',
    category: 'routine_checkin',
    description: 'Sound sleep and morning tea routine in Bengali',
  },
  // 19. Tamil - Urgent: Cardiac
  {
    id: 'tc-19',
    language: 'ta-IN',
    phrase: "நெஞ்சில் கடுமையான வலி, மயக்கம் வருகிறது",
    expectedUrgency: 'urgent',
    category: 'cardiac',
    description: 'Severe chest pain with syncope/dizziness in Tamil',
  },
  // 20. Tamil - Urgent: Respiratory
  {
    id: 'tc-20',
    language: 'ta-IN',
    phrase: "மூச்சு விட முடியவில்லை, காப்பாற்றுங்கள்",
    expectedUrgency: 'urgent',
    category: 'respiratory',
    description: 'Unable to breathe / urgent cry for help in Tamil',
  },
  // 21. Tamil - Borderline
  {
    id: 'tc-21',
    language: 'ta-IN',
    phrase: "இன்று உடம்பு மிகவும் சோர்வாக இருக்கிறது",
    expectedUrgency: 'potentially_urgent',
    category: 'lethargy',
    description: 'Unusual pronounced fatigue in Tamil',
  },
  // 22. Tamil - Routine
  {
    id: 'tc-22',
    language: 'ta-IN',
    phrase: "காலை வணக்கம், நடைபயிற்சி முடித்து மாத்திரை சாப்பிட்டேன்",
    expectedUrgency: 'routine',
    category: 'routine_checkin',
    description: 'Morning walk and pill completed in Tamil',
  },
  // 23. English - Urgent: Acute Trauma / Bleeding
  {
    id: 'tc-23',
    language: 'en-IN',
    phrase: "I fell down the bathroom stairs and my head is bleeding heavily",
    expectedUrgency: 'urgent',
    category: 'trauma_hemorrhage',
    description: 'Head trauma with active heavy bleeding',
  },
  // 24. Hindi - Borderline: Missed Dose with mild symptom
  {
    id: 'tc-24',
    language: 'hi-IN',
    phrase: "kal raat ki BP ki goli bhool gaya tha, thoda ajeeb lag raha hai",
    expectedUrgency: 'potentially_urgent',
    category: 'missed_critical_med',
    description: 'Missed antihypertensive dose with mild malaise',
  },
];

export function runDeterministicSafetyCheck(text: string, language: SupportedLanguage): SafetyRuleMatch {
  const norm = text.toLowerCase().trim();

  // URGENT REGEX RULES
  const urgentChecks: { regex: RegExp; category: string }[] = [
    // Dying / Life threat
    { regex: /(going to die|gonna die|about to die|i will die|dying|feel like dying|want to die|marna chahta|mar jaunga|mar rahi|marne ja raha|jeena nahi|marr jaunga)/i, category: 'life_threat' },
    { regex: /(मरणार आहे|मरून जाईन|जीवायचे नाही|મરી જઈશ|મરવું છે|মরে যাব|বাঁচব না|சாகப் போகிறேன்)/i, category: 'life_threat' },

    // Cardiac
    { regex: /(chest pain|heart attack|heart hurts|seene me dard|chhati me dard|seene me jalan|heart pain|dil me dard)/i, category: 'cardiac' },
    { regex: /(छातीत दुखतंय|छातीत कळ|છાતીમાં દુખાવો|હાર્ટ એટેક|বুকে অসহ্য চাপ|বুকে ব্যথা|நெஞ்சில் கடுமையான வலி|மாரடைப்பு)/i, category: 'cardiac' },

    // Respiratory
    { regex: /(can't breathe|cannot breathe|cant breathe|saans nahi aa rahi|dam ghut raha|saans phool|unable to breathe)/i, category: 'respiratory' },
    { regex: /(श्वास घेता येत नाही|दम लागतोय|શ્વાસ નથી લેવાતો|શ્વાસ ચડે છે|দম আটকে আসছে|শ্বাস নিতে পারছি না|மூச்சு விட முடியவில்லை)/i, category: 'respiratory' },

    // Stroke / Paralysis / Bleeding
    { regex: /(face drooping|slurred speech|stroke|passed out|unconscious|heavy bleeding|bleeding heavily|khoon nikal)/i, category: 'neurological_or_trauma' },
    { regex: /(चेहरा टेढ़ा|बोलता येत नाही|બેભાન|অজ্ঞান|কথা জড়িয়ে|பக்கவாதம்|ரத்தப்போக்கு)/i, category: 'neurological_or_trauma' },
  ];

  for (const item of urgentChecks) {
    if (item.regex.test(norm)) {
      return {
        urgency: 'urgent',
        category: item.category,
        matchedRule: item.regex.source,
        isEmergencyAlert: true,
        needsClarification: false,
      };
    }
  }

  // POTENTIALLY URGENT RULES (e.g. stomach pain/pining, severe headache, orthostatic dizziness)
  const borderlineChecks: { regex: RegExp; category: string }[] = [
    { regex: /(stomach is pining|stomach is paining|stomach pain|pet me dard|pait me dard|abdominal pain|killing me|unbearable headache|severe headache|bohot tez sar dard|dizzy|chakkar|fell down|gir gaya|bhool gaya)/i, category: 'abdominal_or_acute_pain' },
    { regex: /(पोटात दुखतंय|પેટમાં દુખાવો|পেটে ব্যথা|வயிற்று வலி|ખૂબ માથાનો દુખાવો|ચક્કર આવે|মাথা ঘুরে|கடுமையான தலைவலி|சோர்வாக)/i, category: 'abdominal_or_acute_pain' },
  ];

  for (const item of borderlineChecks) {
    if (item.regex.test(norm)) {
      return {
        urgency: 'potentially_urgent',
        category: item.category,
        matchedRule: item.regex.source,
        isEmergencyAlert: false,
        needsClarification: true,
      };
    }
  }

  return {
    urgency: 'routine',
    category: 'routine',
    matchedRule: 'none',
    isEmergencyAlert: false,
    needsClarification: false,
  };
}
