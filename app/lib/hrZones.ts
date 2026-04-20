import type { SessionRecord } from "../types/session";

/**
 * Rough HR zone label from avg vs session max (demo heuristic — not clinical).
 * Real zone training needs age-based max HR or lab testing.
 */
export function formatApproxHrZone(s: SessionRecord): string {
  if (s.avgHr == null || s.maxHr == null || s.maxHr <= 0) return "—";
  const r = s.avgHr / s.maxHr;
  const pct = Math.round(r * 100);
  if (r < 0.55) return `Zone 1 · Warm-up (~${pct}%)`;
  if (r < 0.65) return `Zone 2 · Fat burn (~${pct}%)`;
  if (r < 0.75) return `Zone 3 · Cardio (~${pct}%)`;
  if (r < 0.88) return `Zone 4 · Hard (~${pct}%)`;
  return `Zone 5 · Peak (~${pct}%)`;
}
