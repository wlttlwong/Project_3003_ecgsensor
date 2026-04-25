export function calculateRMSSD(rrIntervals: number[]): number {
  if (rrIntervals.length < 2) return 0;

  let sumSquaredDiffs = 0;
  for (let i = 1; i < rrIntervals.length; i++) {
    const diff = rrIntervals[i] - rrIntervals[i - 1];
    sumSquaredDiffs += diff * diff;
  }

  const meanSquaredDiff = sumSquaredDiffs / (rrIntervals.length - 1);
  return Math.sqrt(meanSquaredDiff);
}

export function calculateStressScore(rmssd: number): number {
  if (rmssd === 0) return 0;

  // ULTRA-SENSITIVE TWEAK:
  // Anything below 30ms is now 100% Stress.
  // You need 75ms just to reach 0% Stress.
  const minRmssd = 30; 
  const maxRmssd = 75;
  
  const clampedRMSSD = Math.max(minRmssd, Math.min(maxRmssd, rmssd));
  
  const score = 100 - ((clampedRMSSD - minRmssd) / (maxRmssd - minRmssd)) * 100;
  
  return Math.round(score);
}

/**
 * Returns labels based on elite-level RMSSD requirements.
 */
export function getStressLabel(rmssd: number): { label: string; color: string } {
  if (rmssd === 0) return { label: "Analyzing...", color: "text-slate-500" };
  
  // ULTRA-SENSITIVE TWEAK:
  // Relaxed: Requires > 75ms (Previously 65ms)
  // Moderate: 50ms to 75ms (Previously 40ms to 65ms)
  // High Stress: Anything below 50ms (Previously 40ms)
  
  if (rmssd > 75) {
    return { label: "Relaxed", color: "text-emerald-400" };
  }
  if (rmssd > 50) {
    return { label: "Moderate", color: "text-amber-400" };
  }
  return { label: "High Stress", color: "text-rose-400" };
}