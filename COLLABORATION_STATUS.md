# Collaboration Status
## Dashboard Branch Implementation Log

**Date:** April 25, 2026  
**Current Branch:** `Dashboard`  
**Repository:** `https://github.com/wlttlwong/Project_3003_ecgsensor.git`

---

## Purpose of This Document

This file records the work completed on the `Dashboard` branch during the current implementation session, what was verified, what remains temporary, and what still needs to be done next.

It is intended to answer:
- what has already been implemented
- what was only scaffolded for the demo
- what other branches contain that still needs to be ported
- what the next recommended engineering steps are

---

## Work Completed in This Session

### 1. Repository Setup and Branch Control

Completed:
- cloned the repository into `C:\Users\th0ma\OneDrive\Desktop\BIOF3003_3003_ecgsensor`
- fetched the remote `Dashboard` branch
- switched the working tree to local branch `Dashboard`
- confirmed later work stayed on `Dashboard`

Reason:
- all later implementation requested by Tiffany should happen on the `Dashboard` branch, not `main`

---

### 2. Backend Foundation Added Inside Next.js App Router

New API routes were created under `app/api/` so the dashboard is no longer blocked by having zero backend structure.

Added routes:
- `app/api/auth/register/route.ts`
- `app/api/auth/login/route.ts`
- `app/api/auth/logout/route.ts`
- `app/api/auth/me/route.ts`
- `app/api/user/profile/route.ts`
- `app/api/sessions/route.ts`
- `app/api/sessions/[id]/route.ts`
- `app/api/stats/weekly/route.ts`
- `app/api/stats/monthly/route.ts`
- `app/api/stats/summary/route.ts`
- `app/api/health/route.ts`

What these routes currently do:
- register a user
- log in a user
- validate the current token
- create and update a user profile
- create, list, and delete sessions
- calculate weekly, monthly, and summary statistics

Important note:
- this is a real API contract inside the app, but it is **not yet backed by PostgreSQL + Prisma**

---

### 3. Authentication Layer Implemented

Added server-side auth utilities:
- `app/lib/server/auth.ts`

Implemented:
- password hashing using Node `crypto.scryptSync`
- password verification
- JWT-style token creation using HMAC SHA-256
- token verification
- bearer token extraction from requests

Why this was done:
- the branch analysis and migration plan require auth endpoints before sessions and profile APIs become usable

Limitations:
- this is a lightweight custom implementation for the current branch
- it is suitable as a temporary app-level auth mechanism
- final project target is still better served by proper persistent database-backed auth

---

### 4. Temporary Server Data Store Added

Added:
- `app/lib/server/store.ts`

What it does:
- lazily creates a local JSON database file at runtime under `data/demo-db.json`
- stores users, profiles, and sessions
- serializes writes to avoid overlapping file writes

Why this was done:
- the project needed working backend behavior immediately
- no PostgreSQL database URL or Prisma schema was available yet
- this unblocked auth and API migration work without waiting for infrastructure

Important limitation:
- this is only a temporary stand-in
- this does **not** satisfy the "Real Database (PostgreSQL + Prisma)" requirement from `TEAM_FEATURE_ANALYSIS.md`

Git handling:
- `data/demo-db.json` is ignored in `.gitignore`
- the data file is created only when the app runs

---

### 5. Server Statistics Utilities Added

Added:
- `app/lib/server/stats.ts`

Implemented:
- weekly date range logic
- generic range filtering for sessions
- stats calculation for:
  - session count
  - total duration in minutes
  - average heart rate
  - max heart rate
  - average HRV

Reason:
- the stats endpoints from the team guideline needed shared calculation logic

---

### 6. Frontend Auth and API Client Added

Added client-side helpers:
- `app/lib/auth.ts`
- `app/lib/apiClient.ts`
- `app/types/user.ts`

What these files now handle:
- storing and clearing auth session in `localStorage`
- reading auth token for API calls
- calling register/login/profile/session/stats endpoints
- clearing auth state on `401 Unauthorized`

Why this matters:
- the dashboard can now call a backend layer instead of only using `localStorage`

---

### 7. Login and Register Pages Created

Added:
- `app/login/page.tsx`
- `app/register/page.tsx`

Features:
- registration form with email, password, optional age
- login form with email and password
- redirects to `/dashboard` on success
- error handling for failed submissions

Reason:
- `TEAM_FEATURE_ANALYSIS.md` explicitly identified login/register pages as part of the migration path

---

### 8. Dashboard Partially Migrated Away from Pure localStorage

Updated:
- `app/dashboard/page.tsx`

What changed:
- dashboard now checks for an auth token
- if signed in, it loads sessions from the new API
- if not signed in, it falls back to the existing local demo storage
- sample session loading can now target either:
  - API-backed storage when authenticated
  - local demo storage when unauthenticated
- clear sessions can now delete via API when authenticated
- added visible account/storage status section:
  - API sync enabled
  - guest mode / local demo storage
  - sign in / register / logout controls

Why this design was chosen:
- it keeps the dashboard usable immediately
- it allows backend migration work to progress without breaking the existing demo flow
- it avoids blocking the team on database infrastructure before the UI can continue moving

Current state:
- dashboard is no longer "frontend only"
- but it is also not yet fully migrated to a real production database stack

---

### 9. Home Page and Metadata Updated

Updated:
- `app/page.tsx`
- `app/layout.tsx`

Changes:
- added entry links for:
  - sign in
  - register
  - dashboard
