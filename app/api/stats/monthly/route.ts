import { NextRequest, NextResponse } from "next/server";

import { getAuthPayloadFromRequest } from "../../../lib/server/auth";
import { readDatabase } from "../../../lib/server/store";
import { computePeriodStats, filterSessionsByRange } from "../../../lib/server/stats";

export async function GET(request: NextRequest) {
  const payload = getAuthPayloadFromRequest(request);
  if (!payload) {
    return NextResponse.json(
      { success: false, error: "Unauthorized." },
      { status: 401 }
    );
  }

  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const db = await readDatabase();
  const sessions = filterSessionsByRange(
    db.sessions.filter((session) => session.userId === payload.sub),
    start,
    end
  );

  return NextResponse.json({
    success: true,
    stats: computePeriodStats(sessions, start, end),
  });
}
