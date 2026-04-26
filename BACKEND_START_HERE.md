# 🚀 START HERE: Backend Setup Guide
## Complete Step-by-Step Instructions to Begin

**Start Time:** April 25, 2026, Evening  
**Goal:** Get database + auth working by end of tomorrow (Apr 26)  
**Effort:** ~4-5 hours

---

## 🎯 What You'll Build (High Level)

```
TODAY/TONIGHT:
1. Install backend dependencies ← START HERE (15 min)
2. Set up database connection ← THEN THIS (30 min)
3. Create database schema ← THEN THIS (30 min)

TOMORROW:
1. Create auth API endpoints (2-3 hours)
   ├─ Register endpoint
   ├─ Login endpoint
   └─ Token verification

2. Create sessions API (1-2 hours)
   ├─ Get sessions
   ├─ Create session
   └─ Delete session

3. Create user profile API (30 min)
   ├─ Get profile
   └─ Update profile

4. Merge team features (1 hour)
   ├─ Pause/resume
   ├─ Signal filters
   └─ Session summary

5. Test everything (1 hour)
```

---

## 📋 STEP 1: Install Dependencies (15 minutes)

### Run this command NOW:
```bash
cd /Users/tifflok/Desktop/BIOF3003/Project_3003_ecgsensor

npm install bcryptjs jsonwebtoken
npm install -D prisma @prisma/client
```

**What these do:**
- `bcryptjs` - Password hashing (security)
- `jsonwebtoken` - JWT token creation/verification
- `prisma` - Database ORM (easier than raw SQL)
- `@prisma/client` - Prisma client for queries

### Verify installation:
```bash
npm list bcryptjs jsonwebtoken prisma
```

✅ Should show versions for all three

---

## 📋 STEP 2: Initialize Prisma (10 minutes)

### Run this command:
```bash
npx prisma init
```

**What it creates:**
- `prisma/schema.prisma` - Database schema file (you'll edit this)
- `.env` - Environment variables file (database connection)

---

## 📋 STEP 3: Configure Environment Variables (15 minutes)

### Edit `.env` file:

```bash
# Open the .env file
nano .env
```

### Add these variables:

```env
# Database Connection
DATABASE_URL="postgresql://postgres:password@localhost:5432/ecgsensor"

# JWT Secret (for signing tokens)
JWT_SECRET="your-super-secret-key-minimum-32-characters-long-for-security"

# Optional: Node environment
NODE_ENV="development"
```

**Important:** 
- Replace `password` with your actual PostgreSQL password
- Replace `localhost` with your database host
- Replace `ecgsensor` with your database name
- `JWT_SECRET` should be random and at least 32 characters (can use any string)

### Example with real values:
```env
DATABASE_URL="postgresql://postgres:mySecurePassword123@localhost:5432/ecgsensor_dev"
JWT_SECRET="aJ9kL2mN5pQ8rS1tU4vW7xY0zAbCdEfGhIjKlMnOpQrStUvWxYz"
NODE_ENV="development"
```

---

## 📋 STEP 4: Create Database Schema (30 minutes)

### Edit `prisma/schema.prisma`

Replace the entire content with this:

```prisma
// This is your database schema definition
// Prisma will auto-generate SQL from this

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// User account
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  passwordHash String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Relations
  profile   UserProfile?
  sessions  Session[]
}

// User profile information
model UserProfile {
  id            String   @id @default(cuid())
  userId        String   @unique
  age           Int?
  goals         String[] @default([])  // ["weight loss", "endurance"]
  stressTriggers String[] @default([]) // ["work", "sleep"]
  maxHeartRate  Int?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

// ECG session records
model Session {
  id            String   @id @default(cuid())
  userId        String
  startedAt     DateTime
  endedAt       DateTime
  sessionType   String   // "walking", "jogging", "cycling", "rest"
  durationSec   Int
  avgHr         Int?
  maxHr         Int?
  avgHrvMs      Int?     // Heart Rate Variability
  stressSummary String?  // "Low Stress 🌿"
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@index([startedAt])
}
```

**Save the file** (Ctrl+O, Enter, Ctrl+X in nano)

---

## 📋 STEP 5: Create Database & Run Migration (20 minutes)

### Create the database:

**For PostgreSQL locally (if you have it installed):**
```bash
createdb ecgsensor_dev
```

Or use a cloud database:
- **Option A:** Neon (https://neon.tech) - Free PostgreSQL in cloud
- **Option B:** Railway (https://railway.app) - Free PostgreSQL + deployment
- **Option C:** Render (https://render.com) - Free PostgreSQL

### Run Prisma migration:

```bash
npx prisma migrate dev --name init
```

**What it does:**
1. Creates the tables in your database
2. Generates Prisma Client code
3. Creates `prisma/migrations/` folder

**You should see:**
```
✓ Created database
✓ Generated Prisma Client
✓ Migrations applied
```

### Verify it worked:
```bash
npx prisma studio
```

This opens a web UI where you can see your database tables. Close it (Ctrl+C).

---

## 📋 STEP 6: Create Backend Utilities (30 minutes)

### Create `lib/db.ts`:

Create a new file: `app/lib/db.ts` (or `lib/db.ts` at root)

```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['error', 'warn']
        : ['error'],
  });

if (process.env.NODE_ENV !== 'production')
  globalForPrisma.prisma = prisma;
```

**This prevents:** Multiple database connections in development

### Create `lib/auth.ts`:

Create a new file: `lib/auth.ts`

```typescript
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRY = '7d'; // Token valid for 7 days

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

export function verifyToken(token: string): { userId: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    return decoded;
  } catch {
    return null;
  }
}

export function extractToken(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}
```

**This provides:**
- Password hashing with bcrypt
- JWT token generation and verification
- Token extraction from headers

### Create `lib/middleware.ts`:

Create a new file: `lib/middleware.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractToken } from './auth';

export async function withAuth(
  req: NextRequest,
  handler: (req: NextRequest, userId: string) => Promise<Response>
): Promise<Response> {
  try {
    const token = extractToken(req.headers.get('authorization'));
    
    if (!token) {
      return NextResponse.json(
        { error: 'Missing authorization token' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Call the actual handler with userId
    return await handler(req, decoded.userId);
  } catch (error) {
    console.error('Auth middleware error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 401 }
    );
  }
}
```

**This provides:**
- Authentication middleware for protected routes
- JWT token verification
- User ID extraction

---

## 🏗️ STEP 7: Create First API Endpoint (Register)

### Create folder structure:
```bash
mkdir -p app/api/auth/register
```

### Create `app/api/auth/register/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { hashPassword, generateToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, password, age } = await req.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        profile: {
          create: {
            age: age ? parseInt(age) : null,
          },
        },
      },
    });

    // Generate token
    const token = generateToken(user.id);

    return NextResponse.json(
      {
        token,
        user: {
          id: user.id,
          email: user.email,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    );
  }
}
```

---

## ✅ What You've Just Set Up

```
✅ Dependencies installed (bcryptjs, jsonwebtoken, prisma)
✅ Database connection configured
✅ Database schema created (users, profiles, sessions)
✅ Prisma migrations run
✅ Authentication utilities created
✅ Auth middleware created
✅ Register endpoint created
```

---

## 🧪 Quick Test (5 minutes)

### Test the register endpoint:

```bash
# Make sure dev server is running
npm run dev

