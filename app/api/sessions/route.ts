import { randomUUID } from "crypto";

import { NextRequest, NextResponse } from "next/server";

import { getAuthPayloadFromRequest } from "../../lib/server/auth";
import { mutateDatabase, readDatabase, type StoredSession } from "../../lib/server/store";
import type { SessionType } from "../../types/session";

function toPublicSession(session: StoredSession) {
  return {
    id: session.id,
    startedAt: session.startedAt,
    endedAt: session.endedAt,
    sessionType: session.sessionType,
    durationSec: session.durationSec,
    avgHr: session.avgHr,
    maxHr: session.maxHr,
    avgHrvMs: session.avgHrvMs,
    stressScore: session.stressScore,
    stressLevel: session.stressLevel,
    stressSummary: session.stressSummary,
  };
}

function parseOptionalNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function isSessionType(value: unknown): value is SessionType {
  return typeof value === "string" && value.trim().length > 0;
}

export async function GET(request: NextRequest) {
  const payload = getAuthPayloadFromRequest(request);
  if (!payload) {
    return NextResponse.json(
      { success: false, error: "Unauthorized." },
      { status: 401 }
    );
  }

  const searchParams = request.nextUrl.searchParams;
  const limit = Math.min(
    Math.max(Number(searchParams.get("limit") ?? "50"), 1),
    100
  );
  const offset = Math.max(Number(searchParams.get("offset") ?? "0"), 0);
  const type = searchParams.get("type");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  const db = await readDatabase();
  let sessions = db.sessions
    .filter((session) => session.userId === payload.sub)
    .sort(
      (left, right) =>
        new Date(right.startedAt).getTime() - new Date(left.startedAt).getTime()
    );

  if (type && isSessionType(type)) {
    sessions = sessions.filter((session) => session.sessionType === type);
  }

  if (startDate) {
    const startTime = new Date(startDate).getTime();
    sessions = sessions.filter(
      (session) => new Date(session.startedAt).getTime() >= startTime
    );
  }

  if (endDate) {
    const endTime = new Date(endDate).getTime();
    sessions = sessions.filter(
      (session) => new Date(session.startedAt).getTime() <= endTime
    );
  }

  const total = sessions.length;
  const pagedSessions = sessions.slice(offset, offset + limit).map(toPublicSession);

  return NextResponse.json({
    success: true,
    sessions: pagedSessions,
    total,
    page: Math.floor(offset / limit),
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
      startedAt?: unknown;
      endedAt?: unknown;
      sessionType?: unknown;
      durationSec?: unknown;
      avgHr?: unknown;
      maxHr?: unknown;
      avgHrvMs?: unknown;
      stressScore?: unknown;
      stressLevel?: unknown;
      stressSummary?: unknown;
    };

    if (
      typeof body.startedAt !== "string" ||
      Number.isNaN(new Date(body.startedAt).getTime()) ||
      typeof body.endedAt !== "string" ||
      Number.isNaN(new Date(body.endedAt).getTime()) ||
      !isSessionType(body.sessionType) ||
      typeof body.durationSec !== "number" ||
      !Number.isFinite(body.durationSec) ||
      body.durationSec <= 0 ||
      typeof body.stressSummary !== "string" ||
      !body.stressSummary.trim()
    ) {
      return NextResponse.json(
        { success: false, error: "Invalid session payload." },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const storedSession: StoredSession = {
      id: randomUUID(),
      userId: payload.sub,
      startedAt: body.startedAt,
      endedAt: body.endedAt,
      sessionType: body.sessionType,
      durationSec: Math.round(body.durationSec),
      avgHr: parseOptionalNumber(body.avgHr),
      maxHr: parseOptionalNumber(body.maxHr),
      avgHrvMs: parseOptionalNumber(body.avgHrvMs),
      stressScore: parseOptionalNumber(body.stressScore) || 0,
      stressLevel: (body.stressLevel as any) || "Low",
      stressSummary: body.stressSummary.trim(),
      createdAt: now,
      updatedAt: now,
    };

    await mutateDatabase((db) => {
      db.sessions.push(storedSession);
    });

    return NextResponse.json({
      success: true,
      session: toPublicSession(storedSession),
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Unable to create session right now." },
      { status: 500 }
    );
  }
}
