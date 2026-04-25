import { NextRequest, NextResponse } from "next/server";

import { getAuthPayloadFromRequest } from "../../../lib/server/auth";
import { mutateDatabase } from "../../../lib/server/store";

export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  const payload = getAuthPayloadFromRequest(request);
  if (!payload) {
    return NextResponse.json(
      { success: false, error: "Unauthorized." },
      { status: 401 }
    );
  }

  const sessionId = context.params.id;
  const result = await mutateDatabase((db) => {
    const index = db.sessions.findIndex(
      (session) => session.id === sessionId && session.userId === payload.sub
    );
    if (index === -1) {
      return { error: "Session not found." } as const;
    }
    db.sessions.splice(index, 1);
    return { success: true } as const;
  });

  if ("error" in result) {
    return NextResponse.json(
      { success: false, error: result.error },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    message: "Session deleted.",
  });
}
