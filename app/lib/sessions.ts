import type { PeriodStats, SessionRecord, SessionType } from "../types/session";

const STORAGE_KEY = "stress_monitor_sessions_v2";

/** Legacy types from earlier prototypes → fitness activity types */
const LEGACY_SESSION_TYPE_MAP: Record<string, SessionType> = {
  walking: "walking",
  jogging: "jogging",
  cycling: "cycling",
  rest: "rest",
  work: "walking",
  exercise: "jogging",
  other: "rest",
};

function parseSessions(raw: string | null): SessionRecord[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isSessionRecord);
  } catch {
    return [];
  }
}

function isSessionRecord(x: unknown): x is SessionRecord {
  if (x === null || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.id === "string" &&
    typeof o.startedAt === "string" &&
    typeof o.endedAt === "string" &&
    typeof o.durationSec === "number" &&
    typeof o.stressSummary === "string" &&
    (o.maxHr === null || typeof o.maxHr === "number") &&
    (o.avgHr === null || typeof o.avgHr === "number") &&
    (o.avgHrvMs === null || typeof o.avgHrvMs === "number") &&
    typeof o.sessionType === "string"
  );
}

function migrateSessionType(raw: string): SessionType {
  return LEGACY_SESSION_TYPE_MAP[raw] ?? "rest";
}

function normalizeRecord(s: SessionRecord): SessionRecord {
  return { ...s, sessionType: migrateSessionType(s.sessionType) };
}

/** Load v2; if empty, one-time migrate from v1 localStorage */
function loadRawSessions(): SessionRecord[] {
  if (typeof window === "undefined") return [];
  let raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const legacy = window.localStorage.getItem("stress_monitor_sessions_v1");
    if (legacy) {
      const parsed = parseSessions(legacy);
      if (parsed.length) {
        const normalized = parsed.map(normalizeRecord);
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
      }
      raw = window.localStorage.getItem(STORAGE_KEY);
    }
  }
  return parseSessions(raw).map(normalizeRecord);
}

export function loadSessions(): SessionRecord[] {
  if (typeof window === "undefined") return [];
  return loadRawSessions();
}

