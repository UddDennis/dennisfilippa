import { NextResponse } from "next/server";
import { addScore, cleanName, cleanScore, getLeaderboard, isDbConfigured } from "./lib";

export async function GET() {
  if (!isDbConfigured()) {
    return NextResponse.json(
      { message: "Missing DATABASE_URL env var.", scores: [] },
      { status: 503 },
    );
  }

  try {
    const scores = await getLeaderboard(10);
    return NextResponse.json({ scores });
  } catch (error) {
    console.error("brollopsjakten GET failed", error);
    return NextResponse.json({ message: "Could not load leaderboard.", scores: [] }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!isDbConfigured()) {
    return NextResponse.json(
      { message: "Missing DATABASE_URL env var." },
      { status: 503 },
    );
  }

  const body = (await request.json()) as {
    name?: unknown;
    score?: unknown;
  };

  const name = cleanName(body.name);
  const score = cleanScore(body.score);

  if (!name || score === null) {
    return NextResponse.json({ message: "Invalid payload." }, { status: 400 });
  }

  try {
    await addScore({ name, score });
    const scores = await getLeaderboard(10);
    return NextResponse.json({ message: "Score saved.", scores });
  } catch (error) {
    console.error("brollopsjakten POST failed", error);
    return NextResponse.json({ message: "Could not save score." }, { status: 500 });
  }
}
