import type { SessionRecord } from "../types/session";
import type { AuthUser, PeriodStatsResponse, UserProfile } from "../types/user";
import { clearAuthSession, getToken, saveAuthSession } from "./auth";

type AuthResponse = {
  success: boolean;
  token: string;
  user: AuthUser;
  error?: string;
};

type SessionsResponse = {
  success: boolean;
  sessions: SessionRecord[];
  total: number;
  page: number;
  error?: string;
};

type SessionResponse = {
  success: boolean;
  session: SessionRecord;
  error?: string;
};

type ProfileResponse = {
  success: boolean;
  profile: UserProfile;
  error?: string;
};

type StatsResponse = {
  success: boolean;
  stats: PeriodStatsResponse;
  error?: string;
};

type MeResponse = {
  success: boolean;
  user: AuthUser;
  error?: string;
};

class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function apiCall<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(options.headers);

  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = (await response.json()) as T & { error?: string };
  if (!response.ok) {
    if (response.status === 401) {
      clearAuthSession();
    }
    throw new ApiError(data.error ?? "API request failed.", response.status);
  }

  return data;
}

export async function register(
  email: string,
  password: string,
  age?: number
): Promise<AuthResponse> {
  const data = await apiCall<AuthResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password, age }),
  });
  saveAuthSession(data.token, data.user);
  return data;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const data = await apiCall<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  saveAuthSession(data.token, data.user);
  return data;
}

export async function getCurrentUser(): Promise<MeResponse> {
  return apiCall<MeResponse>("/api/auth/me");
}

export async function getUserProfile(): Promise<ProfileResponse> {
  return apiCall<ProfileResponse>("/api/user/profile");
}

export async function updateUserProfile(
  profile: Partial<Omit<UserProfile, "userId" | "createdAt" | "updatedAt">>
): Promise<ProfileResponse> {
  return apiCall<ProfileResponse>("/api/user/profile", {
    method: "POST",
    body: JSON.stringify(profile),
  });
}

export async function getSessions(params?: {
  limit?: number;
  offset?: number;
  type?: string;
}): Promise<SessionsResponse> {
  const query = new URLSearchParams();
  if (params?.limit != null) query.set("limit", String(params.limit));
  if (params?.offset != null) query.set("offset", String(params.offset));
  if (params?.type) query.set("type", params.type);

  const suffix = query.toString() ? `?${query.toString()}` : "";
  return apiCall<SessionsResponse>(`/api/sessions${suffix}`);
}

export async function createSession(
  session: Omit<SessionRecord, "id"> | SessionRecord
): Promise<SessionResponse> {
  return apiCall<SessionResponse>("/api/sessions", {
    method: "POST",
    body: JSON.stringify(session),
  });
}

export async function deleteSession(id: string): Promise<{ success: boolean }> {
  return apiCall<{ success: boolean }>(`/api/sessions/${id}`, {
    method: "DELETE",
  });
}

export async function getWeeklyStats(): Promise<StatsResponse> {
  return apiCall<StatsResponse>("/api/stats/weekly");
}

export async function getMonthlyStats(): Promise<StatsResponse> {
  return apiCall<StatsResponse>("/api/stats/monthly");
}

export async function getSummaryStats(): Promise<StatsResponse> {
  return apiCall<StatsResponse>("/api/stats/summary");
}
