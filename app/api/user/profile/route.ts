import { NextRequest, NextResponse } from "next/server";

import { getAuthPayloadFromRequest } from "../../../lib/server/auth";
import { mutateDatabase, readDatabase } from "../../../lib/server/store";

function sanitizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}

export async function GET(request: NextRequest) {
  const payload = getAuthPayloadFromRequest(request);
  if (!payload) {
    return NextResponse.json(
      { success: false, error: "Unauthorized." },
      { status: 401 }
    );
  }

  const db = await readDatabase();
  const profile = db.profiles.find((entry) => entry.userId === payload.sub);
  if (!profile) {
    return NextResponse.json(
      { success: false, error: "Profile not found." },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    profile,
  });
}

export async function POST(request: NextRequest) {
  const payload = getAuthPayloadFromRequest(request);
  if (!payload) {
    return NextResponse.json(
      { success: false, error: "Unauthorized." },
      { status: 401 }
    );
  }

  try {
    const body = (await request.json()) as {
      age?: unknown;
      goals?: unknown;
      stressTriggers?: unknown;
      maxHeartRate?: unknown;
    };

    const result = await mutateDatabase((db) => {
      const profile = db.profiles.find((entry) => entry.userId === payload.sub);
      if (!profile) {
        return { error: "Profile not found." } as const;
      }

      if (body.age !== undefined) {
        profile.age =
          typeof body.age === "number" && Number.isFinite(body.age) ? body.age : null;
      }

      if (body.goals !== undefined) {
        profile.goals = sanitizeStringArray(body.goals);
      }

      if (body.stressTriggers !== undefined) {
        profile.stressTriggers = sanitizeStringArray(body.stressTriggers);
      }

      if (body.maxHeartRate !== undefined) {
        profile.maxHeartRate =
          typeof body.maxHeartRate === "number" &&
          Number.isFinite(body.maxHeartRate)
            ? body.maxHeartRate
            : null;
      }

      profile.updatedAt = new Date().toISOString();
      return { profile } as const;
    });

    if ("error" in result) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      profile: result.profile,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Unable to update profile right now." },
      { status: 500 }
    );
  }
}
