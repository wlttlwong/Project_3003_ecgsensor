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

  // Baseline mapping: 
  // RMSSD >= 100 is considered 0 stress (max relaxation)
  // RMSSD <= 10 is considered 100 stress (high strain)
  const minRmssd = 10;
  const maxRmssd = 100;
  
  const clampedRMSSD = Math.max(minRmssd, Math.min(maxRmssd, rmssd));
  
  // Calculate score: 100 minus the percentage of relaxation
  const score = 100 - ((clampedRMSSD - minRmssd) / (maxRmssd - minRmssd)) * 100;
  
  return Math.round(score);
}

export function getStressLabel(rmssd: number): { label: string; color: string } {
  if (rmssd === 0) return { label: "Analyzing...", color: "text-slate-500" };
  
  // Based on standard HRV resting ranges
  if (rmssd > 50) {
    return { label: "Relaxed", color: "text-emerald-400" };
  }
  if (rmssd > 25) {
    return { label: "Moderate", color: "text-amber-400" };
  }
  return { label: "High Stress", color: "text-rose-400" };
}