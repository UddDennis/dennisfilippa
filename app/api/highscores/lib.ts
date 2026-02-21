import { createHash } from "node:crypto";
import { neon } from "@neondatabase/serverless";

export type LeaderboardEntry = {
  name: string;
  score: number;
  createdAt: string;
};

export type GameSession = {
  id: string;
  startedAt: number;
  lastTapAt: number;
  taps: number;
  nonce: string;
  completed: boolean;
  ipHash: string;
  expiresAt: number;
};

const DATABASE_URL = process.env.DATABASE_URL;

export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;
export const GAME_DURATION_MS = 15_000;
export const GAME_GRACE_MS = 2_000;
export const MIN_TAP_INTERVAL_MS = 70;
export const MAX_TAPS = 200;

const sql = DATABASE_URL ? neon(DATABASE_URL) : null;
let schemaReadyPromise: Promise<void> | null = null;

type DbSessionRow = {
  id: string;
  started_at: Date | string;
  last_tap_at: Date | string | null;
  tap_count: number;
  nonce: string;
  completed: boolean;
  ip_hash: string;
  expires_at: Date | string;
};

function toDate(value: Date | string) {
  return value instanceof Date ? value : new Date(value);
}

function toMs(value: Date | string) {
  return toDate(value).getTime();
}

function mapSession(row: DbSessionRow): GameSession {
  return {
    id: row.id,
    startedAt: toMs(row.started_at),
    lastTapAt: row.last_tap_at ? toMs(row.last_tap_at) : 0,
    taps: Number(row.tap_count),
    nonce: row.nonce,
    completed: row.completed,
    ipHash: row.ip_hash,
    expiresAt: toMs(row.expires_at),
  };
}

async function ensureSchema() {
  if (!sql) {
    throw new Error("Missing database configuration.");
  }

  if (!schemaReadyPromise) {
    schemaReadyPromise = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS game_sessions (
          id UUID PRIMARY KEY,
          started_at TIMESTAMPTZ NOT NULL,
          last_tap_at TIMESTAMPTZ,
          tap_count INT NOT NULL DEFAULT 0,
          nonce TEXT NOT NULL,
          completed BOOLEAN NOT NULL DEFAULT FALSE,
          ip_hash TEXT NOT NULL,
          expires_at TIMESTAMPTZ NOT NULL
        );
      `;

      await sql`
        CREATE TABLE IF NOT EXISTS highscores (
          id BIGSERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          score INT NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          session_id UUID NOT NULL REFERENCES game_sessions(id)
        );
      `;

      await sql`
        CREATE INDEX IF NOT EXISTS idx_highscores_score_created
        ON highscores (score DESC, created_at DESC);
      `;

      await sql`
        CREATE INDEX IF NOT EXISTS idx_sessions_expires
        ON game_sessions (expires_at);
      `;
    })();
  }

  await schemaReadyPromise;
}

export function isDbConfigured() {
  return Boolean(DATABASE_URL);
}

export function hashIp(ip: string) {
  return createHash("sha256").update(ip).digest("hex").slice(0, 24);
}

export function randomNonce() {
  return crypto.randomUUID().replace(/-/g, "");
}

export async function createSession(input: { ipHash: string }) {
  if (!sql) {
    throw new Error("Missing database configuration.");
  }

  await ensureSchema();

  const id = crypto.randomUUID();
  const startedAt = new Date();
  const nonce = randomNonce();
  const expiresAt = new Date(startedAt.getTime() + SESSION_TTL_SECONDS * 1000);

  const rows = (await sql`
    INSERT INTO game_sessions (id, started_at, last_tap_at, tap_count, nonce, completed, ip_hash, expires_at)
    VALUES (${id}, ${startedAt.toISOString()}, NULL, 0, ${nonce}, FALSE, ${input.ipHash}, ${expiresAt.toISOString()})
    RETURNING id, started_at, last_tap_at, tap_count, nonce, completed, ip_hash, expires_at;
  `) as DbSessionRow[];

  return mapSession(rows[0]);
}

export async function getSession(sessionId: string) {
  if (!sql) {
    throw new Error("Missing database configuration.");
  }

  await ensureSchema();

  const rows = (await sql`
    SELECT id, started_at, last_tap_at, tap_count, nonce, completed, ip_hash, expires_at
    FROM game_sessions
    WHERE id = ${sessionId}
    LIMIT 1;
  `) as DbSessionRow[];

  if (rows.length === 0) {
    return null;
  }

  return mapSession(rows[0]);
}

export async function recordTap(input: {
  sessionId: string;
  expectedNonce: string;
  nextNonce: string;
  nowIso: string;
}) {
  if (!sql) {
    throw new Error("Missing database configuration.");
  }

  await ensureSchema();

  const rows = (await sql`
    UPDATE game_sessions
    SET tap_count = tap_count + 1,
        last_tap_at = ${input.nowIso},
        nonce = ${input.nextNonce}
    WHERE id = ${input.sessionId}
      AND nonce = ${input.expectedNonce}
      AND completed = FALSE
    RETURNING id, started_at, last_tap_at, tap_count, nonce, completed, ip_hash, expires_at;
  `) as DbSessionRow[];

  if (rows.length === 0) {
    return null;
  }

  return mapSession(rows[0]);
}

export async function markSessionCompleted(sessionId: string) {
  if (!sql) {
    throw new Error("Missing database configuration.");
  }

  await ensureSchema();

  const rows = (await sql`
    UPDATE game_sessions
    SET completed = TRUE
    WHERE id = ${sessionId}
      AND completed = FALSE
    RETURNING id, started_at, last_tap_at, tap_count, nonce, completed, ip_hash, expires_at;
  `) as DbSessionRow[];

  if (rows.length === 0) {
    return null;
  }

  return mapSession(rows[0]);
}

export async function addLeaderboardScore(entry: { name: string; score: number; sessionId: string }) {
  if (!sql) {
    throw new Error("Missing database configuration.");
  }

  await ensureSchema();

  await sql`
    INSERT INTO highscores (name, score, created_at, session_id)
    VALUES (${entry.name}, ${entry.score}, NOW(), ${entry.sessionId});
  `;
}

export async function getLeaderboard(limit: number) {
  if (!sql) {
    throw new Error("Missing database configuration.");
  }

  await ensureSchema();

  const rows = (await sql`
    SELECT name, score, created_at
    FROM highscores
    ORDER BY score DESC, created_at DESC
    LIMIT ${Math.max(1, Math.min(100, limit))};
  `) as Array<{ name: string; score: number; created_at: Date | string }>;

  return rows.map((row) => ({
    name: row.name,
    score: Number(row.score),
    createdAt: toDate(row.created_at).toISOString(),
  }));
}

export async function cleanupExpiredSessions() {
  if (!sql) {
    throw new Error("Missing database configuration.");
  }

  await ensureSchema();

  await sql`
    DELETE FROM game_sessions
    WHERE expires_at < NOW() - INTERVAL '1 hour';
  `;
}
