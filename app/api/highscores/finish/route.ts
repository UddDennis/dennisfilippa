import { NextResponse } from "next/server";
import {
  MAX_TAPS,
  addLeaderboardScore,
  cleanupExpiredSessions,
  getLeaderboard,
  getSession,
  hashIp,
  isDbConfigured,
  markSessionCompleted,
} from "../lib";

const MAX_NAME_LENGTH = 40;

function cleanName(input: unknown) {
  if (typeof input !== "string") {
    return null;
  }

  const trimmed = input.trim();
  if (!trimmed) {
    return null;
  }

  return trimmed.slice(0, MAX_NAME_LENGTH);
}

export async function POST(request: Request) {
  if (!isDbConfigured()) {
    return NextResponse.json(
      { message: "Missing DATABASE_URL env var." },
      { status: 503 },
    );
  }

  const body = (await request.json()) as {
    sessionId?: unknown;
    name?: unknown;
  };

  const sessionId = typeof body.sessionId === "string" ? body.sessionId : "";
  const name = cleanName(body.name);

  if (!sessionId || !name) {
    return NextResponse.json({ message: "Invalid submit payload." }, { status: 400 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const requesterIpHash = hashIp(ip);

  try {
    const session = await getSession(sessionId);

    if (!session || session.completed) {
      return NextResponse.json({ message: "Session expired." }, { status: 410 });
    }

    if (session.ipHash !== requesterIpHash) {
      return NextResponse.json({ message: "Session/IP mismatch." }, { status: 403 });
    }

    const finalized = await markSessionCompleted(sessionId);
    if (!finalized) {
      return NextResponse.json({ message: "Session already finalized." }, { status: 409 });
    }

    const rawScore = Math.min(MAX_TAPS, Math.max(0, Math.floor(finalized.taps)));

    await addLeaderboardScore({
      name,
      score: rawScore,
      sessionId,
    });

    await cleanupExpiredSessions();

    const scores = await getLeaderboard(10);

    return NextResponse.json({
      message: "Score saved.",
      score: rawScore,
      scores,
    });
  } catch {
    return NextResponse.json({ message: "Could not save score." }, { status: 500 });
  }
}
