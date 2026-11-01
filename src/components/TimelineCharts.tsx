import React, { useState } from 'react';
import { TimelineDayData } from '../types';
import { HelpCircle, AlertTriangle, Calendar, Info, Activity, Heart, Moon, Zap, Pill, CheckCircle2 } from 'lucide-react';

interface TimelineChartsProps {
  data: TimelineDayData[];
  onSelectDay?: (day: TimelineDayData) => void;
}

export const TimelineCharts: React.FC<TimelineChartsProps> = ({ data, onSelectDay }) => {
  const [selectedMetric, setSelectedMetric] = useState<
    'bp' | 'heartRate' | 'sleep' | 'activity' | 'adherence' | 'mood'
  >('bp');
  const [activeHoverDay, setActiveHoverDay] = useState<TimelineDayData | null>(null);
  const [viewWindow, setViewWindow] = useState<'30days' | 'last14days' | 'last7days'>('30days');
  const [explainingFlag, setExplainingFlag] = useState<TimelineDayData | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="p-8 text-center bg-stone-50 rounded-2xl border border-stone-200 text-stone-500">
        No data recorded
      </div>
    );
  }

  // Filter based on selected view window
  let filteredData = data;
  if (viewWindow === 'last7days') {
    filteredData = data.slice(-7);
  } else if (viewWindow === 'last14days') {
    filteredData = data.slice(-14);
  }

  // Chart Dimensions
  const svgWidth = 860;
  const svgHeight = 260;
  const padding = { top: 30, right: 30, bottom: 40, left: 55 };
  const graphWidth = svgWidth - padding.left - padding.right;
  const graphHeight = svgHeight - padding.top - padding.bottom;

  // Compute Scales
  const xStep = graphWidth / (filteredData.length - 1 || 1);

  // Metric-specific ranges & units
  let yMin = 0;
  let yMax = 100;
  let unit = '';
  let title = '';
  let normalRangeBand: { min: number; max: number; label: string } | null = null;

  if (selectedMetric === 'bp') {
    yMin = 60;
    yMax = 170;
    unit = 'mmHg';
    title = 'Blood Pressure Trend (Systolic & Diastolic)';
    normalRangeBand = { min: 90, max: 130, label: 'Optimal Systolic Range (90 - 130 mmHg)' };
  } else if (selectedMetric === 'heartRate') {
    yMin = 50;
    yMax = 115;
    unit = 'bpm';
    title = 'Resting Heart Rate Trend';
    normalRangeBand = { min: 60, max: 85, label: 'Normal Resting Range (60 - 85 bpm)' };
  } else if (selectedMetric === 'sleep') {
    yMin = 2;
    yMax = 10;
    unit = 'hours';
    title = 'Sleep Duration & Consistency';
    normalRangeBand = { min: 6.5, max: 8.5, label: 'Recommended Sleep Range (6.5 - 8.5 hrs)' };
  } else if (selectedMetric === 'activity') {
    yMin = 0;
    yMax = 70;
    unit = 'mins';
    title = 'Daily Gentle Physical Activity';
    normalRangeBand = { min: 30, max: 60, label: 'Target Daily Walk (30+ mins)' };
  } else if (selectedMetric === 'adherence') {
    yMin = 0;
    yMax = 105;
    unit = '%';
    title = 'Medication Adherence Rate';
    normalRangeBand = { min: 90, max: 100, label: 'Safe Adherence Target (>=90%)' };
  } else if (selectedMetric === 'mood') {
    yMin = 1;
    yMax = 10;
    unit = '/10';
    title = 'Mood & Emotional Energy Score';
    normalRangeBand = { min: 7, max: 10, label: 'Stable Emotional State (7 - 10)' };
  }

  const getY = (val: number) => {
    const clamped = Math.max(yMin, Math.min(yMax, val));
    return padding.top + graphHeight - ((clamped - yMin) / (yMax - yMin)) * graphHeight;
  };

  // Generate SVG path points
  const pointsSystolic = filteredData.map((d, i) => ({
    x: padding.left + i * xStep,
    y: getY(d.systolic),
    data: d,
  }));

  const pointsDiastolic = filteredData.map((d, i) => ({
    x: padding.left + i * xStep,
    y: getY(d.diastolic),
    data: d,
  }));

  const pointsSingleMetric = filteredData.map((d, i) => {
    let val = 0;
    if (selectedMetric === 'heartRate') val = d.heartRate;
    if (selectedMetric === 'sleep') val = d.sleepHours;
    if (selectedMetric === 'activity') val = d.activityMinutes;
    if (selectedMetric === 'adherence') val = d.adherenceRate;
    if (selectedMetric === 'mood') val = d.moodScore;
    return {
      x: padding.left + i * xStep,
      y: getY(val),
      val,
      data: d,
    };
  });

  const makeLinePath = (pts: { x: number; y: number }[]) => {
    if (pts.length === 0) return '';
    return pts.reduce((acc, curr, idx) => `${acc} ${idx === 0 ? 'M' : 'L'} ${curr.x.toFixed(1)} ${curr.y.toFixed(1)}`, '');
  };

  const makeAreaPath = (pts: { x: number; y: number }[]) => {
    if (pts.length === 0) return '';
    const line = makeLinePath(pts);
    const bottomY = padding.top + graphHeight;
    return `${line} L ${pts[pts.length - 1].x.toFixed(1)} ${bottomY} L ${pts[0].x.toFixed(1)} ${bottomY} Z`;
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs">
      {/* Header & Metric Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-serif text-lg font-bold text-stone-900">{title}</h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 uppercase tracking-wide">
              SIMULATED DEMO DATA
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Data Source: Patient Check-in & Connected Health Device • Date Range: Last 30 Days
          </p>
        </div>

        {/* View Range Buttons */}
        <div className="flex items-center gap-2">
          <div className="flex bg-stone-100 p-1 rounded-xl text-xs font-semibold text-stone-600">
            <button
              onClick={() => setViewWindow('last7days')}
              className={`px-3 py-1 rounded-lg transition-colors ${viewWindow === 'last7days' ? 'bg-white text-stone-900 shadow-xs' : 'hover:text-stone-900'}`}
            >
              7 Days
            </button>
            <button
              onClick={() => setViewWindow('last14days')}
              className={`px-3 py-1 rounded-lg transition-colors ${viewWindow === 'last14days' ? 'bg-white text-stone-900 shadow-xs' : 'hover:text-stone-900'}`}
            >
              14 Days
            </button>
            <button
              onClick={() => setViewWindow('30days')}
              className={`px-3 py-1 rounded-lg transition-colors ${viewWindow === '30days' ? 'bg-white text-stone-900 shadow-xs' : 'hover:text-stone-900'}`}
            >
              Full 30 Days
            </button>
          </div>
        </div>
      </div>

      {/* Metric Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 my-4">
        {[
          { id: 'bp', label: 'Blood Pressure', icon: Activity, color: 'text-rose-600' },
          { id: 'heartRate', label: 'Heart Rate', icon: Heart, color: 'text-red-500' },
          { id: 'sleep', label: 'Sleep & Night', icon: Moon, color: 'text-indigo-600' },
          { id: 'activity', label: 'Daily Walk', icon: Zap, color: 'text-amber-600' },
          { id: 'adherence', label: 'Med Adherence', icon: Pill, color: 'text-emerald-600' },
          { id: 'mood', label: 'Mood & Energy', icon: CheckCircle2, color: 'text-teal-600' },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = selectedMetric === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedMetric(tab.id as any)}
              className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                isActive
                  ? 'border-emerald-700 bg-emerald-50 text-emerald-950 font-bold shadow-xs'
                  : 'border-stone-200 bg-stone-50/50 hover:bg-stone-100 text-stone-600'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${tab.color}`} />
              <span className="truncate">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Interactive SVG Chart Canvas */}
      <div className="relative overflow-x-auto">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto min-w-[700px] select-none"
        >
          {/* Defs for gradients & filters */}
          <defs>
            <linearGradient id="bpGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="singleGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#059669" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#059669" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Normal Target Range Band */}
          {normalRangeBand && (
            <rect
              x={padding.left}
              y={getY(normalRangeBand.max)}
              width={graphWidth}
              height={getY(normalRangeBand.min) - getY(normalRangeBand.max)}
              fill="#10b981"
              fillOpacity="0.08"
            />
          )}

          {/* Y Axis Grid Lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
            const val = Math.round(yMin + ratio * (yMax - yMin));
            const yPos = getY(val);
            return (
              <g key={idx}>
                <line
                  x1={padding.left}
                  y1={yPos}
                  x2={svgWidth - padding.right}
                  y2={yPos}
                  stroke="#e7e5e4"
                  strokeDasharray="4 4"
                />
                <text
                  x={padding.left - 8}
                  y={yPos + 4}
                  textAnchor="end"
                  className="fill-stone-400 text-[10px] font-mono"
                >
                  {val} {unit}
                </text>
              </g>
            );
          })}

          {/* Baseline Phase Indicator (Days 1 to 10) */}
          {filteredData.some((d) => d.day <= 10) && (
            <g>
              <line
                x1={padding.left + (Math.min(10, filteredData.length) - 1) * xStep}
                y1={padding.top}
                x2={padding.left + (Math.min(10, filteredData.length) - 1) * xStep}
                y2={padding.top + graphHeight}
                stroke="#059669"
                strokeWidth="1.5"
                strokeDasharray="3 3"
              />
              <text
                x={padding.left + 8}
                y={padding.top + 14}
                className="fill-emerald-800 text-[10px] font-bold"
              >
                ← 10-Day Baseline Phase
              </text>
            </g>
          )}

          {/* Metric Paths */}
          {selectedMetric === 'bp' ? (
            <>
              {/* Systolic Area & Line */}
              <path d={makeAreaPath(pointsSystolic)} fill="url(#bpGrad)" />
              <path
                d={makeLinePath(pointsSystolic)}
                fill="none"
                stroke="#dc2626"
                strokeWidth="2.5"
                strokeLinecap="round"
                className="transition-all duration-300"
              />

              {/* Diastolic Line */}
              <path
                d={makeLinePath(pointsDiastolic)}
                fill="none"
                stroke="#2563eb"
                strokeWidth="2"
                strokeLinecap="round"
              />

              {/* Points & Event Markers */}
              {pointsSystolic.map((pt, i) => (
                <g key={`bp-${i}`}>
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={pt.data.isFlagged ? 5 : 3}
                    fill={pt.data.isFlagged ? '#ef4444' : '#dc2626'}
                    stroke="white"
                    strokeWidth="1.5"
                    className="cursor-pointer hover:r-7 transition-all"
                    onMouseEnter={() => setActiveHoverDay(pt.data)}
                    onClick={() => onSelectDay?.(pt.data)}
                  />

                  {/* Flag warning marker on critical days */}
                  {pt.data.isFlagged && (
                    <circle
                      cx={pt.x}
                      cy={pt.y - 10}
                      r="3.5"
                      fill="#f59e0b"
                      className="animate-ping"
                    />
                  )}
                </g>
              ))}
            </>
          ) : (
            <>
              {/* Single Metric Line & Area */}
              <path d={makeAreaPath(pointsSingleMetric)} fill="url(#singleGrad)" />
              <path
                d={makeLinePath(pointsSingleMetric)}
                fill="none"
                stroke="#059669"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {pointsSingleMetric.map((pt, i) => (
                <g key={`single-${i}`}>
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={pt.data.isFlagged ? 5 : 3.5}
                    fill={pt.data.isFlagged ? '#ef4444' : '#059669'}
                    stroke="white"
                    strokeWidth="1.5"
                    className="cursor-pointer hover:r-6 transition-all"
                    onMouseEnter={() => setActiveHoverDay(pt.data)}
                    onClick={() => onSelectDay?.(pt.data)}
                  />
                </g>
              ))}
            </>
          )}

          {/* X Axis Day Labels */}
          {filteredData.map((d, i) => {
            // Show label every few days to prevent clutter
            const showLabel = filteredData.length <= 14 || i % 3 === 0 || i === filteredData.length - 1;
            const xPos = padding.left + i * xStep;
            return (
              showLabel && (
                <text
                  key={d.day}
                  x={xPos}
                  y={svgHeight - padding.bottom + 18}
                  textAnchor="middle"
                  className="fill-stone-500 text-[10px] font-sans"
                >
                  D{d.day}
                </text>
              )
            );
          })}
        </svg>

        {/* Live Hover Tooltip */}
        {activeHoverDay && (
          <div className="mt-3 p-3 bg-stone-900 text-white rounded-xl text-xs flex flex-wrap items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-400" />
              <span className="font-bold">
                Day {activeHoverDay.day} ({activeHoverDay.date})
              </span>
              {activeHoverDay.isBaseline && (
                <span className="bg-emerald-950 text-emerald-300 text-[10px] px-2 py-0.5 rounded-full font-semibold">
                  Baseline Period
                </span>
              )}
            </div>

            <div className="flex items-center gap-4 text-stone-200">
              <span>
                BP: <strong className="text-white">{activeHoverDay.systolic}/{activeHoverDay.diastolic} mmHg</strong>
              </span>
              <span>
                HR: <strong className="text-white">{activeHoverDay.heartRate} bpm</strong>
              </span>
              <span>
                Sleep: <strong className="text-white">{activeHoverDay.sleepHours} hrs</strong>
              </span>
              <span>
                Adherence: <strong className="text-white">{activeHoverDay.adherenceRate}%</strong>
              </span>
            </div>

            {activeHoverDay.isFlagged && (
              <button
                onClick={() => setExplainingFlag(activeHoverDay)}
                className="text-amber-300 hover:text-amber-200 underline text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                Why was this flagged?
              </button>
            )}
          </div>
        )}
      </div>

      {/* Legend & Transparent Explanations */}
      <div className="mt-4 pt-3 border-t border-stone-200 flex flex-wrap items-center justify-between text-xs text-stone-600 gap-3">
        <div className="flex items-center gap-4">
          {selectedMetric === 'bp' ? (
            <>
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-3 h-1 bg-red-600 rounded"></span> Systolic BP
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-3 h-1 bg-blue-600 rounded"></span> Diastolic BP
              </span>
            </>
          ) : (
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-3 h-1 bg-emerald-600 rounded"></span> {title}
            </span>
          )}
          {normalRangeBand && (
            <span className="flex items-center gap-1.5 text-emerald-800">
              <span className="w-3 h-2 bg-emerald-100 border border-emerald-400 rounded"></span>
              {normalRangeBand.label}
            </span>
          )}
        </div>

        <div className="text-stone-500 flex items-center gap-1 text-[11px]">
          <Info className="w-3.5 h-3.5 text-stone-400" />
          <span>Click any marker to inspect day-by-day logs & events</span>
        </div>
      </div>

      {/* "Why was this flagged?" Modal Modal */}
      {explainingFlag && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-stone-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-2 text-amber-800 font-bold text-base">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <span>Transparent Flag Audit — Day {explainingFlag.day}</span>
            </div>

            <div className="mt-4 space-y-3 text-sm text-stone-700">
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                <p className="font-semibold text-amber-950">{explainingFlag.flagReason}</p>
              </div>

              <div className="text-xs space-y-1.5 text-stone-600">
                <p>
                  <strong>Clinical Logic:</strong> Evaluated by automated deterministic rule against the patient's personalized 10-day baseline.
                </p>
                <p>
                  <strong>Systolic Reading:</strong> {explainingFlag.systolic} mmHg (Baseline: 122 mmHg, Delta: +{explainingFlag.systolic - 122} mmHg).
                </p>
                <p>
                  <strong>Adherence:</strong> {explainingFlag.adherenceRate}% • <strong>Check-in status:</strong> {explainingFlag.checkInCompleted ? 'Completed' : 'Missed'}.
                </p>
                {explainingFlag.eventMarker && (
                  <p>
                    <strong>Event Recorded:</strong> {explainingFlag.eventMarker}
                  </p>
                )}
              </div>

              <p className="text-[11px] text-stone-500 italic">
                Note: Flags are clinical observations for physician and caregiver review. They do not constitute an automated medical diagnosis.
              </p>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setExplainingFlag(null)}
                className="px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-bold hover:bg-stone-800 transition-colors"
              >
                Close Audit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
