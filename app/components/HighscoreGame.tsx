"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

type ScoreEntry = {
  name: string;
  score: number;
  createdAt: string;
};

type GamePhase = "idle" | "playing" | "finished";

const GAME_SECONDS = 15;

function formatDate(isoDate: string) {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  return date.toLocaleString("sv-SE", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function HighscoreGame() {
  const [phase, setPhase] = useState<GamePhase>("idle");
  const [score, setScore] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(GAME_SECONDS);
  const [name, setName] = useState("");
  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const [isLoadingScores, setIsLoadingScores] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [nonce, setNonce] = useState<string | null>(null);
  const [endsAtMs, setEndsAtMs] = useState<number | null>(null);
  const [tapQueue, setTapQueue] = useState(0);

  const hasSubmittedRef = useRef(false);
  const isProcessingTapRef = useRef(false);

  useEffect(() => {
    void fetchScores();
  }, []);

  useEffect(() => {
    if (phase !== "playing" || !endsAtMs) {
      return;
    }

    const timer = window.setInterval(() => {
      const diffMs = Math.max(0, endsAtMs - Date.now());
      const nextSeconds = Math.ceil(diffMs / 1000);
      setSecondsLeft(nextSeconds);

      if (diffMs <= 0) {
        setPhase("finished");
        window.clearInterval(timer);
      }
    }, 150);

    return () => window.clearInterval(timer);
  }, [phase, endsAtMs]);

  useEffect(() => {
    if (phase !== "playing" || tapQueue <= 0 || isProcessingTapRef.current) {
      return;
    }

    if (!sessionId || !nonce) {
      setSaveMessage("Spelsession saknas.");
      setTapQueue(0);
      setPhase("finished");
      return;
    }

    let isCancelled = false;

    const run = async () => {
      isProcessingTapRef.current = true;
      let processed = 0;
      let queue = tapQueue;
      let currentNonce = nonce;

      try {
        while (queue > 0 && !isCancelled) {
          const response = await fetch("/api/highscores/tap", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sessionId, nonce: currentNonce }),
          });

          const payload = (await response.json()) as {
            message?: string;
            taps?: number;
            nonce?: string;
            timeLeftMs?: number;
          };

          if (!response.ok) {
            if (response.status === 410) {
              setPhase("finished");
            }
            if (response.status !== 429) {
              setSaveMessage(payload.message ?? "Kunde inte registrera klick.");
            }
            break;
          }

          if (typeof payload.taps === "number") {
            setScore(payload.taps);
          }

          if (typeof payload.timeLeftMs === "number") {
            setSecondsLeft(Math.ceil(Math.max(0, payload.timeLeftMs) / 1000));
            if (payload.timeLeftMs <= 0) {
              setPhase("finished");
              break;
            }
          }

          if (!payload.nonce) {
            setSaveMessage("Tap-token saknas.");
            setPhase("finished");
            break;
          }

          currentNonce = payload.nonce;
          setNonce(payload.nonce);
          queue -= 1;
          processed += 1;
        }
      } catch {
        setSaveMessage("Nätverksfel vid klickregistrering.");
      } finally {
        if (processed > 0) {
          setTapQueue((current) => Math.max(0, current - processed));
        }
        isProcessingTapRef.current = false;
      }
    };

    void run();

    return () => {
      isCancelled = true;
    };
  }, [nonce, phase, sessionId, tapQueue]);

  const sortedScores = useMemo(
    () => [...scores].sort((a, b) => b.score - a.score).slice(0, 10),
    [scores],
  );

  const startGame = async () => {
    setSaveMessage(null);
    hasSubmittedRef.current = false;
    setScore(0);
    setSecondsLeft(GAME_SECONDS);
    setTapQueue(0);

    try {
      const response = await fetch("/api/highscores/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const payload = (await response.json()) as {
        message?: string;
        sessionId?: string;
        nonce?: string;
        endsAt?: number;
      };

      if (!response.ok || !payload.sessionId || !payload.nonce || !payload.endsAt) {
        throw new Error(payload.message ?? "Kunde inte starta spelet.");
      }

      setSessionId(payload.sessionId);
      setNonce(payload.nonce);
      setEndsAtMs(payload.endsAt);
      setPhase("playing");
    } catch (error) {
      setPhase("idle");
      setSaveMessage(error instanceof Error ? error.message : "Kunde inte starta spelet.");
    }
  };

  const registerTap = () => {
    if (phase !== "playing") {
      return;
    }
    setTapQueue((current) => current + 1);
  };

  const submitScore = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = name.trim();
    if (!trimmedName) {
      setSaveMessage("Skriv ditt namn innan du sparar.");
      return;
    }

    if (!sessionId) {
      setSaveMessage("Spelsession saknas.");
      return;
    }

    if (hasSubmittedRef.current) {
      setSaveMessage("Poängen är redan sparad.");
      return;
    }

    setIsSaving(true);
    setSaveMessage(null);

    try {
      const response = await fetch("/api/highscores/finish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmedName, sessionId }),
      });

      const payload = (await response.json()) as {
        message?: string;
        score?: number;
        scores?: ScoreEntry[];
      };

      if (!response.ok) {
        throw new Error(payload.message ?? "Kunde inte spara poängen.");
      }

      hasSubmittedRef.current = true;
      setSaveMessage("Poäng sparad!");
      setName("");

      if (typeof payload.score === "number") {
        setScore(payload.score);
      }

      if (payload.scores) {
        setScores(payload.scores);
      } else {
        await fetchScores();
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Något gick fel vid sparning.";
      setSaveMessage(message);
    } finally {
      setIsSaving(false);
    }
  };

  const fetchScores = async () => {
    setIsLoadingScores(true);
    try {
      const response = await fetch("/api/highscores", { cache: "no-store" });
      const payload = (await response.json()) as { scores?: ScoreEntry[]; message?: string };
      if (response.ok && payload.scores) {
        setScores(payload.scores);
      } else if (payload.message) {
        setSaveMessage(payload.message);
      }
    } finally {
      setIsLoadingScores(false);
    }
  };

  return (
    <section id="spel" className="space-y-6 border-b border-[color:var(--line)]/15 py-16">
      <h2 className="text-2xl sm:text-3xl">Bröllopsspel</h2>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 border border-[color:var(--line)]/20 bg-white/80 p-5">
          <p className="text-sm text-[color:var(--ink)]/75">
            Klicka så snabbt du kan i {GAME_SECONDS} sekunder. Poängen räknas server-side och kan inte skickas in manuellt.
          </p>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="border border-[color:var(--line)]/20 bg-[color:var(--paper)] px-3 py-2">
              <p className="text-[color:var(--ink)]/70">Tid kvar</p>
              <p className="text-xl font-semibold">{secondsLeft}s</p>
            </div>
            <div className="border border-[color:var(--line)]/20 bg-[color:var(--paper)] px-3 py-2">
              <p className="text-[color:var(--ink)]/70">Poäng</p>
              <p className="text-xl font-semibold">{score}</p>
            </div>
          </div>

          {phase !== "playing" ? (
            <button
              type="button"
              onClick={startGame}
              className="w-full border border-black bg-black px-4 py-3 text-white transition hover:bg-[#2a2521]"
            >
              {phase === "finished" ? "Spela igen" : "Starta spel"}
            </button>
          ) : (
            <button
              type="button"
              onClick={registerTap}
              className="w-full border border-black bg-white px-4 py-8 text-2xl font-bold transition hover:bg-[#f3ede4]"
            >
              TAP!
            </button>
          )}

          {phase === "finished" ? (
            <form onSubmit={submitScore} className="space-y-3 border-t border-[color:var(--line)]/15 pt-4">
              <label className="block text-sm text-[color:var(--ink)]/75" htmlFor="player-name">
                Ditt namn
              </label>
              <input
                id="player-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Till exempel Filippa"
                className="w-full border border-[color:var(--line)]/30 bg-white px-3 py-2 outline-none focus:border-black"
                maxLength={40}
              />
              <button
                type="submit"
                disabled={isSaving || hasSubmittedRef.current}
                className="w-full border border-black bg-black px-4 py-2 text-white transition disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSaving ? "Sparar..." : "Spara highscore"}
              </button>
              {saveMessage ? <p className="text-sm text-[color:var(--ink)]/75">{saveMessage}</p> : null}
            </form>
          ) : null}
        </div>

        <div className="space-y-3 border border-[color:var(--line)]/20 bg-white/80 p-5">
          <h3 className="text-lg">Topplista</h3>
          {isLoadingScores ? <p className="text-sm text-[color:var(--ink)]/70">Laddar...</p> : null}
          {!isLoadingScores && sortedScores.length === 0 ? (
            <p className="text-sm text-[color:var(--ink)]/70">Ingen highscore än. Bli först!</p>
          ) : null}
          {sortedScores.map((entry, index) => (
            <div
              key={`${entry.name}-${entry.createdAt}-${index}`}
              className="flex items-center justify-between border-b border-[color:var(--line)]/10 pb-2 text-sm"
            >
              <div>
                <p className="font-medium">
                  {index + 1}. {entry.name}
                </p>
                <p className="text-xs text-[color:var(--ink)]/60">{formatDate(entry.createdAt)}</p>
              </div>
              <p className="text-base font-semibold">{entry.score}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
