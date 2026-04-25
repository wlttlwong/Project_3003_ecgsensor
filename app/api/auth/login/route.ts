import { NextRequest, NextResponse } from "next/server";

import { createToken, verifyPassword } from "../../../lib/server/auth";
import { readDatabase } from "../../../lib/server/store";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      email?: unknown;
      password?: unknown;
    };

    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required." },
        { status: 400 }
      );
    }

    const db = await readDatabase();
    const user = db.users.find((entry) => entry.email === email);

    if (!user || !verifyPassword(password, user.passwordHash)) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password." },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      token: createToken(user.id, user.email),
      user: {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Unable to sign in right now." },
      { status: 500 }
    );
  }
}
