# 📊 Complete Branch Analysis & Backend Requirements
## BIOF3003 ECG Heart Rate Stress Monitor - Team Feature Inventory

**Analysis Date:** April 25, 2026  
**Total Branches:** 10  
**Active Development Branches:** 6  
**Demo Date:** April 28, 2026 (3 days)

---

## 🎯 Branch Summary Table

| Branch | Owner | Status | Last Update | Key Features | Merge Priority |
|--------|-------|--------|-------------|--------------|-----------------|
| **Dashboard** | Tiffany | ✅ COMPLETE | Apr 25 (39b6375) | Main UI, Stress system, Stats | MERGE NOW |
| **session-state-manager** | Team | ✅ READY | Apr 19 (91b0e6b) | Pause/Resume, Real-time filtering | MERGE HIGH |
| **ui-visualization-engine** | Team | ✅ READY | Apr 25 (432bf9f) | ECG filters, Signal analysis utils | MERGE HIGH |
| **ending-session** | Team | ✅ READY | Apr 20 (3507b44) | Session summary, Stress info | MERGE HIGH |
| **feedback-control** | Team | ✅ READY | Apr 20 (a9d5aae) | Feedback UI, Sound notifications | MERGE MEDIUM |
| **chatbot** | Antonia | ✅ PARTIAL | Apr 25 (a87777e) | FastAPI backend | NEEDS API DATA |
| **analysis-algorithms** | Base | 🚫 UNUSED | Mar 21 (1c169bc) | Old boilerplate | SKIP |
| **develop** | Base | 🚫 UNUSED | Mar 21 (1c169bc) | Empty | SKIP |
| **homepage** | Base | 🚫 UNUSED | Mar 21 (1c169bc) | Empty | SKIP |
| **main** | Base | 🚫 UNUSED | Mar 21 (1c169bc) | Old boilerplate | SKIP |

---

## 🔍 Detailed Branch Breakdown

### 1. **Dashboard** (Tiffany) ✅
**Status:** Complete, Production Ready  
**Last Commit:** Apr 25, 39b6375 - "docs: Quick reference guide"

**Features Included:**
- ✅ ECG Chart visualization with real-time updates
- ✅ Heart Rate Monitor UI component
- ✅ Stress classification system (4 levels: 🌿⚡⚠️⛔)
- ✅ Weekly/monthly/yearly statistics
- ✅ Personalized wellness insights
- ✅ Calibration instructions modal
- ✅ Session tracking and logging
- ✅ localStorage-based persistence (temporary)
- ✅ Responsive design (mobile + desktop)
- ✅ Comprehensive documentation (4 files)

**Key Files:**
- `app/dashboard/page.tsx` - Main dashboard
- `app/lib/sessions.ts` - Session management (localStorage)
- `app/lib/stress.ts` - Stress classification
- `app/components/ECGChart.tsx` - Chart visualization
- `app/components/HeartRateMonitor.tsx` - HR display

**Status:** ✅ Ready to merge with API integration next

---

### 2. **session-state-manager** (Team) ✅
**Status:** Ready to Merge  
**Last Commit:** Apr 19, 91b0e6b - "implement pause/resume logic"

**New Features Added:**
- ✅ **Pause/Resume functionality** - Stop and start ECG streaming without disconnecting
- ✅ **Real-time data filtering** - Live signal processing structure
- ✅ **State management improvements** - Better hook organization
- ✅ **`togglePaused()` method** - Control streaming pause state
- ✅ **`isPaused` state tracking** - Reflect current pause status

**Key Code Changes in `useHeartRateSensor.ts`:**
```typescript
// New pause/resume logic
const [isPaused, setIsPaused] = useState<boolean>(false);

const togglePaused = useCallback(() => {
  setIsPaused(prev => !prev);
}, []);

// Pause check in ECG stream processing
pmdDataCharacteristic.addEventListener('characteristicvaluechanged', (event) => {
  if (isPaused) return;  // Skip processing if paused
  // Process ECG data...
});
```

