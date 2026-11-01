import { TimelineDayData } from '../types';

export function generate30DayTimelineData(): TimelineDayData[] {
  const data: TimelineDayData[] = [];
  const now = new Date();

  // Baseline averages across first 10 days:
  // Systolic ~122, Diastolic ~80, HR ~72, Sleep ~7.5h, Activity ~45min, Mood ~8, Adherence ~100%, Social ~8

  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dayNum = 30 - i;
    const dateStr = d.toISOString().split('T')[0];

    let systolic = 122;
    let diastolic = 80;
    let heartRate = 72;
    let sleepHours = 7.5;
    let activityMinutes = 45;
    let moodScore = 8;
    let adherenceRate = 100;
    let checkInCompleted = true;
    let socialScore = 8;
    let isFlagged = false;
    let flagReason: string | undefined = undefined;
    let eventMarker: string | undefined = undefined;
    let isMissing = false;

    if (dayNum <= 10) {
      // Days 1-10: Baseline stable period
      systolic = 120 + ((dayNum * 3) % 5);
      diastolic = 78 + (dayNum % 4);
      heartRate = 70 + (dayNum % 5);
      sleepHours = Number((7.2 + (dayNum % 3) * 0.2).toFixed(1));
      activityMinutes = 42 + (dayNum % 8);
      moodScore = 8;
      socialScore = 8;
      if (dayNum === 5) {
        eventMarker = 'Dr. Sharma routine checkup';
      }
    } else if (dayNum <= 20) {
      // Days 11-20: Subtle emerging drift
      systolic = 126 + Math.floor((dayNum - 10) * 1.2);
      diastolic = 82 + Math.floor((dayNum - 10) * 0.6);
      heartRate = 74 + Math.floor((dayNum - 10) * 0.7);
      sleepHours = Number((7.0 - (dayNum - 10) * 0.15).toFixed(1));
      activityMinutes = Math.max(25, 45 - (dayNum - 10) * 2);
      moodScore = Math.max(6, 8 - Math.floor((dayNum - 10) / 4));
      socialScore = Math.max(6, 8 - Math.floor((dayNum - 10) / 3));

      if (dayNum === 14) {
        eventMarker = 'Granddaughter visited (mood peak)';
        moodScore = 9;
        socialScore = 9;
      }
      if (dayNum === 18) {
        isFlagged = true;
        flagReason = 'Systolic BP trend exceeded 134 mmHg (+12 mmHg above baseline)';
      }
    } else if (dayNum <= 26) {
      // Days 21-26: Pronounced deterioration & missed doses
      systolic = 136 + Math.floor((dayNum - 20) * 1.8);
      diastolic = 87 + Math.floor((dayNum - 20) * 0.9);
      heartRate = 81 + Math.floor((dayNum - 20) * 1.1);
      sleepHours = Number((5.8 - (dayNum - 20) * 0.2).toFixed(1));
      activityMinutes = Math.max(15, 25 - (dayNum - 20) * 2);
      moodScore = 5;
      socialScore = 4;

      if (dayNum === 23) {
        adherenceRate = 50; // Missed morning BP dose
        checkInCompleted = false; // Missed check-in
        isFlagged = true;
        flagReason = 'Missed morning Amlodipine & missed 08:30 check-in. Caregiver automated SMS dispatched.';
        eventMarker = 'Missed morning medication';
      }
      if (dayNum === 25) {
        isFlagged = true;
        flagReason = 'Sleep duration dropped to 4.8 hrs with reported night restlessness.';
      }
    } else {
      // Days 27-30: Crisis escalation & recovery
      if (dayNum === 27) {
        systolic = 148;
        diastolic = 94;
        heartRate = 92;
        sleepHours = 4.2;
        activityMinutes = 10;
        moodScore = 3;
        adherenceRate = 50;
        socialScore = 3;
        isFlagged = true;
        flagReason = 'CRITICAL SPIKE: BP 148/94 mmHg + severe dizziness. Emergency SOS triggered & doctor notified.';
        eventMarker = 'Emergency Escalation Triggered';
      } else if (dayNum === 28) {
        // Post emergency intervention by doctor & family
        systolic = 138;
        diastolic = 88;
        heartRate = 84;
        sleepHours = 5.5;
        activityMinutes = 15;
        moodScore = 5;
        adherenceRate = 100;
        socialScore = 6;
        eventMarker = 'Doctor telehealth visit & medication adjusted';
        isFlagged = true;
        flagReason = 'Post-escalation clinical stabilization';
      } else if (dayNum === 29) {
        systolic = 132;
        diastolic = 84;
        heartRate = 78;
        sleepHours = 6.4;
        activityMinutes = 20;
        moodScore = 6;
        adherenceRate = 100;
        socialScore = 7;
        eventMarker = 'Caregiver evening visit';
      } else {
        // Day 30: Today
        systolic = 128;
        diastolic = 82;
        heartRate = 75;
        sleepHours = 6.8;
        activityMinutes = 25;
        moodScore = 7;
        adherenceRate = 100;
        socialScore = 7;
      }
    }

    data.push({
      day: dayNum,
      date: dateStr,
      systolic,
      diastolic,
      heartRate,
      sleepHours,
      activityMinutes,
      moodScore,
      adherenceRate,
      checkInCompleted,
      socialScore,
      isBaseline: dayNum <= 10,
      isFlagged,
      flagReason,
      eventMarker,
      isMissing,
    });
  }

  return data;
}

