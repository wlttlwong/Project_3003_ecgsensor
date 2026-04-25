# Backend Migration Plan
## Collaborative Work with Antonia

**Date:** April 25, 2026  
**Scope:** Migrate all localStorage data to backend API  
**Stack:** Next.js 14 (App Router) + API Routes + Database (TBD with Antonia)

---

## Phase 1: Database Schema (Coordinate with Antonia)

### Tables/Collections Needed

```typescript
// User table
interface User {
  id: string;                    // UUID
  email: string;                 // Unique
  passwordHash: string;          // bcrypt hash (NEVER store plain password)
  createdAt: Date;
  updatedAt: Date;
}

// UserProfile table
interface UserProfile {
  userId: string;                // Foreign key to User.id
  age: number | null;
  goals: string[];              // e.g., ["weight loss", "endurance", "recovery"]
  stressTriggers: string[];     // e.g., ["work", "sleep", "caffeine"]
  maxHeartRate: number | null;  // For accurate HR zone calculations
  createdAt: Date;
  updatedAt: Date;
}

// Session table
interface Session {
  id: string;                    // UUID
  userId: string;                // Foreign key
  startedAt: Date;
  endedAt: Date;
  sessionType: "walking" | "jogging" | "cycling" | "rest";
  durationSec: number;
  avgHr: number | null;
  maxHr: number | null;
  avgHrvMs: number | null;       // Heart Rate Variability
  stressSummary: string;         // e.g., "Low Stress 🌿"
  createdAt: Date;
  updatedAt: Date;
}

// ChatSession table (for chatbot integration)
interface ChatSession {
  id: string;
  userId: string;
  messages: Array<{
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
  }>;
  context: {
    lastHrv?: number;
    recentStressTrend?: string;
    userGoals?: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}
```

### Database Options
- **PostgreSQL + Prisma** (recommended for relational data)
- **Supabase** (PostgreSQL + real-time + auth built-in)
- **Firebase/Firestore** (serverless, NoSQL)
- **MongoDB + Mongoose** (NoSQL, flexible schema)

**Action Item:** Coordinate with Antonia on which database to use.

---

## Phase 2: Authentication API Routes

### Route: `POST /api/auth/register`

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "age": 25
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  }
}
```

**Implementation:**
- Hash password with `bcrypt` (NOT plain text)
- Generate JWT token valid for 7 days
- Store user in database
- Create empty UserProfile

### Route: `POST /api/auth/login`

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  }
}
```

**Implementation:**
- Find user by email
- Compare password with `bcrypt.compare()`
- Generate JWT token
- Return token to client

### Route: `POST /api/auth/logout`

Simply delete the token from client localStorage.

---

## Phase 3: User Profile API Routes

### Route: `GET /api/user/profile`

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "userId": "uuid",
  "age": 25,
  "goals": ["weight loss", "endurance"],
  "stressTriggers": ["work", "caffeine"],
  "maxHeartRate": 195
}
```

### Route: `POST /api/user/profile`

**Headers:** `Authorization: Bearer {token}`

**Request:**
```json
{
  "age": 26,
  "goals": ["weight loss", "endurance", "recovery"],
  "stressTriggers": ["work", "sleep"],
  "maxHeartRate": 195
}
```

**Response:**
```json
{
  "success": true,
  "profile": { /* updated profile */ }
}
```

---

## Phase 4: Sessions API Routes

### Route: `GET /api/sessions`

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `?limit=50` — Max sessions to return
- `?offset=0` — Pagination offset
- `?type=walking` — Filter by activity type
- `?startDate=2026-04-01` — Filter by date range

**Response:**
```json
{
  "success": true,
  "sessions": [
    {
      "id": "uuid",
      "startedAt": "2026-04-25T10:00:00Z",
      "endedAt": "2026-04-25T10:25:00Z",
      "sessionType": "walking",
      "durationSec": 1500,
      "avgHr": 98,
      "maxHr": 118,
      "avgHrvMs": 35,
      "stressSummary": "Moderate Stress ⚡"
    }
  ],
  "total": 42,
  "page": 0
}
```

### Route: `POST /api/sessions`

**Headers:** `Authorization: Bearer {token}`

**Request:**
```json
{
  "startedAt": "2026-04-25T10:00:00Z",
  "endedAt": "2026-04-25T10:25:00Z",
  "sessionType": "walking",
  "durationSec": 1500,
  "avgHr": 98,
  "maxHr": 118,
  "avgHrvMs": 35,
  "stressSummary": "Moderate Stress ⚡"
}
```

**Response:**
```json
{
  "success": true,
  "session": { /* created session */ }
}
```

### Route: `DELETE /api/sessions/:id`

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "success": true,
  "message": "Session deleted"
}
```

---

## Phase 5: Stats Calculation API Routes

### Route: `GET /api/stats/weekly`

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "success": true,
  "stats": {
    "sessionCount": 5,
    "totalDurationMin": 125,
    "avgHr": 98,
    "maxHr": 142,
    "avgHrvMs": 38,
    "weekStart": "2026-04-21",
    "weekEnd": "2026-04-27"
  }
}
```

### Route: `GET /api/stats/monthly`

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "success": true,
  "stats": {
    "sessionCount": 20,
    "totalDurationMin": 500,
    "avgHr": 105,
    "maxHr": 168,
    "avgHrvMs": 42,
    "monthStart": "2026-04-01",
    "monthEnd": "2026-04-30"
  }
}
```

