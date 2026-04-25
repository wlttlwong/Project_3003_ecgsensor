import type { SessionRecord } from "../../types/session";
import type { PeriodStatsResponse } from "../../types/user";

function average(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function startOfWeekMonday(date: Date): Date {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  const day = next.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  next.setDate(next.getDate() + diff);
  return next;
}

export function filterSessionsByRange<T extends Pick<SessionRecord, "startedAt">>(
  sessions: T[],
  start: Date,
  end: Date
): T[] {
  return sessions.filter((session) => {
    const time = new Date(session.startedAt).getTime();
    return time >= start.getTime() && time < end.getTime();
  });
}

export function computePeriodStats<T extends SessionRecord>(
  sessions: T[],
  start: Date,
  end: Date
): PeriodStatsResponse {
  const avgHrValues = sessions
    .map((session) => session.avgHr)
    .filter((value): value is number => value != null);
  const avgHrvValues = sessions
    .map((session) => session.avgHrvMs)
    .filter((value): value is number => value != null);
  const maxHrValues = sessions
    .map((session) => session.maxHr)
    .filter((value): value is number => value != null);

  return {
    sessionCount: sessions.length,
    totalDurationMin: Math.round(
      sessions.reduce((sum, session) => sum + session.durationSec, 0) / 60
    ),
    avgHr: average(avgHrValues),
    maxHr: maxHrValues.length > 0 ? Math.max(...maxHrValues) : null,
    avgHrvMs: average(avgHrvValues),
    periodStart: start.toISOString(),
    periodEnd: end.toISOString(),
  };
}