export function saveSessions(sessions: SessionRecord[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

/** Call from Live monitoring when a session ends (append + save). */
export function appendSession(session: SessionRecord): void {
  const next = [session, ...loadSessions()];
  saveSessions(next);
}

export function clearSessions(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}

function startedTime(s: SessionRecord): number {
  return new Date(s.startedAt).getTime();
}

export function filterBySessionType(
  sessions: SessionRecord[],
  type: SessionType | "all"
): SessionRecord[] {
  if (type === "all") return sessions;
  return sessions.filter((s) => s.sessionType === type);
}

function average(nums: number[]): number | null {
  if (nums.length === 0) return null;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

/** Rolling window from `now` (ms), e.g. 7 * 24 * 60 * 60 * 1000 */
export function sessionsInRollingWindow(
  sessions: SessionRecord[],
  windowMs: number,
  now: number = Date.now()
): SessionRecord[] {
  const start = now - windowMs;
  return sessions.filter((s) => {
    const t = startedTime(s);
    return t >= start && t <= now;
  });
}

export function computePeriodStats(sessions: SessionRecord[]): PeriodStats {
  const hrs = sessions.map((s) => s.avgHr).filter((n): n is number => n != null);
  const hrvs = sessions.map((s) => s.avgHrvMs).filter((n): n is number => n != null);
  const maxes = sessions.map((s) => s.maxHr).filter((n): n is number => n != null);

  return {
    sessionCount: sessions.length,
    totalDurationMin: Math.round(
      sessions.reduce((acc, s) => acc + s.durationSec, 0) / 60
    ),
    avgHr: average(hrs),
    avgHrvMs: average(hrvs),
    maxHr: maxes.length ? Math.max(...maxes) : null,
  };
}

export function sessionsInCalendarMonth(
  sessions: SessionRecord[],
  ref: Date = new Date()
): SessionRecord[] {
  const y = ref.getFullYear();
  const m = ref.getMonth();
  return sessions.filter((s) => {
    const t = new Date(s.startedAt);
    return t.getFullYear() === y && t.getMonth() === m;
  });
}

export interface HrvWeekComparison {
  thisWeekAvgHrvMs: number | null;
  lastWeekAvgHrvMs: number | null;
  /** e.g. 12.5 for +12.5% vs last week */
  percentChangeVsLastWeek: number | null;
  message: string;
}

export function startOfWeekMonday(d: Date): Date {
  const x = new Date(d);
  const day = x.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  x.setDate(x.getDate() + diff);
  x.setHours(0, 0, 0, 0);
  return x;
}

/** Sessions whose start time falls in the current Mon–Sun week, sorted oldest first (for sparklines). */
export function sessionsInCurrentWeekSorted(
  sessions: SessionRecord[],
  now: Date = new Date()
): SessionRecord[] {
  const thisStart = startOfWeekMonday(now);
  const nextWeek = new Date(thisStart);
  nextWeek.setDate(nextWeek.getDate() + 7);
  return sessions
    .filter((s) => {
      const t = startedTime(s);
      return t >= thisStart.getTime() && t < nextWeek.getTime();
    })
    .sort((a, b) => startedTime(a) - startedTime(b));
}

/**
 * Compare average HRV for the current ISO week (Mon–Sun) vs the previous week.
 */
export function compareHrvWeekOverWeek(
  sessions: SessionRecord[],
  now: Date = new Date()
): HrvWeekComparison {
  const thisStart = startOfWeekMonday(now);
  const lastStart = new Date(thisStart);
  lastStart.setDate(lastStart.getDate() - 7);
  const nextWeek = new Date(thisStart);
  nextWeek.setDate(nextWeek.getDate() + 7);

  const thisWeek = sessions.filter((s) => {
    const t = startedTime(s);
    return t >= thisStart.getTime() && t < nextWeek.getTime();
  });
  const lastWeek = sessions.filter((s) => {
    const t = startedTime(s);
    return t >= lastStart.getTime() && t < thisStart.getTime();
  });

  const thisHrv = thisWeek.map((s) => s.avgHrvMs).filter((n): n is number => n != null);
  const lastHrv = lastWeek.map((s) => s.avgHrvMs).filter((n): n is number => n != null);

  const thisWeekAvgHrvMs = average(thisHrv);
  const lastWeekAvgHrvMs = average(lastHrv);

  let percentChangeVsLastWeek: number | null = null;
  if (
    thisWeekAvgHrvMs != null &&
    lastWeekAvgHrvMs != null &&
    lastWeekAvgHrvMs !== 0
  ) {
    percentChangeVsLastWeek =
      ((thisWeekAvgHrvMs - lastWeekAvgHrvMs) / lastWeekAvgHrvMs) * 100;
  }

  let message: string;
  if (thisHrv.length === 0 && lastHrv.length === 0) {
    message =
      "Log your first session to unlock personalized endurance insights from your HRV trend (course prototype — not medical advice).";
  } else if (thisHrv.length === 0) {
    message = "No HRV data yet this week.";
  } else if (lastHrv.length === 0) {
    message = "This is your first week with HRV data to compare.";
  } else if (percentChangeVsLastWeek == null) {
    message = "Not enough overlapping HRV data to compare weeks.";
  } else {
    const dir = percentChangeVsLastWeek >= 0 ? "increased" : "decreased";
    message = `Your average HRV has ${dir} by ${Math.abs(
      Math.round(percentChangeVsLastWeek * 10) / 10
    )}% vs last week — nice work on recovery and endurance conditioning.`;
  }

  return {
    thisWeekAvgHrvMs,
    lastWeekAvgHrvMs,
    percentChangeVsLastWeek,
    message,
  };
}

/** Demo rows so the dashboard is presentable before Live writes real sessions. */
export function sampleSessions(): SessionRecord[] {
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  const mk = (
    daysAgo: number,
    type: SessionType,
    avgHr: number,
    maxHr: number,
    hrv: number,
    stress: string
  ): SessionRecord => {
    const start = new Date(now - daysAgo * day - 3600000);
    const end = new Date(start.getTime() + 25 * 60 * 1000);
    return {
      id: crypto.randomUUID(),
      startedAt: start.toISOString(),
      endedAt: end.toISOString(),
      sessionType: type,
      durationSec: Math.round((end.getTime() - start.getTime()) / 1000),
      maxHr,
      avgHr,
      avgHrvMs: hrv,
      stressSummary: stress,
    };
  };
  return [
    mk(0, "rest", 72, 88, 42, "Low Stress 🌿"),
    mk(1, "walking", 98, 118, 35, "Moderate Stress ⚡"),
    mk(2, "jogging", 142, 168, 28, "High Stress ⚠️"),
    mk(3, "cycling", 128, 155, 32, "Moderate Stress ⚡"),
    mk(9, "walking", 95, 112, 36, "Moderate Stress ⚡"),
    mk(10, "rest", 71, 86, 40, "Low Stress 🌿"),
  ];
}
