import { NextResponse } from "next/server";
import { GAME_DURATION_MS, createSession, hashIp, isDbConfigured } from "../lib";

export async function POST(request: Request) {
  if (!isDbConfigured()) {
    return NextResponse.json(
      { message: "Missing DATABASE_URL env var." },
      { status: 503 },
    );
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  try {
    const session = await createSession({ ipHash: hashIp(ip) });
    return NextResponse.json({
      sessionId: session.id,
      nonce: session.nonce,
      endsAt: session.startedAt + GAME_DURATION_MS,
    });
  } catch {
    return NextResponse.json({ message: "Could not start game session." }, { status: 500 });
  }
}