**Why Important:** Users can pause monitoring during activities without losing connection

**Status:** ✅ Ready to merge into Dashboard

---

### 3. **ui-visualization-engine** (Team) ✅
**Status:** Ready to Merge  
**Last Commit:** Apr 25, 432bf9f - "Update UI display and colours"

**New Utilities Added:**
- ✅ **`ecgFilters.ts`** - Signal filtering implementation
  - High-Pass filter for baseline removal
  - Low-Pass filter for smoothing
  - Professional DSP (Digital Signal Processing)

- ✅ **`ecgAnalysis.ts`** - ECG signal analysis
- ✅ **`exportData.ts`** - Data export functionality
- ✅ **`signalQuality.ts`** - Signal quality detection

**ECGFilter Implementation:**
```typescript
export class ECGFilter {
  private alpha: number = 0.15;      // Low-pass smoothing factor
  private m: number = 0.995;         // High-pass feedback coefficient
  
  public process(currentRaw: number): number {
    // High-Pass: Remove baseline drift
    const filteredHP = currentRaw - prevRaw + (m * prevFiltered);
    // Low-Pass: Smooth noise
    const smoothed = (alpha * filteredHP) + ((1 - alpha) * prevFiltered);
    return smoothed;
  }
}
```

**Why Important:** Professional-grade signal processing improves ECG reliability

**Status:** ✅ Ready to integrate into Dashboard

---

### 4. **ending-session** (Team) ✅
**Status:** Ready to Merge  
**Last Commit:** Apr 20, 3507b44 - "Add ending session summary"

**New Components Added:**
- ✅ **`SessionSummary.tsx`** - Post-session summary view
  - Shows session metrics
  - Duration, HR stats, HRV values
  - Session insights and analysis

- ✅ **`StressScoreInfo.tsx`** - Stress level explanation
  - Educational info about stress levels
  - Recommendations based on stress

**Features:**
- Session recap with all key metrics
- Stress breakdown and explanations
- Navigation between pages

**Status:** ✅ Ready to merge into Dashboard

---

### 5. **feedback-control** (Team) ✅
**Status:** Ready to Merge  
**Last Commit:** Apr 20, a9d5aae - "Feedback control with sound notifications"

**New Features Added:**
- ✅ **Feedback collection UI** - Collect user feedback on recommendations
- ✅ **Sound notifications** - Audio alerts for high stress
- ✅ **Notification system** - Real-time user alerts

**Why Important:** Helps improve recommendations, provides user engagement

**Status:** ✅ Ready to merge (lower priority, can be later)

---

### 6. **chatbot** (Antonia) 🔄
**Status:** Partial - Backend exists, needs integration  
**Last Commit:** Apr 25, a87777e - "Deleted api" (cleaned up old code)

**Backend Implementation:**
- ✅ **FastAPI server** - `backend/main.py` (150+ lines)
- ✅ **LLM integration** - Ollama with qwen2.5:7b model
- ✅ **CORS enabled** - Ready for Next.js frontend
- ✅ **Context-aware** - Uses user data for personalized advice

**API Endpoint:**
```
POST /api/chat
{
  "message": "How can I reduce stress?",
  "context": {
    "userProfile": { "age": 25, "goals": [...], "stressTriggers": [...] },
    "currentSession": { "avgHR": 85, "avgHRV": 40, "stressLevel": "Moderate" },
    "recentSessions": [...],
    "weeklyInsight": {...}
  }
}
```

**Response:**
```json
{
  "reply": "Your HRV of 40 indicates moderate stress. Since your goal is to release stress, try box breathing for 2 minutes..."
}
```

**Backend Requirements Needed:**
- ❌ Data source for `context.userProfile` (from Dashboard API)
- ❌ Data source for `context.currentSession` (from Dashboard API)
- ❌ Data source for `context.recentSessions` (from Dashboard API)
- ❌ Data source for `context.weeklyInsight` (from Dashboard API)

**Status:** 🟡 Waiting for Dashboard API to be built

---

## 📋 Backend Implementation Plan

