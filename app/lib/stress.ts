/**
 * Centralized stress level classification based on HRV (Heart Rate Variability)
 * Measured in RMSSD (Root Mean Square of Successive Differences) in milliseconds
 *
 * HRV interpretation:
 * - Higher HRV = better recovery, lower stress, better endurance capacity
 * - Lower HRV = higher stress, fatigue, possible overtraining
 */

export interface StressLevel {
  level: "low" | "moderate" | "high" | "very_high";
  label: string;
  emoji: string;
  color: string; // Tailwind text color
  bgColor: string; // Tailwind background color
  borderColor: string; // Tailwind border color
  description: string;
  recommendation: string;
}

/**
 * Get stress level classification from HRV value
 * @param hrv Heart Rate Variability in milliseconds (RMSSD)
 * @returns StressLevel object with all styling and text info
 */
export function getStressLevel(hrv: number | null): StressLevel {
  if (hrv == null) {
    return {
      level: "moderate",
      label: "No Data",
      emoji: "—",
      color: "text-slate-600",
      bgColor: "bg-slate-50",
      borderColor: "border-slate-200",
      description: "Complete a session to see stress level",
      recommendation: "Log your first session to unlock personalized insights.",
    };
  }

  if (hrv > 60) {
    return {
      level: "low",
      label: "Low Stress",
      emoji: "🌿",
      color: "text-emerald-700",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-200",
      description: "Excellent recovery. Body is well-adapted.",
      recommendation: "Keep up the good training! Your recovery is excellent.",
    };
  }

  if (hrv >= 30) {
    return {
      level: "moderate",
      label: "Moderate Stress",
      emoji: "⚡",
      color: "text-amber-700",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-200",
      description: "Normal training load. Good for building endurance.",
      recommendation: "Normal training load. Monitor fatigue levels.",
    };
  }

  if (hrv >= 15) {
    return {
      level: "high",
      label: "High Stress",
      emoji: "⚠️",
      color: "text-orange-700",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
      description: "Elevated stress or fatigue detected.",
      recommendation: "Consider lighter session or recovery day.",
    };
  }

  return {
    level: "very_high",
    label: "Very High Stress",
    emoji: "⛔",
    color: "text-red-700",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    description: "High stress / possible overtraining detected.",
    recommendation: "Prioritize rest and recovery before next intense activity.",
  };
}

/**
 * Get CSS classes for color-coding table cells based on HRV
 * @param hrv Heart Rate Variability in milliseconds
 * @returns Object with bgClass, textClass, and borderClass for styling
 */
export function getStressCellClasses(hrv: number | null): {
  bgClass: string;
  textClass: string;
  borderClass: string;
} {
  const stress = getStressLevel(hrv);
  return {
    bgClass: stress.bgColor,
    textClass: stress.color,
    borderClass: stress.borderColor,
  };
}
