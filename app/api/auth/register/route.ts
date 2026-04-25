import { randomUUID } from "crypto";

import { NextRequest, NextResponse } from "next/server";

import { createToken, hashPassword } from "../../../lib/server/auth";
import { mutateDatabase } from "../../../lib/server/store";

function isValidEmail(email: string): boolean {
  return /\S+@\S+\.\S+/.test(email);
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      email?: unknown;
      password?: unknown;
      age?: unknown;
    };

    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const age =
      typeof body.age === "number" && Number.isFinite(body.age) ? body.age : null;

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }

    const result = await mutateDatabase((db) => {
      const existingUser = db.users.find((user) => user.email === email);
      if (existingUser) {
        return { error: "An account with this email already exists." } as const;
      }

      const now = new Date().toISOString();
      const userId = randomUUID();
      const user = {
        id: userId,
        email,
        passwordHash: hashPassword(password),
        createdAt: now,
        updatedAt: now,
      };

      db.users.push(user);
      db.profiles.push({
        userId,
        age,
        goals: [],
        stressTriggers: [],
        maxHeartRate: null,
        createdAt: now,
        updatedAt: now,
      });

      return {
        token: createToken(user.id, user.email),
        user: {
          id: user.id,
          email: user.email,
          createdAt: user.createdAt,
        },
      } as const;
    });

    if ("error" in result) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 409 }
      );
    }

    return NextResponse.json({
      success: true,
      token: result.token,
      user: result.user,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Unable to register right now." },
      { status: 500 }
    );
  }
}
