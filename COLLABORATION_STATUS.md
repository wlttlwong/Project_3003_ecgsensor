# Collaboration Status with Antonia
## Backend Architecture Planning

**Date:** April 25, 2026  
**Project:** ECG Heart Rate Monitor Dashboard  
**Repository:** `git@github.com:wlttlwong/Project_3003_ecgsensor.git`

---

## Current Repository Branches

### Tiffany's Work (You)
- **`Dashboard`** (current branch) ✅
  - ✅ ECG Chart visualization
  - ✅ Heart Rate Monitor UI
  - ✅ Stress level classification system
  - ✅ Weekly/monthly stats calculations
  - ✅ Personalized insights
  - ✅ Calibration modal
  - ✅ localStorage-based data persistence (temporary)
  - **Status:** COMPLETE - Ready for API migration

### Antonia's Work (Other Branches)
- **`ui-visualization-engine`** 📊
  - Frontend chart components
  - Same Next.js 14.2.13 stack as yours
  - No backend code yet

- **`chatbot`** 💬
  - Chatbot UI/functionality
  - Same Next.js 14.2.13 stack
  - No API integration yet

- **`session-state-manager`** 📝
  - Session state management
  - Same Next.js 14.2.13 stack
  - No backend persistence yet

- **`analysis-algorithms`** 📈
  - Data analysis logic
  - No backend yet

### Not Yet Started
- **Backend authentication** ❌
- **Database schema** ❌
- **API routes** ❌
- **User management** ❌

---

## Tech Stack (Unified)

Both you and Antonia are using:
- **Framework:** Next.js 14.2.13 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + PostCSS
- **Frontend:** React 18
- **Charts:** chart.js + react-chartjs-2
- **Date Utilities:** date-fns

### What's Missing for Backend
- ❌ Database (PostgreSQL, MongoDB, Firebase, etc.)
- ❌ ORM/Query Builder (Prisma, Mongoose, etc.)
- ❌ Authentication library (JWT, NextAuth.js, bcrypt)
- ❌ API middleware
- ❌ Password hashing

---

## Architecture Recommendation

### Option A: Monorepo Backend (Recommended for this project)
```
Project_3003_ecgsensor/
├── app/                    # Next.js frontend (your Dashboard branch)
│   ├── api/               # NEW: Backend API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── sessions/      # Session CRUD
│   │   ├── user/          # User profile
│   │   └── stats/         # Stats calculations
│   ├── components/        # React components
│   ├── lib/               # Business logic
│   └── (dashboard, etc)   # Pages
├── lib/
│   ├── db.ts              # NEW: Database connection
│   └── middleware.ts      # NEW: Auth middleware
├── prisma/                # NEW: Database schema (if using Prisma)
│   └── schema.prisma
└── package.json           # Add backend dependencies
```

**Pros:**
- Single repository (cleaner git history)
- Shared types between frontend and backend
- Easy deployment (one Vercel app)
- Seamless chatbot integration with shared data

**Cons:**
- Slightly larger package size

### Option B: Separate Backend Repository
- Keep this for frontend
- Create new backend repository
- **Not recommended** for this timeline (adds deployment complexity)

---

## Implementation Plan for Backend

### Phase 1: Setup (2 hours)
1. Install dependencies:
   ```bash
   npm install bcryptjs jsonwebtoken
   npm install -D prisma @prisma/client
   # OR for MongoDB:
   # npm install mongoose
   # OR for Firebase:
   # npm install firebase-admin
   ```

2. Choose database (coordinate with Antonia):
   - **PostgreSQL + Prisma** (recommended - best for relational data)
   - **MongoDB + Mongoose** (flexible schema)
   - **Firebase** (serverless, real-time)
   - **Supabase** (PostgreSQL + auth built-in)

3. Set up environment variables:
   ```
   DATABASE_URL=
   JWT_SECRET=your-super-secret-key-minimum-32-chars
   ```

### Phase 2: Database Schema (1-2 hours with Antonia)
Define tables/collections:
```sql
-- PostgreSQL Example (Prisma)
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  passwordHash String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  profile   UserProfile?
  sessions  Session[]
}

model UserProfile {
  id          String   @id @default(cuid())
  userId      String   @unique
  age         Int?
  goals       String[] // ["weight loss", "endurance", "recovery"]
  stressTriggers String[] // ["work", "sleep", "caffeine"]
  maxHeartRate Int?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  user User @relation(fields: [userId], references: [id])
}

model Session {
  id           String   @id @default(cuid())
  userId       String
  startedAt    DateTime
  endedAt      DateTime
  sessionType  String   // "walking", "jogging", "cycling", "rest"
  durationSec  Int
  avgHr        Int?
  maxHr        Int?
  avgHrvMs     Int?
  stressSummary String  // "Low Stress 🌿"
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  
  user User @relation(fields: [userId], references: [id])
}
```

