"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import WeddingChase from "../components/WeddingChase";

type ScoreEntry = {
  name: string;
  score: number;
  createdAt: string;
};

export default function Brollopsjakten() {
  const [leaderboard, setLeaderboard] = useState<ScoreEntry[]>([]);
  const [name, setName] = useState("");
  const [latestScore, setLatestScore] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch("/api/brollopsjakten/leaderboard", { cache: "no-store" });
      const payload = (await response.json()) as { scores?: ScoreEntry[] };
      if (payload.scores) {
        setLeaderboard(payload.scores);
      }
    } catch (error) {
      console.error("could not load leaderboard", error);
    }
  };

  useEffect(() => {
    void fetchLeaderboard();
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (latestScore === null) {
      setStatusMessage("Spela först innan du sparar poängen.");
      return;
    }

    if (!name.trim()) {
      setStatusMessage("Skriv ditt namn innan du sparar.");
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      const response = await fetch("/api/brollopsjakten/leaderboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), score: latestScore }),
      });

      const payload = (await response.json()) as { message?: string; scores?: ScoreEntry[] };
      if (!response.ok) {
        throw new Error(payload.message ?? "Kunde inte spara highscore.");
      }

      setStatusMessage("Poängen är sparad!");
      setName("");
      if (payload.scores) {
        setLeaderboard(payload.scores);
      } else {
        void fetchLeaderboard();
      }
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Ett fel uppstod.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f2ea] text-[#1a1714]">
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 pb-24 pt-10 sm:px-10">
        <header className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/"
              className="text-xs  text-[color:var(--ink)]/70"
            >
              Tillbaka
            </Link>
          </div>
          <h1 className="text-4xl font-light sm:text-5xl">Bröllopsjakten</h1>
          <p className="max-w-2xl text-base text-[color:var(--ink)]/70">
            Dennis och Filippa ska gifta sig, men det verkar vara stökigt i kyrkan. Hjälp dem fram till altaret. 
          </p>
        </header>

        <section className="space-y-6">
          <WeddingChase onFinish={(value) => setLatestScore(value)} />
          <div className="grid gap-6 lg:grid-cols-[1fr,1fr]">
            <form onSubmit={handleSubmit} className="space-y-3 rounded border border-[color:var(--line)]/20 bg-white/90 p-5">
              <p className="text-sm uppercase tracking-[0.4em] text-[color:var(--ink)]/60">Spara poängen</p>
              <p className="text-base">Senaste poäng: {latestScore ?? "-"}</p>
              <div className="space-y-2">
                <label className="block text-sm text-[color:var(--ink)]/75" htmlFor="leader-name">
                  Namn
                </label>
                <input
                  id="leader-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="w-full border border-[color:var(--line)]/30 bg-white px-3 py-2 focus:border-black"
                  placeholder="Till exempel Filippa"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full border border-black bg-black px-4 py-2 text-white transition hover:bg-[#2a2521] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? "Sparar..." : "Spara poäng"}
              </button>
              {statusMessage ? <p className="text-xs text-[color:var(--ink)]/70">{statusMessage}</p> : null}
            </form>
            <div className="rounded border border-[color:var(--line)]/20 bg-white/90 p-5">
              <p className="text-sm uppercase tracking-[0.4em] text-[color:var(--ink)]/60">Topplista</p>
              <div className="mt-3 space-y-2 text-sm text-[color:var(--ink)]/70">
                {leaderboard.length === 0 ? (
                  <p>Ingen poäng ännu. Var först!</p>
                ) : (
                  leaderboard.map((entry, index) => (
                    <div key={`${entry.name}-${entry.createdAt}-${index}`} className="flex items-baseline justify-between">
                      <div>
                        <p className="font-medium">{index + 1}. {entry.name}</p>
                        <p className="text-[0.7rem] text-[color:var(--ink)]/60">
                          {new Date(entry.createdAt).toLocaleString("sv-SE", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      <span className="text-base font-semibold">{entry.score}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
