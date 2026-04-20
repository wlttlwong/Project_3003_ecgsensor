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

export function getStressLabel(rmssd: number): { label: string; color: string } {
  if (rmssd === 0) return { label: "Analyzing...", color: "text-zinc-400" };
  if (rmssd > 50) return { label: "Relaxed", color: "text-emerald-500" };
  if (rmssd > 20) return { label: "Moderate", color: "text-amber-500" };
  return { label: "High Stress", color: "text-rose-500" };
}