import { neon } from "@neondatabase/serverless";

export type LeaderboardEntry = {
  name: string;
  score: number;
  createdAt: string;
};

const DATABASE_URL = process.env.DATABASE_URL;

const sql = DATABASE_URL ? neon(DATABASE_URL) : null;
let schemaReadyPromise: Promise<void> | null = null;

async function ensureSchema() {
  if (!sql) {
    throw new Error("Missing database configuration.");
  }

  if (!schemaReadyPromise) {
    schemaReadyPromise = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS brollopsjakten_scores (
          id BIGSERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          score INT NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `;

      await sql`
        CREATE INDEX IF NOT EXISTS idx_brollopsjakten_scores_score_created
        ON brollopsjakten_scores (score DESC, created_at DESC);
      `;
    })();
  }

  await schemaReadyPromise;
}

export function isDbConfigured() {
  return Boolean(DATABASE_URL);
}

export function cleanName(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  return trimmed.slice(0, 80);
}

export function cleanScore(value: unknown) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }

  return Math.max(0, Math.floor(value));
}

export async function getLeaderboard(limit: number) {
  if (!sql) {
    throw new Error("Missing database configuration.");
  }

  await ensureSchema();

  const rows = (await sql`
    SELECT name, score, created_at
    FROM brollopsjakten_scores
    ORDER BY score DESC, created_at DESC
    LIMIT ${Math.max(1, Math.min(100, limit))};
  `) as Array<{ name: string; score: number; created_at: Date | string }>;

  return rows.map((row) => ({
    name: row.name,
    score: Number(row.score),
    createdAt: new Date(row.created_at).toISOString(),
  }));
}

export async function addScore(input: { name: string; score: number }) {
  if (!sql) {
    throw new Error("Missing database configuration.");
  }

  await ensureSchema();

  await sql`
    INSERT INTO brollopsjakten_scores (name, score)
    VALUES (${input.name}, ${input.score});
  `;
}
