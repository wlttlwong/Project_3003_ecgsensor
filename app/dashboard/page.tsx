import Link from "next/link";
import { useMemo, useState, useEffect, useCallback } from "react";
import {
  loadSessions,
  saveSessions,
  clearSessions,
  filterBySessionType,
  computePeriodStats,
  compareHrvWeekOverWeek,
  sampleSessions,
  sessionsInCurrentWeekSorted,
} from "../lib/sessions";
import {
  SESSION_TYPES,
  SESSION_TYPE_LABELS,
  type SessionType,
  type SessionRecord,
} from "../types/session";
import { formatApproxHrZone } from "../lib/hrZones";
import { getStressLevel, getStressCellClasses, type StressLevel } from "../lib/stress";

type CalendarMode = "weekly" | "monthly" | "yearly";

const WEEKDAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];
const HOUR_MARKERS = [0, 6, 12, 18];

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function addDays(d: Date, days: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
}

function addMonths(d: Date, months: number): Date {
  const x = new Date(d);
  x.setMonth(x.getMonth() + months);
  return x;
}

function addYears(d: Date, years: number): Date {
  const x = new Date(d);
  x.setFullYear(x.getFullYear() + years);
  return x;
}

function startOfWeekMonday(d: Date): Date {
  const x = startOfDay(d);
  const day = x.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  return addDays(x, diff);
}

function getRangeForMode(mode: CalendarMode, anchor: Date): { start: Date; end: Date } {
  if (mode === "weekly") {
    const start = startOfWeekMonday(anchor);
    return { start, end: addDays(start, 7) };
  }
  if (mode === "monthly") {
    const start = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
    const end = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 1);
    return { start, end };
  }
  const start = new Date(anchor.getFullYear(), 0, 1);
  const end = new Date(anchor.getFullYear() + 1, 0, 1);
  return { start, end };
}

function formatRangeLabel(mode: CalendarMode, start: Date, end: Date): string {
  if (mode === "weekly") {
    const endInclusive = addDays(end, -1);
    return `${start.toLocaleDateString(undefined, {
      day: "2-digit",
      month: "short",
    })} - ${endInclusive.toLocaleDateString(undefined, {
      day: "2-digit",
      month: "short",
    })}`;
  }
  if (mode === "monthly") {
    return start.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  }
  return start.toLocaleDateString(undefined, { year: "numeric" });
}

function weekdayIndexMonday(d: Date): number {
  return (d.getDay() + 6) % 7;
}

function toHeatLevel(v: number, max: number): number {
  if (v <= 0 || max <= 0) return 0;
  const ratio = v / max;
  if (ratio < 0.25) return 1;
  if (ratio < 0.5) return 2;
  if (ratio < 0.75) return 3;
  return 4;
}

function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

const ACTIVITY_ICONS: Record<SessionType, string> = {
  walking: "👟",
  jogging: "🏃",
  cycling: "🚴",
  rest: "🧘",
};

function activityIcon(type: SessionType): string {
  return ACTIVITY_ICONS[type] ?? "●";
}

function HrSparkline({ values }: { values: number[] }) {
  const w = 280;
  const h = 56;
  const pad = 4;
  if (values.length === 0) {
    return (
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="w-full h-14 text-emerald-200"
        preserveAspectRatio="none"
        aria-hidden
      >
        <line
          x1={pad}
          y1={h / 2}
          x2={w - pad}
          y2={h / 2}
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray="6 4"
        />
      </svg>
    );
  }
  const min = Math.min(...values, 40);
  const max = Math.max(...values, min + 1);
  const pts = values.map((v, i) => {
    const x = pad + (i / Math.max(values.length - 1, 1)) * (w - pad * 2);
    const y = h - pad - ((v - min) / (max - min)) * (h - pad * 2);
    return `${x},${y}`;
  });
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="w-full h-14 text-emerald-500"
      preserveAspectRatio="none"
      aria-hidden
    >
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        points={pts.join(" ")}
      />
    </svg>
  );
}

function PlaceholderProgressChart() {
  const w = 400;
  const h = 100;
  const path =
    "M0,80 Q80,20 160,60 T320,40 T400,70";
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="w-full max-w-md mx-auto h-24 text-slate-300"
      aria-hidden
    >
      <path
        d={path}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeDasharray="8 6"
        opacity={0.5}
      />
    </svg>
  );
}