- updated metadata title and description to match the ECG project instead of default Next.js boilerplate

---

### 10. Dependency Installation and Project Verification

Performed:
- `npm install`
- `npm.cmd run lint`
- `npm.cmd run build`

Verification result:
- lint passed
- production build passed

Notes:
- `npm run lint` through PowerShell failed initially because `npm.ps1` was blocked by execution policy
- rerunning with `npm.cmd` solved that
- initial build inside sandbox failed with Windows `spawn EPERM`
- rerunning the build outside sandbox succeeded

---

## Files Added or Changed

### New Files

- `app/api/auth/register/route.ts`
- `app/api/auth/login/route.ts`
- `app/api/auth/logout/route.ts`
- `app/api/auth/me/route.ts`
- `app/api/user/profile/route.ts`
- `app/api/sessions/route.ts`
- `app/api/sessions/[id]/route.ts`
- `app/api/stats/weekly/route.ts`
- `app/api/stats/monthly/route.ts`
- `app/api/stats/summary/route.ts`
- `app/api/health/route.ts`
- `app/lib/server/auth.ts`
- `app/lib/server/store.ts`
- `app/lib/server/stats.ts`
- `app/lib/auth.ts`
- `app/lib/apiClient.ts`
- `app/login/page.tsx`
- `app/register/page.tsx`
- `app/types/user.ts`

### Updated Files

- `.gitignore`
- `app/dashboard/page.tsx`
- `app/page.tsx`
- `app/layout.tsx`
- `package-lock.json`

---

## Branch Review Completed

I also checked the other active remote branches against `origin/Dashboard` to determine what should happen next.

### Result: do not merge those branches directly

Reason:
- they are based on an older project state
- a direct merge would try to delete newer dashboard files and documentation
- they should be treated as feature sources to port selectively, not as branches to merge wholesale

### What each branch still contains that may matter

#### `session-state-manager`
Useful item:
- pause/resume logic in `app/hooks/useHeartRateSensor.ts`

Recommendation:
- port only the pause/resume logic into current `Dashboard`

#### `ui-visualization-engine`
Useful items:
- `app/utils/ecgFilters.ts`
- `app/utils/signalQuality.ts`
- `app/utils/exportData.ts`
- some ECG chart/live processing changes

Recommendation:
- selectively port the signal-processing utilities into current `Dashboard`

#### `ending-session`
Useful items:
- session summary components
- stress/session recap UI

Recommendation:
- port only if the team wants post-session review in the final demo

#### `feedback-control`
Useful items:
- high-stress notifications
- feedback UI around session guidance

Recommendation:
- lower priority than sensor state and ECG filtering

#### `chatbot`
Useful item:
- `backend/main.py` FastAPI chatbot service exists

Problem:
- frontend integration in that branch still depends on older assumptions and hardcoded context
- it is not ready for direct merge into current `Dashboard`

Recommendation:
- integrate later after app-side data model is stabilized

---

## What Has Not Been Done Yet

The following items are still incomplete:

### 1. Real Database
Not done:
- PostgreSQL setup
- Prisma schema
- migrations
- `DATABASE_URL` integration

Impact:
- current backend behavior is temporary and local to the machine running the app

### 2. Real Persistent Production Storage
Not done:
- deployment-safe storage
- shared team-accessible database
- production persistence model

### 3. Full Sensor/Signal Feature Porting
Not done:
- pause/resume from `session-state-manager`
- ECG filtering integration from `ui-visualization-engine`
- signal quality detection integration
- export flow integration

### 4. Chatbot Integration
Not done:
- connecting the dashboard API to Antonia's FastAPI chatbot service
- sending authenticated profile/session/stats context from current branch state

### 5. End Session and Feedback Features
Not done:
- selective port of `SessionSummary`
- selective port of feedback and high-stress notifications

---

## Current Technical Status

### Completed
- Dashboard branch is active and verified
- API route structure exists
- auth flow exists
- profile/session/stats endpoints exist
- login/register pages exist
- dashboard can use API-backed storage
- build and lint both pass

### Temporary
- backend data is stored in a runtime JSON file
- auth is custom lightweight app auth
- no Prisma
- no PostgreSQL

### Missing
- real database layer
- selective feature ports from other branches
- chatbot integration using real dashboard data

---

## Recommended Next Steps

### Recommended order

1. Port `session-state-manager` pause/resume logic into `app/hooks/useHeartRateSensor.ts`
2. Port `ui-visualization-engine` ECG filtering and signal-quality utilities
3. Decide whether `ending-session` is needed for the demo, then port selectively
4. Replace temporary JSON store with PostgreSQL + Prisma when database access is available
5. Integrate Antonia's chatbot backend using real API data

### Why this order

- pause/resume and ECG filtering improve the live monitoring experience immediately
- these are more useful for the demo than database work that cannot be fully finished without infrastructure
- real database migration should happen after the schema and connection details are available
- chatbot should come after the app-side session/profile/stat data model is stable

---

## Final Summary

In this session, the `Dashboard` branch was moved from:
- frontend dashboard with `localStorage` only

to:
- frontend dashboard
- backend API routes inside Next.js
- auth flow
- profile/session/stats endpoints
- login/register pages
- dashboard API integration with local fallback
- verified lint/build status

This is meaningful backend progress, but it is still an intermediate state.

The most important unfinished item is still:
- **Real Database (PostgreSQL + Prisma)**

The most important code-porting work still pending from other branches is:
- **pause/resume logic**
- **ECG filtering and signal-quality utilities**

