import { NextRequest, NextResponse } from "next/server";

import { getAuthPayloadFromRequest } from "../../../lib/server/auth";
import { readDatabase } from "../../../lib/server/store";
import { computePeriodStats, filterSessionsByRange, startOfWeekMonday } from "../../../lib/server/stats";

export async function GET(request: NextRequest) {
  const payload = getAuthPayloadFromRequest(request);
  if (!payload) {
    return NextResponse.json(
      { success: false, error: "Unauthorized." },
      { status: 401 }
    );
  }

  const now = new Date();
  const start = startOfWeekMonday(now);
  const end = new Date(start);
  end.setDate(end.getDate() + 7);

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
