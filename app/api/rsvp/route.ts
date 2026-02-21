import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const DATABASE_URL = process.env.DATABASE_URL;

const MAX_NAME_LENGTH = 80;
const MAX_ALLERGIES_LENGTH = 400;

let schemaReadyPromise: Promise<void> | null = null;

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

function cleanAllergies(input: unknown) {
  if (typeof input !== "string") {
    return "";
  }

  return input.trim().slice(0, MAX_ALLERGIES_LENGTH);
}

function cleanCanAttend(input: unknown) {
  if (typeof input !== "boolean") {
    return null;
  }

  return input;
}

async function ensureSchema(sql: ReturnType<typeof neon>) {
  if (!schemaReadyPromise) {
    schemaReadyPromise = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS rsvp_responses (
          id BIGSERIAL PRIMARY KEY,
          full_name TEXT NOT NULL,
          can_attend BOOLEAN NOT NULL,
          food_allergies TEXT NOT NULL DEFAULT '',
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `;

      await sql`
        CREATE INDEX IF NOT EXISTS idx_rsvp_created_at
        ON rsvp_responses (created_at DESC);
      `;
    })();
  }

  await schemaReadyPromise;
}

export async function POST(request: Request) {
  if (!DATABASE_URL) {
    return NextResponse.json({ message: "Missing DATABASE_URL env var." }, { status: 503 });
  }

  const body = (await request.json()) as {
    fullName?: unknown;
    canAttend?: unknown;
    foodAllergies?: unknown;
  };

  const fullName = cleanName(body.fullName);
  const canAttend = cleanCanAttend(body.canAttend);
  const foodAllergies = cleanAllergies(body.foodAllergies);

  if (!fullName || canAttend === null) {
    return NextResponse.json(
      { message: "Invalid form input." },
      { status: 400 },
    );
  }

  try {
    const sql = neon(DATABASE_URL);
    await ensureSchema(sql);

    await sql`
      INSERT INTO rsvp_responses (full_name, can_attend, food_allergies)
      VALUES (${fullName}, ${canAttend}, ${foodAllergies});
    `;

    return NextResponse.json({ message: "RSVP saved." });
  } catch (error) {
    console.error("rsvp save error", error);
    return NextResponse.json(
      { message: "Could not save RSVP." },
      { status: 500 },
    );
  }
}
