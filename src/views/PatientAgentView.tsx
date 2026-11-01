import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { SupportedLanguage } from '../types';
import {
  Mic,
  MicOff,
  Send,
  Volume2,
  Trash2,
  ShieldCheck,
  Sparkles,
  Info,
  Clock,
  Heart,
  AlertTriangle,
  Play,
  RotateCcw,
  ShieldAlert,
  Stethoscope,
} from 'lucide-react';

interface PatientAgentViewProps {
  onOpenSafetyTests: () => void;
}

export const PatientAgentView: React.FC<PatientAgentViewProps> = ({ onOpenSafetyTests }) => {
  const {
    messages,
    sendMessage,
    clearConversationMemory,
    triggerEmergencySOS,
    isAiThinking,
    language,
    setLanguage,
    isElderlyMode,
    patient,
    speakText,
    t,
  } = useApp();

  const [inputVal, setInputVal] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speechRecognitionSupported, setSpeechRecognitionSupported] = useState(true);
  const [detectedVoiceStatus, setDetectedVoiceStatus] = useState<string>('Detecting speech synthesis voices...');
  const [showMemoryModal, setShowMemoryModal] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAiThinking]);

  // Check SpeechSynthesis voice support for current language
  useEffect(() => {
    if (!('speechSynthesis' in window)) {
      setDetectedVoiceStatus('Voice speech output not supported by browser.');
      return;
    }

    const checkVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      const exactVoice = voices.find((v) => v.lang.toLowerCase().includes(language.toLowerCase()));
      const langPrefix = language.split('-')[0];
      const partialVoice = voices.find((v) => v.lang.toLowerCase().startsWith(langPrefix));

      if (exactVoice) {
        setDetectedVoiceStatus(`Native browser voice found: "${exactVoice.name}" (${exactVoice.lang})`);
      } else if (partialVoice) {
        setDetectedVoiceStatus(`Closest language voice: "${partialVoice.name}" (${partialVoice.lang})`);
      } else {
        setDetectedVoiceStatus(`No native "${language}" voice found in browser. Speaking via standard Indian English voice with on-screen text.`);
      }
    };

    checkVoices();
    window.speechSynthesis.onvoiceschanged = checkVoices;
  }, [language]);

  // Setup Web Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechRecognitionSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = language;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (e: any) => {
      console.warn('Speech recognition error:', e.error);
      setIsListening(false);
    };
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputVal(transcript);
      sendMessage(transcript);
    };

    recognitionRef.current = recognition;
  }, [language]);

  const toggleMic = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.lang = language;
        recognitionRef.current.start();
      } catch (err) {
        console.warn('Mic start failed:', err);
      }
    }
  };

  const handleSend = () => {
    if (!inputVal.trim()) return;
    const text = inputVal;
    setInputVal('');
    sendMessage(text);
  };

  const samplePhrases = [
    { label: 'Stomach Pain & Die Test', text: 'My stomach is pining and I am gonna die' },
    { label: 'Cardiac Test: "seene me dard"', text: 'mujhe seene me bahut tez dard ho raha hai' },
    { label: 'Routine: Slept 7h & morning tea', text: 'Good morning, I slept 7 hours and had morning tea and took BP medicine' },
    { label: 'Dizziness: Standing up from chair', text: 'I felt unusually dizzy when standing up from my chair' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-4">
      {/* 3D Top Companion Header Bar */}
      <div className="bg-white rounded-[2rem] border border-stone-200 p-5 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.06)] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-emerald-800 to-stone-900 text-white flex items-center justify-center shadow-md shadow-emerald-900/20 border border-emerald-600/30">
            <Stethoscope className="w-7 h-7 text-emerald-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif text-lg sm:text-xl font-bold text-stone-900">
                Elderly Doctor AI
              </h2>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase tracking-wide border border-emerald-200">
                Doctor-Grade Wisdom
              </span>
            </div>
            <p className="text-xs text-stone-500">
              Clinical geriatric care companion for {patient.name} • Analyzes pain, symptoms & vitals with doctor guidance
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowMemoryModal(true)}
            className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Info className="w-3.5 h-3.5 text-stone-500" />
            <span>Memory Audit</span>
          </button>

          <button
            onClick={clearConversationMemory}
            className="px-3 py-1.5 bg-stone-100 hover:bg-red-50 text-stone-600 hover:text-red-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Memory</span>
          </button>

          <button
            onClick={onOpenSafetyTests}
            className="px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>24 Safety Tests</span>
          </button>
        </div>
      </div>

      {/* Voice Status Indicator Banner */}
      <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl px-4 py-2.5 text-xs text-emerald-900 flex flex-wrap items-center justify-between gap-2 shadow-xs">
        <div className="flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-emerald-700" />
          <span className="font-medium">{detectedVoiceStatus}</span>
        </div>
        <div className="text-[11px] text-emerald-800 font-bold bg-white px-2 py-0.5 rounded-md border border-emerald-200">
          Selected Language: <strong className="uppercase">{language}</strong>
        </div>
      </div>

      {/* Conversation Screen Box with 3D Depth */}
      <div className="bg-white rounded-[2rem] border border-stone-200 shadow-[0_12px_30px_rgb(0,0,0,0.06)] flex flex-col h-[530px] overflow-hidden">
        {/* Chat message scroll area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-[#FAF9F5]">
          {messages.map((msg) => {
            const isUser = msg.sender === 'patient';
            const isSystem = msg.sender === 'system';
            const isEmergency = msg.urgency === 'urgent' || msg.isEmergencyAlert;
            const isPotentiallyUrgent = msg.urgency === 'potentially_urgent';

            if (isSystem) {
              return (
                <div key={msg.id} className="text-center my-3">
                  <span className="inline-block px-3.5 py-1 bg-stone-200 text-stone-700 rounded-full text-xs font-semibold shadow-xs">
                    {msg.text}
                  </span>
                </div>
              );
            }

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-3xl p-5 transition-all ${
                    isEmergency
                      ? 'bg-red-600 text-white shadow-xl shadow-red-500/25 border-2 border-red-700'
                      : isUser
                      ? 'bg-gradient-to-br from-[#1C412E] to-[#25573E] text-white rounded-br-xs shadow-md shadow-emerald-950/15'
                      : 'bg-white text-stone-900 border border-stone-200/90 rounded-bl-xs shadow-[0_8px_20px_-4px_rgba(0,0,0,0.06)]'
                  }`}
                >
                  {/* Sender & Urgency tag */}
                  <div className="flex items-center justify-between gap-3 text-[10px] pb-1.5 mb-2 border-b border-black/10">
                    <span className="font-bold uppercase tracking-wider opacity-90 flex items-center gap-1.5">
                      {!isUser && <Stethoscope className="w-3 h-3 text-emerald-600" />}
                      <span>{isUser ? patient.name : 'Elderly Doctor AI'}</span>
                    </span>
                    <div className="flex items-center gap-1.5">
                      {isEmergency && (
                        <span className="bg-red-800 text-white font-black px-2 py-0.5 rounded-full animate-pulse">
                          CRITICAL EMERGENCY
                        </span>
                      )}
                      {isPotentiallyUrgent && !isEmergency && (
                        <span className="bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full border border-amber-300">
                          ATTENTION REQUIRED
                        </span>
                      )}
                      <span className="opacity-75">{msg.timestamp}</span>
                    </div>
                  </div>

                  {/* Message body text */}
                  <p
                    className={`leading-relaxed ${
                      isElderlyMode ? 'text-lg sm:text-xl font-medium' : 'text-sm sm:text-base'
                    }`}
                  >
                    {msg.text}
                  </p>

                  {/* Direct One-Tap Emergency SOS Trigger if pain/distress is mentioned */}
                  {(isEmergency || isPotentiallyUrgent) && !isUser && (
                    <div className="mt-3 pt-3 border-t border-black/10 flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-xs font-semibold text-amber-900 bg-amber-100/90 px-2.5 py-1 rounded-lg">
                        Feeling unbearable pain?
                      </span>
                      <button
                        onClick={() => triggerEmergencySOS('In-Chat Doctor SOS', `Urgent pain expressed: ${msg.text.slice(0, 50)}`)}
                        className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer transform hover:scale-105"
                      >
                        <ShieldAlert className="w-3.5 h-3.5 animate-pulse" />
                        <span>Activate Emergency Alert (SOS)</span>
                      </button>
                    </div>
                  )}

                  {/* Doctor's follow-up diagnostic question */}
                  {!isUser && msg.nextQuestion && (
                    <div className="mt-3 pt-2.5 border-t border-stone-100 text-xs font-semibold text-emerald-950 bg-emerald-50/80 p-3 rounded-2xl border border-emerald-200/60">
                      <span className="text-[10px] uppercase font-bold text-emerald-700 block mb-0.5">Doctor's Follow-up Check:</span>
                      {msg.nextQuestion}
                    </div>
                  )}

                  {/* Speech button on agent messages */}
                  {!isUser && (
                    <div className="mt-2.5 flex items-center justify-end">
                      <button
                        onClick={() => speakText(msg.text, msg.language)}
                        className="text-[11px] font-semibold text-stone-500 hover:text-emerald-800 flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>Listen to Voice</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isAiThinking && (
            <div className="flex items-start">
              <div className="bg-white border border-stone-200 rounded-2xl px-4 py-3 shadow-md flex items-center gap-2.5 text-xs text-stone-600">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-ping"></span>
                <span className="font-semibold">Elderly Doctor AI is analyzing symptoms & framing advice...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Sample / Test Prompts */}
        <div className="p-3 bg-stone-100/80 border-t border-stone-200 flex items-center gap-2 overflow-x-auto scrollbar-none text-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 shrink-0">
            Quick Prompts:
          </span>
          {samplePhrases.map((sp, idx) => (
            <button
              key={idx}
              onClick={() => {
                setInputVal(sp.text);
                sendMessage(sp.text);
              }}
              className="px-3 py-1 bg-white hover:bg-stone-200 border border-stone-200 rounded-xl text-stone-800 font-semibold whitespace-nowrap transition-all shadow-2xs hover:shadow-xs cursor-pointer shrink-0"
            >
              {sp.label}
            </button>
          ))}
        </div>

        {/* Input & Voice Controls with 3D Depth */}
        <div className="p-3.5 sm:p-4 bg-white border-t border-stone-200 flex items-center gap-2">
          {/* Mic Button */}
          {speechRecognitionSupported ? (
            <button
              onClick={toggleMic}
              className={`p-3.5 rounded-2xl flex items-center justify-center transition-all cursor-pointer ${
                isListening
                  ? 'bg-red-600 text-white animate-pulse shadow-lg shadow-red-500/30'
                  : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 shadow-xs'
              }`}
              title={isListening ? 'Stop listening' : 'Start voice input'}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
          ) : (
            <div className="p-3.5 text-stone-400" title="Mic not supported in browser">
              <MicOff className="w-5 h-5" />
            </div>
          )}

          {/* Text Input */}
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={
              isListening
                ? 'Listening to your voice...'
                : isElderlyMode
                ? 'Type in any language (e.g. My stomach is paining)...'
                : t('typePlaceholder')
            }
            className={`flex-1 px-4 rounded-2xl border border-stone-300 focus:outline-emerald-700 bg-stone-50/70 text-stone-900 shadow-inner ${
              isElderlyMode ? 'py-4 text-base' : 'py-3 text-sm'
            }`}
          />

          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={!inputVal.trim() || isAiThinking}
            className={`rounded-2xl font-bold flex items-center justify-center bg-emerald-800 hover:bg-emerald-900 text-white transition-all disabled:opacity-50 cursor-pointer shadow-md shadow-emerald-800/20 transform hover:-translate-y-0.5 active:translate-y-0 ${
              isElderlyMode ? 'px-7 py-4 text-base' : 'px-5 py-3 text-sm'
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Transparent Memory Modal */}
      {showMemoryModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <Info className="w-5 h-5 text-emerald-700" />
                <h3 className="font-serif font-bold text-lg text-stone-900">
                  What Elderly Remembers
                </h3>
              </div>
              <button
                onClick={() => setShowMemoryModal(false)}
                className="text-stone-400 hover:text-stone-600 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs text-stone-700">
              <p className="text-stone-600">
                In adherence with clinical privacy standards, only medical observations from recorded check-ins are retained. No audio recordings are permanently stored.
              </p>

              <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 space-y-1.5">
                <p>
                  <strong>Patient Profile:</strong> {patient.name}, {patient.age} years old ({patient.condition})
                </p>
                <p>
                  <strong>Active Prescriptions:</strong> Amlodipine 5mg (morning), Metformin 500mg (twice daily), Atorvastatin 10mg (night)
                </p>
                <p>
                  <strong>Baseline Vitals:</strong> 122/80 mmHg (Systolic/Diastolic), 72 bpm, 7.5h sleep
                </p>
                <p>
                  <strong>Recent Logged Events:</strong> Day 27 systolic spike (148/94 mmHg), 2 missed check-ins recorded.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  onClick={() => {
                    clearConversationMemory();
                    setShowMemoryModal(false);
                  }}
                  className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 rounded-xl font-bold transition-colors cursor-pointer"
                >
                  Clear All Memory
                </button>
                <button
                  onClick={() => setShowMemoryModal(false)}
                  className="px-4 py-2 bg-stone-900 text-white rounded-xl font-bold cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