---

## Phase 6: Frontend Changes

### 1. Create Authentication Service

**File:** `app/lib/auth.ts`

```typescript
export async function register(email: string, password: string, age?: number) {
  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, age }),
  });
  const data = await res.json();
  if (data.token) {
    localStorage.setItem("authToken", data.token);
  }
  return data;
}

export async function login(email: string, password: string) {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (data.token) {
    localStorage.setItem("authToken", data.token);
  }
  return data;
}

export function logout() {
  localStorage.removeItem("authToken");
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("authToken");
}
```

### 2. Create API Client Service

**File:** `app/lib/apiClient.ts`

```typescript
async function apiCall(
  endpoint: string,
  options: RequestInit = {}
) {
  const token = getToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  const res = await fetch(endpoint, {
    ...options,
    headers,
  });
  
  if (res.status === 401) {
    logout();
    window.location.href = "/login";
  }
  
  return res.json();
}

export async function getSessions() {
  return apiCall("/api/sessions");
}

export async function createSession(session: SessionData) {
  return apiCall("/api/sessions", {
    method: "POST",
    body: JSON.stringify(session),
  });
}

export async function deleteSession(id: string) {
  return apiCall(`/api/sessions/${id}`, { method: "DELETE" });
}

export async function getUserProfile() {
  return apiCall("/api/user/profile");
}

export async function updateUserProfile(profile: Partial<UserProfile>) {
  return apiCall("/api/user/profile", {
    method: "POST",
    body: JSON.stringify(profile),
  });
}

export async function getWeeklyStats() {
  return apiCall("/api/stats/weekly");
}

export async function getMonthlyStats() {
  return apiCall("/api/stats/monthly");
}
```

### 3. Update Dashboard to Use API

Replace all `loadSessions()` calls with `getSessions()` and use the API client.

### 4. Create Login/Register Pages

**File:** `app/login/page.tsx`  
**File:** `app/register/page.tsx`

Simple forms that call the auth API.

---

## Phase 7: Security Considerations

### ✅ DO:
- Hash passwords with `bcrypt` (npm package: `bcryptjs`)
- Use JWT tokens with expiration (e.g., 7 days)
- Validate token on every API request
- Use HTTPS in production
- Store JWT in `httpOnly` cookies (if possible) instead of localStorage
- Implement rate limiting on auth endpoints

### ❌ DON'T:
- Store plain passwords in database
- Expose sensitive data in API responses
- Log user passwords
- Use weak JWT secrets

---

## Tech Stack Recommendations

### Backend Database
- **PostgreSQL + Prisma ORM** (recommended)
- **Supabase** (PostgreSQL hosting + auth + real-time)

### Password Hashing
- `npm install bcryptjs`

### JWT Token Generation
- `npm install jsonwebtoken`
- Or use NextAuth.js for integrated auth

### Environment Variables
```
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
JWT_SECRET=your-super-secret-key-min-32-chars
NEXTAUTH_SECRET=your-nextauth-secret
```

---

## Implementation Order

1. **Database Setup** (coordinate with Antonia)
   - Choose database
   - Create tables/collections
   - Set up connection

2. **Authentication** (Tiffany)
   - Implement `/api/auth/register`
   - Implement `/api/auth/login`
   - Create auth service (`app/lib/auth.ts`)

3. **User Profile API** (Tiffany)
   - Implement `/api/user/profile` GET/POST

4. **Sessions API** (Tiffany)
   - Implement `/api/sessions` GET/POST/DELETE

5. **Stats API** (Tiffany)
   - Implement `/api/stats/weekly`
   - Implement `/api/stats/monthly`

6. **Frontend Refactor** (Tiffany)
   - Replace localStorage with API calls
   - Create login/register pages
   - Update dashboard to fetch from API

7. **Chatbot Integration** (Antonia)
   - Use backend data for context
   - Integrate with chat endpoints

---

## Timeline Estimate

- **Database setup:** 1-2 hours (with Antonia)
- **Auth API:** 2-3 hours
- **Sessions API:** 2-3 hours
- **Stats API:** 1-2 hours
- **Frontend refactor:** 3-4 hours
- **Testing & refinement:** 2-3 hours

**Total:** ~12-17 hours of development time

---

## Questions for Antonia

1. **Database:** Which database should we use? (PostgreSQL, Firebase, MongoDB, etc.)
2. **Authentication:** Should we use NextAuth.js or implement JWT manually?
3. **Hosting:** Where will the backend be hosted? (Vercel, AWS, Azure, etc.)
4. **Data Sync:** Should we sync real-time data or polling/refresh?
5. **Chatbot Data Access:** What data does the chatbot need from each session?

---

## Current Status

- ✅ Dashboard UI complete and working
- ✅ localStorage for temporary data working
- ❌ Backend authentication not started
- ❌ API routes not started
- ❌ Database not set up

**Next Step:** Coordinate with Antonia on database choice and get started!
