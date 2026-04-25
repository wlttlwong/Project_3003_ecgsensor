export function calculateRMSSD(rrIntervals: number[]): number {
  if (rrIntervals.length < 2) return 0;

  // 1. DATA CLEANING: Remove outliers (Physiologically impossible R-R intervals)
  // Standard R-R intervals usually fall between 400ms (150bpm) and 1200ms (50bpm).
  const filteredIntervals = rrIntervals.filter(ms => ms > 300 && ms < 1500);

  if (filteredIntervals.length < 2) return 0;

  let sumSquaredDiffs = 0;
  let validDiffCount = 0;

  for (let i = 1; i < filteredIntervals.length; i++) {
    const diff = filteredIntervals[i] - filteredIntervals[i - 1];
    
    // 2. ABRUPT CHANGE REJECTION: 
    // If a single difference is > 300ms, it's likely an artifact or a deep breath/movement.
    // We ignore this specific jump to keep the average stable.
    if (Math.abs(diff) < 300) {
      sumSquaredDiffs += diff * diff;
      validDiffCount++;
    }
  }

  if (validDiffCount === 0) return 0;

  const meanSquaredDiff = sumSquaredDiffs / validDiffCount;
  return Math.sqrt(meanSquaredDiff);
}

/**
 * Normalizes RMSSD into a 0-100 Stress Score.
 * ULTRA-SENSITIVE window (30ms - 75ms).
 */
export function calculateStressScore(rmssd: number): number {
  if (rmssd === 0) return 0;

  const minRmssd = 30; 
  const maxRmssd = 75;
  
  const clampedRMSSD = Math.max(minRmssd, Math.min(maxRmssd, rmssd));
  const score = 100 - ((clampedRMSSD - minRmssd) / (maxRmssd - minRmssd)) * 100;
  
  return Math.round(score);
}

export function getStressLabel(rmssd: number): { label: string; color: string } {
  if (rmssd === 0) return { label: "Analyzing...", color: "text-slate-500" };
  
  if (rmssd > 75) return { label: "Relaxed", color: "text-emerald-400" };
  if (rmssd > 50) return { label: "Moderate", color: "text-amber-400" };
  return { label: "High Stress", color: "text-rose-400" };
}

export function getStressDescription(score: number, rmssd: number): string {
  if (rmssd === 0) return "Establishing baseline variability...";
  
  if (score <= 30) {
    return "Your body is relaxed and recovering well.";
  } else if (score <= 70) {
    return "Moderate physiological activity detected. Balance rest and action.";
  } else {
    return "High strain detected. Try slow, deep breaths to reset your system.";
  }
}