import { NextResponse } from "next/server";
import {
  GAME_DURATION_MS,
  GAME_GRACE_MS,
  MAX_TAPS,
  MIN_TAP_INTERVAL_MS,
  getSession,
  isDbConfigured,
  randomNonce,
  recordTap,
} from "../lib";

export async function POST(request: Request) {
  if (!isDbConfigured()) {
    return NextResponse.json(
      { message: "Missing DATABASE_URL env var." },
      { status: 503 },
    );
  }

  const body = (await request.json()) as {
    sessionId?: unknown;
    nonce?: unknown;
  };

  const sessionId = typeof body.sessionId === "string" ? body.sessionId : "";
  const nonce = typeof body.nonce === "string" ? body.nonce : "";

  if (!sessionId || !nonce) {
    return NextResponse.json({ message: "Invalid tap payload." }, { status: 400 });
  }

  const now = Date.now();

  try {
    const session = await getSession(sessionId);

    if (!session || session.completed || session.expiresAt < now) {
      return NextResponse.json({ message: "Session expired." }, { status: 410 });
    }

    if (session.nonce !== nonce) {
      return NextResponse.json({ message: "Invalid tap token." }, { status: 403 });
    }

    if (now - session.startedAt > GAME_DURATION_MS + GAME_GRACE_MS) {
      return NextResponse.json({ message: "Game window ended." }, { status: 410 });
    }

    if (session.lastTapAt && now - session.lastTapAt < MIN_TAP_INTERVAL_MS) {
      return NextResponse.json({ message: "Taps are too fast." }, { status: 429 });
    }

    if (session.taps >= MAX_TAPS) {
      return NextResponse.json({ message: "Tap limit reached." }, { status: 429 });
    }

    const nextNonce = randomNonce();
    const updated = await recordTap({
      sessionId,
      expectedNonce: nonce,
      nextNonce,
      nowIso: new Date(now).toISOString(),
    });

    if (!updated) {
      return NextResponse.json({ message: "Tap could not be applied." }, { status: 409 });
    }

    return NextResponse.json({
      taps: updated.taps,
      nonce: updated.nonce,
      timeLeftMs: Math.max(0, GAME_DURATION_MS - (now - updated.startedAt)),
    });
  } catch {
    return NextResponse.json({ message: "Could not record tap." }, { status: 500 });
  }
}
