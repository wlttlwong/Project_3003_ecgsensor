# Complete Project Architecture & Integration Plan
## BIOF3003 ECG Heart Rate Stress Monitor

**Repository:** `git@github.com:wlttlwong/Project_3003_ecgsensor.git`  
**Date:** April 25, 2026  
**Demo Date:** April 28, 2026 (3 days away)  
**Team:** Tiffany (You) + Antonia

---

## 🏗️ Complete Branch Inventory & Status

### ACTIVE FEATURE BRANCHES (Recent Work)

#### 1. **`Dashboard`** (Tiffany) ✅ COMPLETE
- **Last Update:** April 20, 2026 (commit: e6fe2e7)
- **Status:** ✅ Production-Ready Frontend
- **Components:**
  - ✅ ECG Chart visualization
  - ✅ Heart Rate Monitor
  - ✅ Stress Level System (4 categories)
  - ✅ Weekly/Monthly/Yearly stats
  - ✅ Personalized insights
  - ✅ Calibration modal
  - ✅ localStorage persistence (temporary)
- **Files:**
  - `app/dashboard/page.tsx` - Main dashboard
  - `app/components/ECGChart.tsx` - Chart visualization
  - `app/components/HeartRateMonitor.tsx` - HR display
  - `app/lib/sessions.ts` - Session management (localStorage)
  - `app/lib/stress.ts` - Stress level classification
  - `app/lib/hrZones.ts` - HR zone logic
  - `app/hooks/useHeartRateSensor.ts` - Sensor integration
- **Technology:** Next.js 14.2.13, React 18, TypeScript, Tailwind CSS
- **Ready for:** API backend integration

#### 2. **`chatbot`** (Antonia) 🔄 PARTIAL
- **Last Update:** April 21, 2026 (commit: ec5e2cb)
- **Status:** 🔄 Backend exists, needs integration
- **Backend Stack:**
  - FastAPI (Python)
  - OpenAI client (Ollama local LLM support)
  - CORS enabled for Next.js frontend
- **Backend Files:**
  - `backend/main.py` - FastAPI server
  - `backend/requirement.txt` - Python dependencies
- **API Endpoint:** `POST /api/chat`
- **Expected Data:**
  - User profile (age, stressTriggers, goals)
  - Current session data (avgHR, avgHRV, stressLevel)
  - Recent sessions history
  - Weekly insights
- **LLM Model:** `qwen2.5:7b` (via Ollama local)
- **Requires:** 
  - Session data from Dashboard API
  - User profile from user management
  - Ollama running locally or remotely

#### 3. **`ui-visualization-engine`** (Antonia) ✅ FEATURE
- **Last Update:** April 25, 2026 (commit: 432bf9f)
- **Status:** ✅ Advanced ECG utilities ready
- **Special Utilities:**
  - `app/utils/ecgAnalysis.ts` - ECG signal analysis
  - `app/utils/ecgFilters.ts` - Signal filtering
  - `app/utils/exportData.ts` - Data export
  - `app/utils/signalQuality.ts` - Signal quality detection
- **Purpose:** Signal processing and data visualization
- **Can be merged into:** Dashboard or kept separate for advanced features

#### 4. **`ending-session`** (Feature) 📝 PARTIAL
- **Last Update:** April 20, 2026 (commit: 3507b44)
- **Status:** 📝 Session summary UI added
- **New Components:**
  - `app/components/SessionSummary.tsx` - Post-session summary
  - `app/components/StressScoreInfo.tsx` - Stress explanation
- **Purpose:** Show session results and stress breakdown
- **Ready to merge into:** Dashboard

#### 5. **`feedback-control`** (Feature) 📊 PARTIAL
- **Last Update:** April 20, 2026 (commit: a9d5aae)
- **Status:** 📊 User feedback collection
- **Purpose:** Collect user feedback on recommendations
- **Components:** Basic structure, needs detailed UI

#### 6. **`session-state-manager`** (Feature) 🔄 PARTIAL
- **Last Update:** April 19, 2026 (commit: 91b0e6b)
- **Status:** 🔄 State management structure
- **Purpose:** Centralized session state handling
- **Can improve:** Redux/Zustand state management

### DEPRECATED BRANCHES

- **`main`** (March 21, 2025) - Initial boilerplate only
- **`develop`** - Placeholder (not used)
- **`homepage`** - Placeholder
- **`analysis-algorithms`** - Placeholder

---

## 🎯 Integration Strategy & Next Steps

### PRIORITY 1: Merge UI Features into Dashboard (ASAP)
```bash
# 1. Merge ending-session components
git cherry-pick ending-session -- app/components/SessionSummary.tsx
git cherry-pick ending-session -- app/components/StressScoreInfo.tsx

# 2. Review feedback-control for feedback UI
git show feedback-control:app/components/*

# 3. Check ui-visualization-engine utilities
git show ui-visualization-engine:app/utils/*
```

**Why?** These are small, focused features that improve Dashboard without requiring backend changes.

**Effort:** 1-2 hours  
**Impact:** Better UX before API migration