Based on all branch analysis, here's what needs to be built in the backend:

### TIER 1: Critical Foundation (Must build first)

#### 1.1 **Authentication System**
```
Endpoints needed:
POST /api/auth/register
  Input: { email, password, age? }
  Output: { token, userId }
  Action: Hash password, create user, return JWT

POST /api/auth/login
  Input: { email, password }
  Output: { token, userId }
  Action: Verify credentials, return JWT

POST /api/auth/logout
  Action: Invalidate token

GET /api/auth/me
  Headers: Authorization: Bearer {token}
  Output: { userId, email, createdAt }
  Action: Verify token validity
```

#### 1.2 **User Profile System**
```
Endpoints needed:
GET /api/user/profile
  Headers: Authorization: Bearer {token}
  Output: {
    userId,
    age,
    goals: string[],          // ["weight loss", "endurance", "recovery"]
    stressTriggers: string[], // ["work", "sleep", "caffeine"]
    maxHeartRate,
    createdAt
  }

POST /api/user/profile
  Headers: Authorization: Bearer {token}
  Input: { age?, goals?, stressTriggers?, maxHeartRate? }
  Output: { updated profile }
  Action: Update user profile
```

#### 1.3 **Sessions API**
```
Endpoints needed:
GET /api/sessions
  Headers: Authorization: Bearer {token}
  Query: ?limit=50&offset=0&type=walking
  Output: { sessions: Session[], total: number }
  Action: Fetch user's sessions with pagination

POST /api/sessions
  Headers: Authorization: Bearer {token}
  Input: {
    startedAt,
    endedAt,
    sessionType,    // "walking", "jogging", "cycling", "rest"
    durationSec,
    avgHr,
    maxHr,
    avgHrvMs,
    stressSummary   // "Low Stress 🌿"
  }
  Output: { session: Session }
  Action: Create new session

DELETE /api/sessions/{id}
  Headers: Authorization: Bearer {token}
  Action: Delete session
```

### TIER 2: Analytics & Chatbot Support

#### 2.1 **Statistics API**
```
Endpoints needed:
GET /api/stats/weekly
  Headers: Authorization: Bearer {token}
  Output: {
    sessionCount,
    totalDurationMin,
    avgHr,
    maxHr,
    avgHrvMs,
    weekStart,
    weekEnd
  }

GET /api/stats/monthly
  Headers: Authorization: Bearer {token}
  Output: { ...monthly stats... }

GET /api/stats/summary
  Output: All time stats, trends
```

#### 2.2 **Data for Chatbot Context**
```
Chatbot needs (from Dashboard API):
GET /api/sessions?limit=10
  - Recent 10 sessions for context

GET /api/user/profile
  - User profile (age, goals, stress triggers)

GET /api/stats/weekly
  - Weekly trends and insights
```

---

## 🗄️ Database Schema Required

### User Table
```sql
users
├─ id (UUID, PK)
├─ email (VARCHAR UNIQUE)
├─ passwordHash (VARCHAR - bcryptjs hash)
├─ createdAt (TIMESTAMP)
└─ updatedAt (TIMESTAMP)
```

### User Profile Table
```sql
user_profiles
├─ id (UUID, PK)
├─ userId (UUID, FK → users.id)
├─ age (INT)
├─ goals (TEXT[] - JSON array)
├─ stressTriggers (TEXT[] - JSON array)
├─ maxHeartRate (INT)
├─ createdAt (TIMESTAMP)
└─ updatedAt (TIMESTAMP)
```

### Sessions Table
```sql
sessions
├─ id (UUID, PK)
├─ userId (UUID, FK → users.id)
├─ startedAt (TIMESTAMP)
├─ endedAt (TIMESTAMP)
├─ sessionType (VARCHAR)
├─ durationSec (INT)
├─ avgHr (INT)
├─ maxHr (INT)
├─ avgHrvMs (INT)
├─ stressSummary (VARCHAR)
├─ createdAt (TIMESTAMP)
├─ updatedAt (TIMESTAMP)
└─ Indexes: (userId, startedAt), (userId)
```

