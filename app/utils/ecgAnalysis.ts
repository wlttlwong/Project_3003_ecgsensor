export function calculateRMSSD(rrIntervals: number[]): number {
  if (rrIntervals.length < 2) return 0;

  // 1. DATA CLEANING: Filter for physiologically possible R-R intervals (40bpm to 200bpm)
  const filteredIntervals = rrIntervals.filter(ms => ms > 300 && ms < 1500);

  if (filteredIntervals.length < 2) return 0;

  let sumSquaredDiffs = 0;
  let validDiffCount = 0;

  for (let i = 1; i < filteredIntervals.length; i++) {
    const diff = filteredIntervals[i] - filteredIntervals[i - 1];
    
    // 2. ABRUPT CHANGE REJECTION: 
    // Ignores jumps > 300ms (likely movement or gasping) to keep the gauge stable.
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
 * ULTRA-SENSITIVE: Uses a narrow window (30ms - 75ms) for high-performance monitoring.
 */
export function calculateStressScore(rmssd: number): number {
  if (rmssd === 0) return 0;

  const minRmssd = 30; 
  const maxRmssd = 75;
  
  const clampedRMSSD = Math.max(minRmssd, Math.min(maxRmssd, rmssd));
  
  // Inverse relationship: lower RMSSD = higher stress score
  const score = 100 - ((clampedRMSSD - minRmssd) / (maxRmssd - minRmssd)) * 100;
  
  return Math.round(score);
}

/**
 * Returns labels based on elite-level RMSSD requirements.
 */
export function getStressLabel(rmssd: number): { label: string; color: string } {
  if (rmssd === 0) return { label: "Analyzing...", color: "text-slate-500" };
  
  if (rmssd > 75) {
    return { label: "Relaxed", color: "text-emerald-400" };
  }
  if (rmssd > 50) {
    return { label: "Moderate", color: "text-amber-400" };
  }
  return { label: "High Stress", color: "text-rose-400" };
}

/**
 * NEW: Evaluates the quality of the recorded session for trial analysis.
 * Detects artifacts, sensor dropouts, and non-physiological spikes.
 */
export function evaluateDataQuality(rrIntervals: number[]): { 
  score: number; 
  status: 'Poor' | 'Fair' | 'Good' | 'Excellent';
  details: string;
} {
  if (rrIntervals.length < 5) {
    return { score: 0, status: 'Poor', details: "Insufficient data points." };
  }

  let artifactCount = 0;
  let outOfRangeCount = 0;

  for (let i = 1; i < rrIntervals.length; i++) {
    const current = rrIntervals[i];
    const diff = Math.abs(current - rrIntervals[i - 1]);

    // Check for dropouts or extreme spikes
    if (current < 300 || current > 1500) outOfRangeCount++;

    // Check for sudden jumps > 30% (Standard ECG quality check)
    if (diff > rrIntervals[i - 1] * 0.3) artifactCount++;
  }

  const badBeats = artifactCount + outOfRangeCount;
  const cleanRatio = Math.max(0, 1 - (badBeats / rrIntervals.length));
  const score = Math.round(cleanRatio * 100);

  let status: 'Poor' | 'Fair' | 'Good' | 'Excellent';
  let details: string;

  if (score > 90) { status = 'Excellent'; details = "High signal integrity."; }
  else if (score > 75) { status = 'Good'; details = "Minor artifacts detected."; }
  else if (score > 50) { status = 'Fair'; details = "Significant noise/movement."; }
  else { status = 'Poor'; details = "Unreliable data. Check sensor fit."; }

  return { score, status, details };
}