---

### PRIORITY 2: Create Backend API Layer (CRITICAL)
This is the **blocking dependency** for both Dashboard data persistence and Chatbot integration.

#### Architecture:
```
┌─────────────────────────────────────────────────────┐
│             Next.js Frontend (Dashboard)             │
│  • Session UI                                        │
│  • Stress visualization                              │
│  • User settings                                     │
└──────────────┬──────────────────────────────────────┘
               │ HTTP Requests
        ┌──────▼──────────────────────────────┐
        │   Next.js API Routes (New)           │
        │ • /api/auth/*                        │
        │ • /api/sessions/*                    │
        │ • /api/user/profile                  │
        │ • /api/stats/*                       │
        └──────┬──────────────────────────────┘
               │ Database Queries
        ┌──────▼──────────────────────────────┐
        │   PostgreSQL Database (TBD)          │
        │ • users table                        │
        │ • sessions table                     │
        │ • user_profiles table                │
        └──────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│       Python Chatbot Service (Antonia)              │
│       • FastAPI backend/main.py                     │
│       • POST /api/chat endpoint                     │
│       • Ollama LLM integration                      │
└──────────────┬──────────────────────────────────────┘
               │ Fetches context
        ┌──────▼──────────────────────────────┐
        │   Next.js API Routes                │
        │   (shared data access)              │
        └──────────────────────────────────────┘
```

#### New Files to Create:

**1. `app/api/auth/register/route.ts`**
- Accept: `{ email, password, age? }`
- Hash password with bcryptjs
- Create user record in database
- Return JWT token

**2. `app/api/auth/login/route.ts`**
- Accept: `{ email, password }`
- Verify password
- Return JWT token

**3. `app/api/user/profile/route.ts`**
- GET: Fetch user profile
- POST: Update profile (age, goals, stressTriggers)

**4. `app/api/sessions/route.ts`**
- GET: Fetch user's sessions (with pagination)
- POST: Create new session

**5. `app/api/sessions/[id]/route.ts`**
- DELETE: Remove session

**6. `app/api/stats/weekly/route.ts`**
- GET: Weekly aggregated stats

**7. `app/api/stats/monthly/route.ts`**
- GET: Monthly aggregated stats

**8. `lib/db.ts`** (Database connection)
- Connection pooling
- Query helpers

**9. `lib/middleware.ts`** (Auth middleware)
- JWT verification
- User context

**10. `prisma/schema.prisma`** (if using Prisma)
- Database schema definitions

#### Dependencies to Install:
```bash
npm install bcryptjs jsonwebtoken
npm install -D prisma @prisma/client
# OR
npm install mongoose
# OR
npm install firebase-admin
```

**Timeline:** 4-6 hours  
**Blocker for:** Dashboard data persistence, Chatbot context data

---

### PRIORITY 3: Connect Dashboard to Backend API
Once API routes exist, migrate all localStorage calls to fetch().

**Files to Modify:**
- `app/lib/sessions.ts` - Replace localStorage with API calls
- `app/dashboard/page.tsx` - Add auth state, JWT token management
- Add new: `app/lib/auth.ts` - Authentication service
- Add new: `app/lib/apiClient.ts` - API client with token injection

**Timeline:** 2-3 hours  
**Unblocks:** Persistent data storage

---

### PRIORITY 4: Create Login/Register UI
Users need to create accounts and authenticate.

**New Pages:**
- `app/login/page.tsx` - Login form
- `app/register/page.tsx` - Registration form
- `app/profile/page.tsx` - User profile editor (optional)

**Timeline:** 2-3 hours

---

### PRIORITY 5: Connect Chatbot Backend to Session API
Antonia's chatbot needs to fetch session data from the API.

**Integration Points:**
- `backend/main.py` → calls `/api/sessions` (authenticated)
- `backend/main.py` → calls `/api/user/profile` (authenticated)
- `backend/main.py` → calls `/api/stats/weekly` (for context)

**Requires:** 
- Session API endpoints working
- Auth tokens properly configured
- CORS properly configured

**Timeline:** 1-2 hours

---

## 📊 Complete Project Timeline

```
Today (April 25):
├─ 9:00 AM  → Assess all branches ✅ (YOU ARE HERE)
├─ 10:00 AM → Plan integration strategy
├─ 11:00 AM → Coordinate with Antonia on database
└─ 2:00 PM  → Start backend API implementation

April 26 (Tomorrow):
├─ 9:00 AM  → Finish API routes (auth, sessions)
├─ 2:00 PM  → Migrate Dashboard to use API
└─ 5:00 PM  → Basic login/register pages

April 27:
├─ 9:00 AM  → Connect chatbot to API
├─ 12:00 PM → Testing and bug fixes
└─ 5:00 PM  → Deploy to staging

April 28 (DEMO DAY):
├─ 9:00 AM  → Final testing
├─ 1:00 PM  → DEMO to instructors
└─ 3:00 PM  → Celebration 🎉
```

---

## 🔧 Recommended Merge Strategy