function EcgPlaceholder() {
  const w = 320;
  const h = 80;
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="w-full h-20 text-emerald-600"
      aria-hidden
    >
      <path
        d="M0,40 L40,40 L48,20 L56,60 L64,35 L72,45 L80,40 L120,40 L128,15 L136,65 L144,38 L152,42 L160,40 L200,40 L208,25 L216,55 L224,40 L280,40 L288,10 L296,70 L304,40 L320,40"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function DashboardPage() {
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [filterType, setFilterType] = useState<SessionType | "all">("all");
  const [mounted, setMounted] = useState(false);
  const [detail, setDetail] = useState<SessionRecord | null>(null);
  const [calendarMode, setCalendarMode] = useState<CalendarMode>("weekly");
  const [calendarAnchor, setCalendarAnchor] = useState<Date>(new Date());
  const [sensorStatus, setSensorStatus] = useState<
    "checking" | "disconnected" | "connected" | "unsupported"
  >("checking");
  const [showCalibrationModal, setShowCalibrationModal] = useState(false);

  const refreshSessions = useCallback(() => {
    setSessions(loadSessions());
  }, []);

  useEffect(() => {
    setMounted(true);
    refreshSessions();
  }, [refreshSessions]);

  useEffect(() => {
    let cancelled = false;
    async function bt() {
      const nav = navigator as Navigator & {
        bluetooth?: { getDevices?: () => Promise<{ gatt?: { connected: boolean } }[]> };
      };
      if (!nav.bluetooth?.getDevices) {
        if (!cancelled) setSensorStatus("unsupported");
        return;
      }
      try {
        const devices = await nav.bluetooth.getDevices();
        const connected = devices.some((d) => d.gatt?.connected);
        if (!cancelled) setSensorStatus(connected ? "connected" : "disconnected");
      } catch {
        if (!cancelled) setSensorStatus("disconnected");
      }
    }
    void bt();
    const id = window.setInterval(bt, 5000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  const filtered = useMemo(
    () => filterBySessionType(sessions, filterType),
    [sessions, filterType]
  );
  const calendarRange = useMemo(
    () => getRangeForMode(calendarMode, calendarAnchor),
    [calendarMode, calendarAnchor]
  );
  const calendarSessions = useMemo(
    () =>
      filtered.filter((s) => {
        const t = new Date(s.startedAt).getTime();
        return (
          t >= calendarRange.start.getTime() && t < calendarRange.end.getTime()
        );
      }),
    [filtered, calendarRange]
  );
  const heatmap = useMemo(() => {
    const buckets = Array.from({ length: 7 }, () => Array(24).fill(0));
    let max = 0;
    for (const s of calendarSessions) {
      const d = new Date(s.startedAt);
      const row = weekdayIndexMonday(d);
      const col = d.getHours();
      const contribution = Math.max(1, Math.round((s.avgHr ?? 80) / 30));
      buckets[row][col] += contribution;
      max = Math.max(max, buckets[row][col]);
    }
    return { buckets, max };
  }, [calendarSessions]);

  const weekSessions = useMemo(
    () => sessionsInCurrentWeekSorted(filtered, new Date()),
    [filtered]
  );

  const statsWeek = useMemo(
    () => computePeriodStats(weekSessions),
    [weekSessions]
  );

  const sparkHr = useMemo(
    () => weekSessions.map((s) => s.avgHr ?? 0).filter((v) => v > 0),
    [weekSessions]
  );

  // Stats for the selected calendar period (weekly/monthly/yearly)
  const statsPeriod = useMemo(
    () => computePeriodStats(calendarSessions),
    [calendarSessions]
  );

  const hrvInsight = useMemo(
    () => compareHrvWeekOverWeek(sessions, new Date()),
    [sessions]
  );

  const insightBody = useMemo(() => {
    if (sessions.length === 0) {
      return "Log your first session to unlock personalized endurance recommendations based on your heart rate zones and HRV trend.";
    }
    return hrvInsight.message;
  }, [sessions.length, hrvInsight.message]);

  const hrvMetrics = useMemo(() => {
    const stats = computePeriodStats(calendarSessions);
    const hrvValues = calendarSessions
      .map((s) => s.avgHrvMs)
      .filter((v): v is number => v != null);
    const maxHrv = hrvValues.length > 0 ? Math.max(...hrvValues) : null;
    const minHrv = hrvValues.length > 0 ? Math.min(...hrvValues) : null;
    return {
      averageHrv: stats.avgHrvMs,
      maxHrv,
      minHrv,
    };
  }, [calendarSessions]);

  const bestDay = useMemo(() => {
    if (calendarSessions.length === 0) return null;
    let best = calendarSessions[0];
    for (const s of calendarSessions) {
      if ((s.avgHrvMs ?? 0) > (best.avgHrvMs ?? 0)) {
        best = s;
      }
    }
    return best.startedAt;
  }, [calendarSessions]);

  const worstDay = useMemo(() => {
    if (calendarSessions.length === 0) return null;
    let worst = calendarSessions[0];
    for (const s of calendarSessions) {
      if ((s.avgHrvMs ?? 0) < (worst.avgHrvMs ?? 0)) {
        worst = s;
      }
    }
    return worst.startedAt;
  }, [calendarSessions]);

  const restingHr = useMemo(() => {
    if (calendarSessions.length === 0) return null;
    const avgHrs = calendarSessions
      .map((s) => s.avgHr)
      .filter((v): v is number => v != null);
    if (avgHrs.length === 0) return null;
    return avgHrs.reduce((a, b) => a + b, 0) / avgHrs.length;
  }, [calendarSessions]);

  // Enhanced personalized insight with stress-based recommendations
  const enhancedInsightBody = useMemo(() => {
    if (sessions.length === 0) {
      return "Log your first session to unlock personalized endurance recommendations based on your heart rate zones and HRV trend.";
    }
    
    let baseMessage = hrvInsight.message;
    
    // Add personalized recommendation based on current stress level
    const currentStress = getStressLevel(hrvMetrics.averageHrv);
    let recommendation = "";
    
    if (currentStress.level === "low") {
      recommendation = " Your recovery is excellent — this is a great time to push a challenging workout session.";
    } else if (currentStress.level === "moderate") {
      recommendation = " Keep building endurance at this pace. Consider mixing steady-state and interval training.";
    } else if (currentStress.level === "high") {
      recommendation = " Your body is under elevated stress — consider a lighter session or active recovery like walking.";
    } else if (currentStress.level === "very_high") {
      recommendation = " Prioritize rest and recovery. Light stretching or mobility work would be ideal today.";
    }
    
    return baseMessage + recommendation;
  }, [sessions.length, hrvInsight.message, hrvMetrics.averageHrv]);

  const loadSamples = () => {
    const merged = [...sampleSessions(), ...loadSessions()];
    saveSessions(merged);
    refreshSessions();
  };

  const handleClear = () => {
    clearSessions();
    setSessions([]);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#F0F9FF] to-white p-6">
        <p className="text-slate-600">Loading dashboard…</p>
      </div>
    );
  }

  const statusLabel =
    sensorStatus === "connected"
      ? "Connected — ready to track"
      : sensorStatus === "disconnected"
        ? "ECG sensor: disconnected"
        : sensorStatus === "unsupported"
          ? "Bluetooth status unavailable in this browser"
          : "Checking sensor…";
  const calendarLabel = formatRangeLabel(
    calendarMode,
    calendarRange.start,
    calendarRange.end
  );
  const moveCalendar = (dir: -1 | 1) => {
    setCalendarAnchor((prev) => {
      if (calendarMode === "weekly") return addDays(prev, dir * 7);
      if (calendarMode === "monthly") return addMonths(prev, dir);
      return addYears(prev, dir);
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F0F9FF] via-white to-slate-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8">
        {/* Header */}
        <header className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2 max-w-xl">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
              Dashboard
            </h1>
            <p className="text-slate-600 text-base sm:text-lg">
              Real-time ECG heart rate monitoring — personalized fitness insights
              for walking, jogging, and cycling.
            </p>
            <div className="flex items-center gap-2 text-sm">
              <span
                className={`inline-block h-2.5 w-2.5 rounded-full ${
                  sensorStatus === "connected"
                    ? "bg-emerald-500"
                    : sensorStatus === "checking"
                      ? "bg-amber-400 animate-pulse"
                      : "bg-slate-400"
                }`}
                aria-hidden
              />
              <span className="text-slate-600">{statusLabel}</span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto lg:min-w-[320px]">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-6 py-3.5 shadow-lg shadow-emerald-500/25 transition text-center"
            >
              <svg
                className="w-5 h-5 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              Start live monitoring
            </Link>
            <button
              type="button"
              onClick={loadSamples}
              className="inline-flex items-center justify-center rounded-xl border-2 border-slate-200 bg-white text-slate-800 font-medium px-5 py-3.5 hover:bg-slate-50 transition"
            >
              Load sample data
            </button>
            {sessions.length > 0 && (
              <button
                type="button"
                onClick={handleClear}
                className="inline-flex items-center justify-center text-red-600 hover:text-red-700 text-sm font-medium py-2"
              >
                Clear all sessions
              </button>
            )}
          </div>
        </header>

        {/* Calibration Status Box */}
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="text-2xl">✓</span>
            <div>
              <p className="font-semibold text-emerald-900 text-sm">Calibration Status</p>
              <p className="text-xs text-emerald-700 mt-1">Signal quality is good. Ready to start monitoring.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowCalibrationModal(true)}
            className="text-xs font-medium text-emerald-700 hover:text-emerald-900 whitespace-nowrap px-2 py-1 rounded hover:bg-emerald-100 transition"
          >
            How to calibrate →
          </button>
        </div>

        {/* Trends Section + Overview Grid */}
        {sessions.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Trends Section - Left */}
            <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Trend</h2>
                
                {/* Time Period Selector */}
                <div className="flex flex-wrap items-center gap-3 mb-6">
                  {(["weekly", "monthly", "yearly"] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setCalendarMode(mode)}
                      className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                        calendarMode === mode
                          ? "bg-slate-900 text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {mode[0].toUpperCase() + mode.slice(1)}
                    </button>
                  ))}
                </div>

                {/* Date Range and Navigation */}
                <div className="flex items-center justify-between mb-6 gap-4">
                  <p className="text-base font-semibold text-slate-700">{calendarLabel}</p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => moveCalendar(-1)}
                      className="h-10 w-10 rounded-full bg-slate-700 hover:bg-slate-800 text-white flex items-center justify-center transition"
                      aria-label="Previous range"
                    >
                      ‹
                    </button>
                    <button
                      type="button"
                      onClick={() => moveCalendar(1)}
                      className="h-10 w-10 rounded-full bg-slate-700 hover:bg-slate-800 text-white flex items-center justify-center transition"
                      aria-label="Next range"
                    >
                      ›
                    </button>
                  </div>
                </div>

                {/* Main HRV Metric */}
                <div className="mb-6">
                  <p className="text-5xl font-bold text-slate-900 mb-2">
                    {hrvMetrics.averageHrv != null
                      ? `${Math.round(hrvMetrics.averageHrv)} ms`
                      : "— ms"}
                  </p>
                  <p className="text-base text-slate-600 mb-3">
                    {calendarMode === "weekly"
                      ? "Weekly"
                      : calendarMode === "monthly"
                      ? "Monthly"
                      : "Yearly"}{" "}
                    Average HRV
                  </p>
                  <p className="text-xs text-slate-500 px-3 py-2 bg-slate-50 rounded border border-slate-200">
                    💡 <strong>Higher HRV</strong> = better recovery &amp; endurance. <strong>Lower HRV</strong> = fatigue or stress.
                  </p>
                </div>

                {/* Stress Score Card */}
                <div className={`rounded-2xl p-6 space-y-6 mb-6 ${
                  getStressLevel(hrvMetrics.averageHrv).bgColor
                } border-l-4 ${
                  hrvMetrics.averageHrv == null
                    ? "border-l-slate-300"
                    : hrvMetrics.averageHrv > 60
                    ? "border-l-emerald-500"
                    : hrvMetrics.averageHrv >= 30
                    ? "border-l-amber-500"
                    : hrvMetrics.averageHrv >= 15
                    ? "border-l-orange-500"
                    : "border-l-red-500"
                }`}>
                  <div>
                    <h3 className={`text-lg font-semibold flex items-center gap-2 ${getStressLevel(hrvMetrics.averageHrv).color}`}>
                      <span>{getStressLevel(hrvMetrics.averageHrv).emoji}</span> {getStressLevel(hrvMetrics.averageHrv).label}
                    </h3>
                  </div>

                  <p className="text-sm text-slate-700">
                    {getStressLevel(hrvMetrics.averageHrv).description}
                  </p>

                  {/* HRV Range */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-300">
                    <div>
                      <p className="text-xs font-semibold text-slate-600 mb-2">Max HRV</p>
                      <p className="text-2xl font-bold text-slate-900">
                        {hrvMetrics.maxHrv != null ? `${Math.round(hrvMetrics.maxHrv)}` : "—"}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">ms</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-600 mb-2">Min HRV</p>
                      <p className="text-2xl font-bold text-slate-900">
                        {hrvMetrics.minHrv != null ? `${Math.round(hrvMetrics.minHrv)}` : "—"}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">ms</p>
                    </div>
                  </div>

                  {/* Best and Worst Day */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-300">
                    <div>
                      <p className="text-xs font-semibold text-slate-600 mb-2">Best Day</p>
                      <p className="text-lg font-bold text-slate-900">
                        {bestDay ? new Date(bestDay).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-600 mb-2">Worst Day</p>
                      <p className="text-lg font-bold text-slate-900">
                        {worstDay ? new Date(worstDay).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "—"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Resting Heart Rate */}
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                  <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2 mb-4">
                    <span>❤️</span> Resting Heart Rate
                  </h3>
                  <p className="text-3xl font-bold text-slate-900">
                    {restingHr != null ? `${Math.round(restingHr)} bpm` : "—"}
                  </p>
                  <p className="text-sm text-slate-600 mt-2">
                    Average resting heart rate this {calendarMode === "weekly" ? "week" : calendarMode}
                  </p>
                </div>
              </div>
            </section>

            {/* Overview Section - Right */}
            <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-4">
              <div className="rounded-2xl bg-slate-950 text-white p-4 sm:p-5">
                <p className="text-lg font-semibold mb-3">Hourly overview</p>
                <div className="overflow-x-auto">
                  <div className="min-w-[560px] space-y-2">
                    <div className="grid grid-cols-[20px_repeat(24,minmax(0,1fr))] gap-1 text-[10px] text-slate-400">
                      <span />
                      {Array.from({ length: 24 }, (_, h) => (
                        <span key={h} className="text-center">
                          {HOUR_MARKERS.includes(h) ? String(h).padStart(2, "0") : ""}
                        </span>
                      ))}
                    </div>
                    {WEEKDAY_LABELS.map((label, row) => (
                      <div
                        key={`${label}-${row}`}
                        className="grid grid-cols-[20px_repeat(24,minmax(0,1fr))] gap-1 items-center"
                      >
                        <span className="text-xs text-slate-300 text-center">{label}</span>
                        {Array.from({ length: 24 }, (_, col) => {
                          const level = toHeatLevel(
                            heatmap.buckets[row][col],
                            heatmap.max
                          );
                          const tone =
                            level === 0
                              ? "bg-slate-800"
                              : level === 1
                              ? "bg-emerald-900"
                              : level === 2
                              ? "bg-emerald-700"
                              : level === 3
                              ? "bg-emerald-500"
                              : "bg-sky-400";
                          return (
                            <div
                              key={`${row}-${col}`}
                              className={`h-2.5 rounded ${tone}`}
                              title={`${label} ${String(col).padStart(2, "0")}:00`}
                            />
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
                <p className="mt-3 text-xs text-slate-400">
                  Heat intensity reflects session load by time slot in the selected range.
                </p>
              </div>

              {/* Today's insight */}
              <div className="rounded-2xl border border-slate-200/80 bg-slate-50 p-5">
                <h2 className="text-lg font-semibold text-slate-900 mb-2">
                  Today&apos;s insight
                </h2>
                <p className="text-slate-700 leading-relaxed text-sm">{enhancedInsightBody}</p>
                {sessions.length > 0 && hrvInsight.percentChangeVsLastWeek != null && (
                  <p className="mt-4 text-lg font-semibold text-emerald-700">
                    {hrvInsight.percentChangeVsLastWeek >= 0 ? "+" : ""}
                    {Math.round(hrvInsight.percentChangeVsLastWeek * 10) / 10}%
                    <span className="text-slate-600 text-sm font-normal ml-2">
                      vs last week (average HRV)
                    </span>
                  </p>
                )}
              </div>
            </section>
          </div>
        )}

        <p
          className="text-xs text-amber-900 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3"
          role="note"
        >
          Course prototype — not for medical diagnosis. Heart rate zones are
          approximate; confirm with your instructor or a sports professional.
        </p>

        {/* Hero — empty state */}
        {sessions.length === 0 && (
          <section className="relative overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-md shadow-slate-200/50">
            <div
              className="absolute inset-0 opacity-[0.12] pointer-events-none"
              aria-hidden
            >
              <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 400 120">
                <path
                  d="M0,60 Q50,20 100,60 T200,60 T300,60 T400,60"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="3"
                />
                <path
                  d="M0,70 Q80,40 160,70 T320,70 T400,70"
                  fill="none"
                  stroke="#0ea5e9"
                  strokeWidth="2"
                />
              </svg>
            </div>
            <div className="relative px-6 py-10 sm:px-10 text-center space-y-5">
              <h2 className="text-xl sm:text-2xl font-semibold text-slate-900">
                Ready to optimize your workout?
              </h2>
              <p className="text-slate-600 max-w-lg mx-auto">
                Connect your ECG sensor and start a session — walking, jogging,
                or cycling — to see heart rate trends and recovery insights here.
              </p>
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-8 py-4 text-lg shadow-lg shadow-emerald-500/30 transition"
              >
                Connect ECG &amp; start session
              </Link>
            </div>
          </section>
        )}

        {/* Current week + metrics */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">
            This week overview
          </h2>
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
              <span className="text-sm font-medium text-slate-500">
                Avg HR trend (this week)
              </span>
              <span className="text-xs text-slate-400">
                Mon–Sun · filtered view
              </span>
            </div>
            <HrSparkline values={sparkHr} />
            {sparkHr.length === 0 && (
              <p className="text-xs text-slate-400 mt-2">
                Complete a session with HR data to see your sparkline.
              </p>
            )}
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-thin">
            <MetricPill
              label="Total sessions"
              value={String(statsWeek.sessionCount)}
              tone="neutral"
            />
            <MetricPill
              label="Active minutes"
              value={`${statsWeek.totalDurationMin}`}
              suffix=" min"
              tone="neutral"
            />
            <MetricPill
              label="Avg heart rate"
              value={
                statsWeek.avgHr != null ? `${Math.round(statsWeek.avgHr)}` : "—"
              }
              suffix={statsWeek.avgHr != null ? " bpm" : ""}
              tone={hrTone(statsWeek.avgHr)}
            />
            <MetricPill
              label="Peak heart rate"
              value={
                statsWeek.maxHr != null ? `${statsWeek.maxHr}` : "—"
              }
              suffix={statsWeek.maxHr != null ? " bpm" : ""}
              tone={hrTone(statsWeek.maxHr)}
            />
            <MetricPill
              label="Avg HRV"
              value={
                statsWeek.avgHrvMs != null
                  ? `${Math.round(statsWeek.avgHrvMs)}`
                  : "—"
              }
              suffix={statsWeek.avgHrvMs != null ? " ms" : ""}
              tone={hrvTone(statsWeek.avgHrvMs, hrvInsight.percentChangeVsLastWeek)}
            />
          </div>
        </section>

        {/* Filter chips + table */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">Past sessions</h2>
          <div className="flex flex-wrap gap-2">
            <FilterChip
              active={filterType === "all"}
              onClick={() => setFilterType("all")}
            >
              All
            </FilterChip>
            {SESSION_TYPES.map((t) => (
              <FilterChip
                key={t}
                active={filterType === t}
                onClick={() => setFilterType(t)}
              >
                {SESSION_TYPE_LABELS[t]}
              </FilterChip>
            ))}
          </div>
          <label className="sr-only" htmlFor="session-type-select">
            Filter by session type
          </label>
          <select
            id="session-type-select"
            className="sm:hidden w-full border border-slate-200 rounded-lg px-3 py-2 text-slate-800 bg-white"
            value={filterType}
            onChange={(e) =>
              setFilterType(e.target.value as SessionType | "all")
            }
          >
            <option value="all">All types</option>
            {SESSION_TYPES.map((t) => (
              <option key={t} value={t}>
                {SESSION_TYPE_LABELS[t]}
              </option>
            ))}
          </select>

          <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left min-w-[720px]">
                <thead className="bg-slate-50 text-slate-500 uppercase text-xs tracking-wide">
                  <tr>
                    <th className="px-3 py-3 w-12"> </th>
                    <th className="px-3 py-3">Date &amp; time</th>
                    <th className="px-3 py-3">Activity</th>
                    <th className="px-3 py-3">Duration</th>
                    <th className="px-3 py-3">HR avg / max</th>
                    <th className="px-3 py-3">HR zone</th>
                    <th className="px-3 py-3">Avg HRV</th>
                    <th className="px-3 py-3">Summary</th>
                    <th className="px-3 py-3"> </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td
                        colSpan={9}
                        className="px-4 py-10 text-center text-slate-500"
                      >
                        No sessions match this filter. Start live monitoring or
                        load sample data.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((s) => (
                      <tr
                        key={s.id}
                        className="border-t border-slate-100 hover:bg-slate-50/80"
                      >
                        <td className="px-3 py-3 text-center text-xl" title={SESSION_TYPE_LABELS[s.sessionType]}>
                          {activityIcon(s.sessionType)}
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap text-slate-800">
                          {formatDateTime(s.startedAt)}
                        </td>
                        <td className="px-3 py-3 text-slate-700">
                          {SESSION_TYPE_LABELS[s.sessionType]}
                        </td>
                        <td className="px-3 py-3 tabular-nums text-slate-800">
                          {formatDuration(s.durationSec)}
                        </td>
                        <td className="px-3 py-3 tabular-nums">
                          <span className="text-slate-800">{s.avgHr ?? "—"}</span>
                          <span className="text-slate-400"> / </span>
                          <span className="text-slate-600">{s.maxHr ?? "—"}</span>
                        </td>
                        <td className="px-3 py-3 text-slate-700 text-xs max-w-[140px]">
                          {formatApproxHrZone(s)}
                        </td>
                        <td className="px-3 py-3 tabular-nums text-slate-800">
                          {s.avgHrvMs != null
                            ? `${Math.round(s.avgHrvMs)} ms`
                            : "—"}
                        </td>
                        <td className="px-3 py-3">
                          {(() => {
                            const stressClasses = getStressCellClasses(s.avgHrvMs);
                            return (
                              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${stressClasses.bgClass} ${stressClasses.textClass} ${stressClasses.borderClass}`}>
                                {s.stressSummary}
                              </span>
                            );
                          })()}
                        </td>
                        <td className="px-3 py-3">
                          <button
                            type="button"
                            onClick={() => setDetail(s)}
                            className="text-emerald-600 hover:text-emerald-700 font-medium whitespace-nowrap"
                          >
                            View details
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Progress teaser */}
        <section className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 p-8 text-center space-y-3">
          <h2 className="text-base font-semibold text-slate-700">
            Your progress over time
          </h2>
          <PlaceholderProgressChart />
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            After 3+ sessions, your group can plot cardiovascular fitness trends
            here (e.g. resting HR, HRV, or time in zone).
          </p>
        </section>
      </div>

      {detail && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="session-detail-title"
        >
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 space-y-4 border border-slate-200">
            <div className="flex justify-between items-start gap-4">
              <div>
                <h2 id="session-detail-title" className="text-xl font-semibold text-slate-900">
                  Session details
                </h2>
                <p className="text-sm text-slate-500">
                  {formatDateTime(detail.startedAt)} ·{" "}
                  {SESSION_TYPE_LABELS[detail.sessionType]}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDetail(null)}
                className="text-slate-400 hover:text-slate-600 text-2xl leading-none"
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
              <p className="text-xs font-medium text-slate-500 mb-2">
                ECG waveform (placeholder)
              </p>
              <EcgPlaceholder />
              <p className="text-xs text-slate-400 mt-2">
                When your pipeline stores ECG snippets per session, render the
                real trace here.
              </p>
            </div>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-slate-500">Duration</dt>
                <dd className="font-medium text-slate-900">
                  {formatDuration(detail.durationSec)}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Avg / max HR</dt>
                <dd className="font-medium text-slate-900">
                  {detail.avgHr ?? "—"} / {detail.maxHr ?? "—"} bpm
                </dd>
              </div>
              <div className="col-span-2">
                <dt className="text-slate-500">Approx. HR zone</dt>
                <dd className="font-medium text-slate-900">
                  {formatApproxHrZone(detail)}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Avg HRV</dt>
                <dd className="font-medium text-slate-900">
                  {detail.avgHrvMs != null
                    ? `${Math.round(detail.avgHrvMs)} ms`
                    : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Summary</dt>
                <dd className="font-medium text-slate-900">
                  {detail.stressSummary}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      )}

      {/* Calibration Instructions Modal */}
      {showCalibrationModal && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="calibration-title"
        >
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 space-y-4 border border-slate-200">
            <div className="flex justify-between items-start gap-4">
              <div>
                <h2 id="calibration-title" className="text-xl font-semibold text-slate-900">
                  How to Calibrate
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Step-by-step calibration guide for accurate heart rate measurement
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCalibrationModal(false)}
                className="text-slate-400 hover:text-slate-600 text-2xl leading-none"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-4">
                <h3 className="font-semibold text-emerald-900 mb-2">✓ Good Signal Indicators</h3>
                <ul className="space-y-2 text-emerald-800 text-xs">
                  <li>• Heart rate line is steady and smooth</li>
                  <li>• No sudden jumps or drops in readings</li>
                  <li>• Consistent signal for 30+ seconds</li>
                  <li>• Sensor shows stable contact with skin</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-slate-900">Calibration Steps</h3>
                <ol className="space-y-3 text-slate-700">
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-200 text-slate-900 flex items-center justify-center text-xs font-semibold">1</span>
                    <span><strong>Prepare:</strong> Sit quietly for 30-60 seconds in a relaxed position.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-200 text-slate-900 flex items-center justify-center text-xs font-semibold">2</span>
                    <span><strong>Position:</strong> Place your fingers on the camera lens and ensure steady contact.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-200 text-slate-900 flex items-center justify-center text-xs font-semibold">3</span>
                    <span><strong>Light:</strong> Ensure adequate room lighting (avoid direct sunlight on the lens).</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-200 text-slate-900 flex items-center justify-center text-xs font-semibold">4</span>
                    <span><strong>Wait:</strong> Hold still while the signal stabilizes (typically 10-15 seconds).</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-200 text-slate-900 flex items-center justify-center text-xs font-semibold">5</span>
                    <span><strong>Verify:</strong> Check that the heart rate value appears steady and reasonable (40-180 bpm).</span>
                  </li>
                </ol>
              </div>

              <div className="rounded-lg bg-amber-50 border border-amber-200 p-4">
                <h3 className="font-semibold text-amber-900 mb-2">⚠️ Poor Signal Tips</h3>
                <ul className="space-y-2 text-amber-800 text-xs">
                  <li>• Clean lens with a soft cloth if image is blurry</li>
                  <li>• Ensure fingers are not too dry or wet</li>
                  <li>• Avoid moving or talking during calibration</li>
                  <li>• If signal unstable, try again in 30 seconds</li>
                </ul>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowCalibrationModal(false)}
              className="w-full mt-4 px-4 py-2 rounded-lg bg-emerald-500 text-white font-medium hover:bg-emerald-600 transition"
            >
              Got it, close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function FilterChip({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`snap-start shrink-0 rounded-full px-4 py-2 text-sm font-medium transition border ${
        active
          ? "bg-emerald-500 text-white border-emerald-500 shadow-sm"
          : "bg-white text-slate-700 border-slate-200 hover:border-emerald-300"
      }`}
    >
      {children}
    </button>
  );
}

function MetricPill({
  label,
  value,
  suffix = "",
  tone,
}: {
  label: string;
  value: string;
  suffix?: string;
  tone: "neutral" | "good" | "moderate" | "intense";
}) {
  const border =
    tone === "good"
      ? "border-emerald-200 bg-emerald-50/80"
      : tone === "moderate"
        ? "border-amber-200 bg-amber-50/80"
        : tone === "intense"
          ? "border-red-200 bg-red-50/80"
          : "border-slate-200 bg-white";
  return (
    <div
      className={`snap-start shrink-0 min-w-[140px] rounded-xl border px-4 py-3 shadow-sm ${border}`}
    >
      <p className="text-xs font-medium text-slate-500 mb-1">{label}</p>
      <p className="text-xl font-bold text-slate-900 tabular-nums">
        {value}
        {suffix && <span className="text-sm font-semibold">{suffix}</span>}
      </p>
    </div>
  );
}

function hrTone(hr: number | null): "neutral" | "good" | "moderate" | "intense" {
  if (hr == null) return "neutral";
  if (hr < 100) return "good";
  if (hr <= 130) return "moderate";
  return "intense";
}

function hrvTone(
  hrv: number | null,
  pct: number | null
): "neutral" | "good" | "moderate" | "intense" {
  if (hrv == null) return "neutral";
  if (pct != null && pct >= 5) return "good";
  if (hrv >= 40) return "good";
  if (hrv >= 30) return "moderate";
  return "neutral";
}
