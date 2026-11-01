import React, { useState } from 'react';
import { SAFETY_TEST_CASES, runDeterministicSafetyCheck } from '../services/safetyRules';
import { CheckCircle2, XCircle, AlertTriangle, ShieldCheck, Play, RefreshCw, X } from 'lucide-react';
import { SupportedLanguage } from '../types';

interface SafetyTestSuiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTestPhraseSelected?: (phrase: string, lang: SupportedLanguage) => void;
}

export const SafetyTestSuiteModal: React.FC<SafetyTestSuiteModalProps> = ({
  isOpen,
  onClose,
  onTestPhraseSelected,
}) => {
  const [testResults, setTestResults] = useState<{
    [id: string]: {
      passed: boolean;
      actualUrgency: string;
      matchedCategory: string;
      rule: string;
    };
  }>({});
  const [isRunningAll, setIsRunningAll] = useState(false);

  if (!isOpen) return null;

  const runAllTests = () => {
    setIsRunningAll(true);
    const results: typeof testResults = {};

    SAFETY_TEST_CASES.forEach((tc) => {
      const match = runDeterministicSafetyCheck(tc.phrase, tc.language);
      const passed = match.urgency === tc.expectedUrgency;
      results[tc.id] = {
        passed,
        actualUrgency: match.urgency,
        matchedCategory: match.category,
        rule: match.matchedRule,
      };
    });

    setTestResults(results);
    setIsRunningAll(false);
  };

  const total = SAFETY_TEST_CASES.length;
  const passedCount = Object.values(testResults).filter((r) => r.passed).length;
  const hasRun = Object.keys(testResults).length > 0;

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full border border-stone-300 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 my-8">
        {/* Header */}
        <div className="bg-[#1C412E] text-white p-6 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-800/80 flex items-center justify-center border border-emerald-600">
              <ShieldCheck className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <h2 className="text-xl font-serif font-bold">
                Automated Safety Rules Test Suite (24 Test Cases)
              </h2>
              <p className="text-emerald-200 text-xs mt-0.5">
                Evaluates deterministic keyword/regex safety pipeline across English, Hindi, Marathi, Gujarati, Bengali, and Tamil
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-emerald-300 hover:text-white p-1 rounded-lg cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Action & Status Bar */}
        <div className="p-4 bg-stone-50 border-b border-stone-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={runAllTests}
              disabled={isRunningAll}
              className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              {isRunningAll ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4 fill-white" />
              )}
              <span>Run All 24 Safety Tests</span>
            </button>

            {hasRun && (
              <span className="text-xs font-bold text-stone-700 bg-white border border-stone-300 px-3 py-1.5 rounded-xl">
                Score: {passedCount} / {total} Passed ({Math.round((passedCount / total) * 100)}%)
              </span>
            )}
          </div>

          <div className="text-xs text-stone-600 flex items-center gap-3">
            <span className="flex items-center gap-1 font-semibold text-emerald-800">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span> Routine
            </span>
            <span className="flex items-center gap-1 font-semibold text-amber-700">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span> Borderline
            </span>
            <span className="flex items-center gap-1 font-semibold text-red-700">
              <span className="w-2 h-2 rounded-full bg-red-600"></span> Critical Urgent
            </span>
          </div>
        </div>

        {/* Test Case Table */}
        <div className="p-4 max-h-[500px] overflow-y-auto">
          <div className="space-y-2">
            {SAFETY_TEST_CASES.map((tc, idx) => {
              const res = testResults[tc.id];
              return (
                <div
                  key={tc.id}
                  className={`p-3 rounded-xl border text-xs transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    res
                      ? res.passed
                        ? 'border-emerald-200 bg-emerald-50/40'
                        : 'border-red-300 bg-red-50'
                      : 'border-stone-200 bg-white'
                  }`}
                >
                  <div className="space-y-1 max-w-xl">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-stone-500">#{idx + 1}</span>
                      <span className="font-semibold text-stone-700 uppercase tracking-wide bg-stone-100 px-1.5 py-0.5 rounded text-[10px]">
                        {tc.language}
                      </span>
                      <span
                        className={`font-bold px-2 py-0.5 rounded-md text-[10px] uppercase ${
                          tc.expectedUrgency === 'urgent'
                            ? 'bg-red-100 text-red-800'
                            : tc.expectedUrgency === 'potentially_urgent'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        Expected: {tc.expectedUrgency}
                      </span>
                    </div>

                    <p className="font-bold text-stone-900 text-sm">"{tc.phrase}"</p>
                    <p className="text-stone-500 text-[11px]">{tc.description}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {res ? (
                      <div className="text-right">
                        {res.passed ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-100 px-2 py-1 rounded-lg">
                            <CheckCircle2 className="w-4 h-4" /> Passed ({res.actualUrgency})
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-red-700 font-bold bg-red-100 px-2 py-1 rounded-lg">
                            <XCircle className="w-4 h-4" /> Failed (got {res.actualUrgency})
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-stone-400 font-medium text-[11px]">Not evaluated</span>
                    )}

                    {onTestPhraseSelected && (
                      <button
                        onClick={() => {
                          onTestPhraseSelected(tc.phrase, tc.language);
                          onClose();
                        }}
                        className="px-2.5 py-1 text-[11px] font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
                      >
                        Try in Chat
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-100 border-t border-stone-200 flex items-center justify-between">
          <p className="text-[11px] text-stone-600">
            Rules strictly prioritize urgent life-threats over routine conversational greetings.
          </p>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
