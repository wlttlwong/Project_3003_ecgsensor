/** Activity types for ECG sessions (walking / jogging / cycling / rest). */
export const SESSION_TYPES = ["walking", "jogging", "cycling", "rest"] as const;
export type SessionType = (typeof SESSION_TYPES)[number];

export const SESSION_TYPE_LABELS: Record<SessionType, string> = {
  walking: "Walking",
  jogging: "Jogging",
  cycling: "Cycling",
  rest: "Rest",
};

/**
 * One completed monitoring session. Live monitoring should append records with
 * measured fields; HRV can stay null until the pipeline computes it.
 */
export interface SessionRecord {
  id: string;
  /** ISO 8601 */
  startedAt: string;
  /** ISO 8601 */
  endedAt: string;
  sessionType: SessionType;
  durationSec: number;
  maxHr: number | null;
  avgHr: number | null;
  /** e.g. RMSSD in ms — confirm units with whoever implements HRV */
  avgHrvMs: number | null;
  /** Short fitness summary line for the table (not a clinical diagnosis) */
  stressSummary: string;
}

export interface PeriodStats {
  sessionCount: number;
  totalDurationMin: number;
  avgHr: number | null;
  avgHrvMs: number | null;
  maxHr: number | null;
}
