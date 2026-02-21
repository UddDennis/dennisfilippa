import { NextResponse } from "next/server";
import { getLeaderboard, isDbConfigured } from "./lib";

export async function GET() {
  if (!isDbConfigured()) {
    return NextResponse.json(
      {
        message: "Missing DATABASE_URL env var.",
        scores: [],
      },
      { status: 503 },
    );
  }

  try {
    const scores = await getLeaderboard(10);
    return NextResponse.json({ scores });
  } catch {
    return NextResponse.json({ message: "Could not load leaderboard.", scores: [] }, { status: 500 });
  }
}
