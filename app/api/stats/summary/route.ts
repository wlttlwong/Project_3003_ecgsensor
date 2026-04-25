import { NextRequest, NextResponse } from "next/server";

import { getAuthPayloadFromRequest } from "../../../lib/server/auth";
import { readDatabase } from "../../../lib/server/store";
import { computePeriodStats } from "../../../lib/server/stats";

export async function GET(request: NextRequest) {
  const payload = getAuthPayloadFromRequest(request);
  if (!payload) {
    return NextResponse.json(
      { success: false, error: "Unauthorized." },
      { status: 401 }
    );
  }

  const db = await readDatabase();
  const sessions = db.sessions.filter((session) => session.userId === payload.sub);
  const start =
    sessions.length > 0
      ? new Date(
          Math.min(...sessions.map((session) => new Date(session.startedAt).getTime()))
        )
      : new Date();
  const end =
    sessions.length > 0
      ? new Date(
          Math.max(...sessions.map((session) => new Date(session.endedAt).getTime()))
        )
      : new Date();

  return NextResponse.json({
    success: true,
    stats: computePeriodStats(sessions, start, end),
  });
}