# In another terminal, test registration:
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","age":25}'
```

**Expected response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "clfxxxx",
    "email": "test@example.com"
  }
}
```

✅ If you get this, **registration works!**

---

## 📋 Next Steps (Tomorrow)

Once this is done, you'll create:

1. **Login endpoint** - `app/api/auth/login/route.ts`
2. **Verify token endpoint** - `app/api/auth/me/route.ts`
3. **Session endpoints** - `app/api/sessions/route.ts`
4. **Profile endpoints** - `app/api/user/profile/route.ts`

But first, **get this foundation working**.

---

## ⏱️ Time Estimate

- Install dependencies: **15 min**
- Initialize Prisma: **10 min**
- Configure .env: **15 min**
- Create schema: **30 min**
- Run migration: **20 min**
- Create utilities: **30 min**
- Create register endpoint: **20 min**
- Test everything: **10 min**

**Total: ~2.5 hours**

---

## 🆘 Troubleshooting

### Issue: "DATABASE_URL not found"
**Solution:** Make sure `.env` file exists and has `DATABASE_URL` set

### Issue: "Cannot find module 'bcryptjs'"
**Solution:** Run `npm install bcryptjs jsonwebtoken`

### Issue: "Cannot connect to database"
**Solution:** 
- Check PostgreSQL is running
- Check DATABASE_URL is correct
- Try: `psql -U postgres -c "CREATE DATABASE ecgsensor_dev"`

### Issue: "npx prisma migrate" fails
**Solution:**
- Delete `prisma/migrations` folder
- Run `npx prisma migrate dev --name init` again
- Or: `npx prisma db push` (force sync)

---

## 🚀 Ready to Start?

**Recommended action:**
1. Read through this guide once (5 min)
2. Follow steps 1-6 now (take 2 hours)
3. Test registration endpoint (10 min)
4. Push to GitHub

Then tomorrow: Build remaining endpoints!

---

## 📌 Key Files to Create/Edit

```
NEW FILES:
├─ lib/db.ts ← Database connection
├─ lib/auth.ts ← Auth utilities
├─ lib/middleware.ts ← Auth middleware
└─ app/api/auth/register/route.ts ← Register endpoint

MODIFIED FILES:
├─ .env ← Database credentials
└─ prisma/schema.prisma ← Database schema

GENERATED FILES:
└─ prisma/migrations/ ← Database migrations
```

---

## 💡 Why Start with This?

Everything else depends on:
1. ✅ Database storing user data
2. ✅ Authentication creating accounts
3. ✅ JWT tokens securing endpoints
4. ✅ Sessions API saving data

Without this foundation, nothing works!

---

**Go build! Let me know if you get stuck.** 🚀