---

## 📦 Feature Integration Map

### Current (No Backend)
```
Browser
├─ Dashboard UI ✅
│  ├─ Display stress levels
│  ├─ Show ECG chart
│  └─ localStorage sessions
├─ Session Pause/Resume ✅
├─ Signal Filtering ✅
└─ Chatbot UI (waits for API)
    └─ ❌ No data context
```

### After Backend Implementation
```
Browser
├─ Dashboard UI ✅
│  ├─ Login/Register pages
│  ├─ Fetch sessions from API
│  ├─ Display stress levels
│  └─ Show ECG chart
├─ Session Pause/Resume ✅
├─ Signal Filtering ✅
└─ Chatbot UI ✅
    ├─ Fetch user profile from API
    ├─ Fetch recent sessions from API
    ├─ Fetch weekly stats from API
    └─ Send context to chatbot backend

Server (Next.js API Routes)
├─ /api/auth/* (register, login)
├─ /api/user/profile (GET/POST)
├─ /api/sessions/* (GET, POST, DELETE)
└─ /api/stats/* (weekly, monthly)

Database
├─ Users table
├─ User profiles table
└─ Sessions table

Chatbot Backend (FastAPI)
├─ POST /api/chat (existing)
└─ Calls Dashboard API for context
```

---

## 🚀 Implementation Priority

### PHASE 1: Setup Database & Auth (Day 1 - Tomorrow)
**Time:** 2-3 hours
**Priority:** 🔴 CRITICAL - Everything else depends on this

1. Install dependencies:
   ```bash
   npm install bcryptjs jsonwebtoken
   npm install -D prisma @prisma/client
   ```

2. Set up database (PostgreSQL recommended)
   - Configure connection
   - Run migrations

3. Create auth endpoints:
   - `POST /api/auth/register`
   - `POST /api/auth/login`

### PHASE 2: Sessions & Profile APIs (Day 1-2)
**Time:** 2-3 hours
**Priority:** 🔴 CRITICAL

1. Create user profile endpoint:
   - `GET/POST /api/user/profile`

2. Create sessions endpoints:
   - `GET /api/sessions`
   - `POST /api/sessions`
   - `DELETE /api/sessions/{id}`

### PHASE 3: Merge All Frontend Features (Day 2)
**Time:** 1-2 hours
**Priority:** 🟠 HIGH

1. Merge branches into Dashboard:
   - `session-state-manager` (pause/resume)
   - `ui-visualization-engine` (signal filters)
   - `ending-session` (session summary)
   - `feedback-control` (optional)

2. Test integration

### PHASE 4: Migrate Dashboard to API (Day 2)
**Time:** 2-3 hours
**Priority:** 🟠 HIGH

1. Replace localStorage with API calls
2. Add login/register pages
3. Add JWT token management

### PHASE 5: Connect Chatbot (Day 3 - Morning)
**Time:** 1-2 hours
**Priority:** 🟡 MEDIUM

1. Update chatbot backend to call Dashboard API
2. Pass JWT tokens
3. Test context passing

### PHASE 6: Testing & Deployment (Day 3)
**Time:** 2-3 hours
**Priority:** 🟡 MEDIUM

1. Full end-to-end testing
2. Deploy to production
3. Demo day!

---

## 📊 Data Flow Architecture (After Backend)

```
User Actions:
1. Register/Login
   Browser → POST /api/auth/register or /api/auth/login
   ↓
   Backend → Hash password (bcrypt), create user, generate JWT
   ↓
   Database → Store user credentials
   ↓
   Browser → Store JWT in localStorage

2. Start ECG Session
   Browser (sensor) → Collect ECG, HR, HRV data
   ↓
   Browser → POST /api/sessions (with JWT in header)
   ↓
   Backend → Validate JWT, store session
   ↓
   Database → Save session with userId

3. View Dashboard
   Browser → GET /api/sessions (with JWT)
   ↓
   Backend → Validate JWT, fetch user's sessions from DB
   ↓
   Database → Query sessions WHERE userId = currentUser
   ↓
   Browser → Display in dashboard

4. Chat with Bot
   Browser → User types question
   ↓
   Browser → GET /api/user/profile (JWT)
   Browser → GET /api/sessions?limit=10 (JWT)
   Browser → GET /api/stats/weekly (JWT)
   ↓
   Browser → POST chatbot_backend/api/chat with context
   ↓
   Chatbot → Call LLM with user context
   ↓
   Chatbot → Return personalized advice
```