### Option A: Sequential Merge (RECOMMENDED)
1. **Today (Apr 25):** Create feature branch from Dashboard
2. **Tonight (Apr 25):** Add ending-session components + basic feedback UI
3. **Tomorrow (Apr 26):** Add backend API + auth
4. **Tomorrow (Apr 26):** Add login/register UI
5. **Apr 27:** Chatbot integration testing
6. **Apr 28:** Demo

### Option B: Parallel Development
- Keep branches separate
- Merge only at end (risky - integration issues)
- **NOT RECOMMENDED** (too little time)

---

## 💾 Database Schema (To Finalize with Antonia)

```sql
-- PostgreSQL Schema (with Prisma ORM)

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  passwordHash  String    // bcryptjs hash
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  profile       UserProfile?
  sessions      Session[]
}

model UserProfile {
  id            String    @id @default(cuid())
  userId        String    @unique
  age           Int?
  goals         String[]  // ["weight loss", "endurance", "recovery"]
  stressTriggers String[]  // ["work", "sleep", "caffeine", "sugar"]
  maxHeartRate  Int?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  user          User      @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Session {
  id            String    @id @default(cuid())
  userId        String
  startedAt     DateTime
  endedAt       DateTime
  sessionType   String    // "walking", "jogging", "cycling", "rest"
  durationSec   Int
  avgHr         Int?
  maxHr         Int?
  avgHrvMs      Int?
  stressSummary String    // "Low Stress 🌿"
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  user          User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@index([startedAt])
}
```

---

## ✅ Merge Checklist for Demo Readiness

**Pre-Demo (April 27):**
- [ ] Dashboard branch + ending-session merged
- [ ] Backend API endpoints all working
- [ ] Login/Register pages functional
- [ ] Dashboard uses API (no localStorage)
- [ ] Chatbot connects to API successfully
- [ ] All branches compile without errors
- [ ] Sample data works for demo
- [ ] Responsive design tested
- [ ] Error handling tested
- [ ] JWT tokens refresh working

**Demo Day (April 28):**
- [ ] Fresh build, no console errors
- [ ] Create account flow works
- [ ] Login/logout works
- [ ] Dashboard loads user data
- [ ] Stress visualization works
- [ ] Chatbot responds to questions
- [ ] All pages accessible after login
- [ ] Mobile view responsive

---

## 🚀 Recommended Action Plan (Next 2 Hours)

1. **Create summary document** ✅ (This file)

2. **Sync with Antonia** (30 min)
   - Confirm database choice (PostgreSQL recommended)
   - Confirm API endpoint specs
   - Confirm chatbot data needs
   - Assign tasks clearly

3. **Prepare feature branches** (30 min)
   - Create `feature/backend-api` branch
   - Create `feature/ui-merge` branch
   - Cherry-pick components from other branches

4. **Start backend implementation** (optional for today)
   - Set up database connection
   - Create API route structure
   - Implement auth endpoints

---

## 📝 Notes for Antonia

**Points to Discuss:**

1. **Database Platform:**
   - Recommend: PostgreSQL + Prisma (best for Next.js)
   - Alternative: Firebase (simpler, no server management)
   - Alternative: MongoDB (more flexible schema)

2. **Backend Service:**
   - Your chatbot: Already has FastAPI backend ✅
   - Need coordination: How will chatbot get session data?
   - Suggestion: Chatbot calls `/api/sessions`, `/api/user/profile`

3. **LLM Service:**
   - Current: Ollama local model
   - For deployment: Use cloud LLM or self-hosted Ollama
   - Need: Environment variable for LLM endpoint

4. **Authentication:**
   - Chatbot needs: JWT token to access session data
   - Option A: Pass token from frontend to chatbot
   - Option B: Chatbot gets token via service-to-service auth

5. **Deployment:**
   - Frontend: Vercel (Next.js native)
   - Chatbot Python backend: Where? (Render, Railway, AWS Lambda?)
   - Database: PostgreSQL on Neon/Railway/AWS?

---

## 📁 Final Branch Structure (Target State)

```
main (protected)
├─ Dashboard (Tiffany) ← merged features
│  ├─ API endpoints
│  ├─ UI from ending-session
│  ├─ Auth pages
│  ├─ Session persistence via API
│  └─ Stress visualization + personalized insights
│
└─ chatbot (Antonia)
   ├─ FastAPI backend
   ├─ Connected to Dashboard API
   ├─ Ollama LLM integration
   └─ User context from Dashboard sessions
```

---

## 🎓 Key Takeaway

You're **very close** to a complete solution! 

- ✅ Frontend UI is excellent and complete
- ✅ Stress system is working perfectly
- ✅ Chatbot logic is ready (just needs data integration)
- ✅ Signal analysis utilities are ready
- ❌ Backend infrastructure is the only missing piece

**With 3 days to demo, the priority is:**
1. Get database + API working (even with fake data initially)
2. Connect all frontends to the API
3. Deploy to production
4. Test real-world scenario

This is very achievable! Let's build the backend integration. 🚀