### Phase 3: Authentication API (2 hours)
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Return JWT token
- `POST /api/auth/logout` - Invalidate token
- Auth middleware for protected routes

### Phase 4: Sessions API (2 hours)
- `GET /api/sessions` - Fetch user sessions
- `POST /api/sessions` - Create new session
- `DELETE /api/sessions/:id` - Delete session

### Phase 5: User Profile API (1 hour)
- `GET /api/user/profile` - Fetch profile
- `POST /api/user/profile` - Update profile

### Phase 6: Stats API (1-2 hours)
- `GET /api/stats/weekly` - Weekly stats
- `GET /api/stats/monthly` - Monthly stats

### Phase 7: Frontend Migration (3-4 hours)
- Replace localStorage with API calls
- Create login/register pages
- Add JWT token management
- Update dashboard to fetch from API

### Phase 8: Testing & Refinement (2 hours)

---

## Next Steps

### IMMEDIATE (Next 2 hours)
1. **Schedule sync with Antonia** to decide:
   - Database platform (PostgreSQL, MongoDB, Firebase, Supabase?)
   - If using Prisma or native driver
   - Where to host backend (Vercel, AWS, custom server?)
   - User profile schema details (age, goals, stress triggers, custom fields?)

2. **Add to Backend Coordination Document:**
   - Chatbot data access requirements
   - Real-time data sync needs
   - Security requirements

### THEN (Tomorrow - April 26)
1. Create `api/` folder structure
2. Install backend dependencies
3. Set up Prisma (or chosen ORM)
4. Create database schema
5. Deploy database

### FINALLY (April 26-27)
1. Implement authentication API
2. Implement sessions API
3. Migrate frontend to use API
4. Test full flow
5. Deploy to production

---

## Communication Checklist with Antonia

- [ ] **Database Choice:** Which platform? (PostgreSQL, MongoDB, Firebase, etc.)
- [ ] **ORM/Driver:** Prisma, Mongoose, native driver, or Firebase Admin SDK?
- [ ] **Hosting:** Where will backend be deployed? (Vercel, AWS Lambda, custom server?)
- [ ] **User Profile Fields:** Beyond age/goals/stressTriggers - any other fields?
- [ ] **Chatbot Integration:** What data does chatbot need from sessions?
- [ ] **Real-time:** Do we need real-time updates (WebSockets/Firebase) or polling?
- [ ] **Authentication:** JWT tokens OK? Token expiration time?
- [ ] **Password Policy:** Min length, complexity requirements?
- [ ] **Data Retention:** How long to keep old sessions?
- [ ] **Rate Limiting:** Need API rate limiting for auth endpoints?

---

## Current Status Summary

| Component | Status | Owner | Timeline |
|-----------|--------|-------|----------|
| Frontend UI | ✅ COMPLETE | Tiffany | Done |
| Stress System | ✅ COMPLETE | Tiffany | Done |
| Stats Calc | ✅ COMPLETE | Tiffany | Done |
| localStorage Persistence | ✅ COMPLETE | Tiffany | Done |
| **Database** | ❌ TODO | Antonia | **BLOCKER** |
| **Auth API** | ❌ TODO | Tiffany | After DB |
| **Sessions API** | ❌ TODO | Tiffany | After DB |
| **Frontend API Integration** | ❌ TODO | Tiffany | After APIs |
| **Chatbot Integration** | ❌ TODO | Antonia | After Sessions API |

---

## Files Ready for API Integration

Your codebase is ready to migrate:

- ✅ `app/lib/sessions.ts` - All functions marked for API replacement
- ✅ `app/lib/stress.ts` - Pure logic, no DB dependency
- ✅ `app/types/session.ts` - Types ready to extend with User/Auth
- ✅ `app/dashboard/page.tsx` - State management structure prepared
- ✅ `app/lib/hrZones.ts` - Pure logic, ready for backend

---

## Decision Matrix

| Decision | Option A | Option B | Option C |
|----------|----------|----------|----------|
| **Database** | PostgreSQL (Supabase) | MongoDB | Firebase |
| **Pros** | ✓ SQL, joins, transactions | ✓ Flexible schema | ✓ No server management |
| **Cons** | ✗ Need server | ✗ More complex queries | ✗ Firebase lock-in |
| **Timeline** | 2 hours setup | 2 hours setup | 1 hour setup |
| **Cost** | $7-50/month | Free-15/month | Free-30/month |

---

## Ready to Proceed?

1. ✅ Your dashboard is feature-complete
2. ✅ Tech stack aligned with Antonia
3. ❌ Database schema needed (Antonia)
4. ❌ Backend dependencies needed
5. ❌ API routes needed

**Recommendation:** Schedule 30-min sync with Antonia to finalize database schema, then start backend implementation on April 26.

Project demo: **April 28** (3 days away) - Keep MVP scope focused on auth + sessions.