---

## ✅ Merge Order (After Backend Ready)

```
1. session-state-manager → Dashboard
   (pause/resume feature)

2. ui-visualization-engine → Dashboard
   (ECG filters & signal processing)

3. ending-session → Dashboard
   (session summary component)

4. feedback-control → Dashboard (optional)
   (feedback UI & notifications)

5. Final → main branch
   (when ready for production)
```

---

## 🎯 What Each Team Member Should Focus On

### Tiffany (You):
1. **Build Backend Infrastructure** (Phases 1-2)
   - Database setup (PostgreSQL + Prisma)
   - Auth API endpoints
   - Sessions API endpoints
   - User profile API

2. **Migrate Dashboard** (Phase 4)
   - Replace localStorage with API calls
   - Create login/register pages
   - Add JWT token management

3. **Testing** (Phase 6)
   - Full end-to-end testing
   - Bug fixes

### Antonia:
1. **Connect Chatbot Backend** (Phase 5)
   - Update `backend/main.py`
   - Call Dashboard API for context
   - Test with real data

2. **Testing** (Phase 6)
   - Chatbot integration testing

### Other Team Members:
1. **Code Review** (Ongoing)
   - Review API implementations
   - Review merged features
   - Check for bugs

2. **Testing** (Phase 6)
   - Functional testing
   - UI/UX testing

---

## 🔧 Tech Stack Decision

| Layer | Choice | Why |
|-------|--------|-----|
| Database | PostgreSQL | Relational, Prisma support, scalable |
| ORM | Prisma | TypeScript support, excellent migrations |
| Auth | JWT + bcryptjs | Stateless, secure, scalable |
| API Host | Next.js API Routes | Same repo, no deployment complexity |
| Deployment | Vercel | Next.js native, free tier, automatic |

---

## 📋 Success Checklist (By April 27 EOD)

- [ ] Database set up and tested
- [ ] Auth endpoints working (register, login)
- [ ] User profile endpoint working
- [ ] Sessions CRUD endpoints working
- [ ] Stats endpoints working
- [ ] All feature branches merged into Dashboard
- [ ] Dashboard uses API (not localStorage)
- [ ] Login/Register pages created
- [ ] JWT token management implemented
- [ ] Chatbot connected to API
- [ ] Full end-to-end testing passed
- [ ] No console errors
- [ ] Deployed to production/staging

---

## 🎯 Final Status

```
CURRENT STATE (April 25, 5:30 PM):
├─ Frontend Features: ✅ 100% Built
│  ├─ Dashboard UI
│  ├─ Session pause/resume
│  ├─ Signal filtering
│  ├─ Session summary
│  └─ Feedback collection
├─ Chatbot Backend: ✅ 100% Built (FastAPI)
├─ Backend Infrastructure: ❌ 0% (BLOCKER)
├─ Database: ❌ 0% (BLOCKER)
└─ Authentication: ❌ 0% (BLOCKER)

READY TO START BUILDING:
- Database schema finalized
- API endpoints specified
- Merge order determined
- Team roles assigned

NEXT STEP: Start Phase 1 (Database & Auth)
```

---

## 🚀 Ready to Begin?

All features from your team are identified and ready to integrate. The backend is the critical path.

**Recommended action:** Start with Phase 1 tomorrow morning (database + auth).

**Questions?** Refer to:
- `PROJECT_COMPLETE_ANALYSIS.md` - Detailed architecture
- `BACKEND_MIGRATION_PLAN.md` - API implementation guide
- `QUICK_REFERENCE.md` - Quick lookup table
