import { NextRequest, NextResponse } from "next/server";

import { getAuthPayloadFromRequest } from "../../../lib/server/auth";
import { mutateDatabase, readDatabase } from "../../../lib/server/store";

function ensureStringArray(value: unknown): string[] {
  if (typeof value === "string") return [value.trim()].filter(Boolean);
  if (Array.isArray(value)) {
    return value
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
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
      height?: unknown;
      goals?: unknown;
      stressTriggers?: unknown;
      maxHeartRate?: unknown;
    };

    const result = await mutateDatabase((db) => {
      const profile = db.profiles.find((entry) => entry.userId === payload.sub);
      if (!profile) {
        return { error: "Profile not found." } as const;
      }

      // 1. Merge Age (Convert string to number)
      if (body.age !== undefined) {
        profile.age = Number(body.age) || null;
      }

      // 2. Merge Height (Convert string to number)
      if (body.height !== undefined) {
        profile.height = Number(body.height) || null;
      }

      // 3. Merge Goals (Convert your single string to their array)
      if (body.goals !== undefined) {
        profile.goals = ensureStringArray(body.goals);
      }

      // 4. Merge Stress Triggers (Map your 'stressTrigger' to their 'stressTriggers')
      const triggerInput = body.stressTriggers || body.stressTriggers;
      if (triggerInput !== undefined) {
        profile.stressTriggers = ensureStringArray(triggerInput);
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