export interface MetricSummary {
  metricName: string;
  unit: string;
  baselineAvg: number;
  recentAvg: number;
  changeValue: number;
  changePct: number;
  status: 'normal' | 'concerning' | 'critical';
  explanation: string;
}

export function computeBaselineComparison(data: TimelineDayData[]): MetricSummary[] {
  const baselineDays = data.filter((d) => d.day <= 10);
  const recentDays = data.filter((d) => d.day >= 24);

  const calcAvg = (arr: TimelineDayData[], key: keyof TimelineDayData) => {
    const sum = arr.reduce((acc, curr) => acc + (typeof curr[key] === 'number' ? (curr[key] as number) : 0), 0);
    return Math.round((sum / arr.length) * 10) / 10;
  };

  const baseSys = calcAvg(baselineDays, 'systolic');
  const recSys = calcAvg(recentDays, 'systolic');
  const sysDiff = Math.round((recSys - baseSys) * 10) / 10;

  const baseSleep = calcAvg(baselineDays, 'sleepHours');
  const recSleep = calcAvg(recentDays, 'sleepHours');
  const sleepDiff = Math.round((recSleep - baseSleep) * 10) / 10;

  const baseHR = calcAvg(baselineDays, 'heartRate');
  const recHR = calcAvg(recentDays, 'heartRate');
  const hrDiff = Math.round((recHR - baseHR) * 10) / 10;

  const baseAct = calcAvg(baselineDays, 'activityMinutes');
  const recAct = calcAvg(recentDays, 'activityMinutes');
  const actDiff = Math.round((recAct - baseAct) * 10) / 10;

  return [
    {
      metricName: 'Systolic Blood Pressure',
      unit: 'mmHg',
      baselineAvg: baseSys,
      recentAvg: recSys,
      changeValue: sysDiff,
      changePct: Math.round((sysDiff / baseSys) * 100),
      status: sysDiff >= 15 ? 'critical' : sysDiff >= 8 ? 'concerning' : 'normal',
      explanation: `Systolic BP increased by ${sysDiff} mmHg above 30-day baseline over the last 7 days.`,
    },
    {
      metricName: 'Sleep Duration',
      unit: 'hrs/night',
      baselineAvg: baseSleep,
      recentAvg: recSleep,
      changeValue: sleepDiff,
      changePct: Math.round((sleepDiff / baseSleep) * 100),
      status: sleepDiff <= -1.8 ? 'critical' : sleepDiff <= -0.8 ? 'concerning' : 'normal',
      explanation: `Sleep duration fell by ${Math.abs(sleepDiff)} hours/night, triggering restless fatigue warnings.`,
    },
    {
      metricName: 'Resting Heart Rate',
      unit: 'bpm',
      baselineAvg: baseHR,
      recentAvg: recHR,
      changeValue: hrDiff,
      changePct: Math.round((hrDiff / baseHR) * 100),
      status: hrDiff >= 12 ? 'concerning' : 'normal',
      explanation: `Resting pulse climbed ${hrDiff} bpm during periods of elevated systolic pressure.`,
    },
    {
      metricName: 'Daily Physical Activity',
      unit: 'min/day',
      baselineAvg: baseAct,
      recentAvg: recAct,
      changeValue: actDiff,
      changePct: Math.round((actDiff / baseAct) * 100),
      status: actDiff <= -15 ? 'concerning' : 'normal',
      explanation: `Daily walking activity reduced by ${Math.abs(actDiff)} mins/day.`,
    },
  ];
}
