export interface AuthUser {
  id: string;
  email: string;
  createdAt: string;
}

export interface UserProfile {
  userId: string;
  age: number | null;
  height: number | null;
  goals: string[];
  stressTriggers: string[];
  maxHeartRate: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface PeriodStatsResponse {
  sessionCount: number;
  totalDurationMin: number;
  avgHr: number | null;
  maxHr: number | null;
  avgHrvMs: number | null;
  periodStart: string;
  periodEnd: string;
}
