"use client"; 
import Link from "next/link";
import RsvpForm from "./components/RsvpForm";
import HeartsTrail from "./components/HeartsTrail";

export default function Home() {
  return (
    <div
      className="min-h-screen scroll-smooth bg-[#f6f2ea] text-[#1a1714] [--paper:#f6f2ea] [--ink:#1a1714] [--accent:#8b5e3c] [--line:#1a1714]"
    >
      <HeartsTrail />
      <main className="mx-auto max-w-6xl px-6 pb-24 sm:px-10">
        <section
          id="top"
          className="relative flex h-screen min-h-screen flex-col justify-center gap-8 border-b border-[color:var(--line)]/15 py-14"
        >
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_#ffffff_0%,_var(--paper)_48%,_#efe6da_100%)]" />
          <div className="floaty grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] md:items-center md:gap-6">
            <h1 className="text-4xl leading-tight sm:text-6xl">Vi gifter oss!</h1>
            <h1 className="text-4xl leading-tight sm:text-6xl">22 augusti 2026</h1>
            <button
              onClick={() => {
                window.scrollTo({
                  top: document.documentElement.scrollHeight,
                  behavior: "smooth",
                });
              }}
              className="w-fit rounded border border-black bg-black px-5 py-2 text-sm font-semibold   text-white transition md:justify-self-end"
            >
              Anmäl dig här
            </button>
          </div>
        </section>

        <section id="tider" className="space-y-6 border-b border-[color:var(--line)]/15 py-16">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="text-2xl sm:text-3xl">Tid & plats</h2>
            <span className="text-xs uppercase tracking-[0.4em] text-[color:var(--ink)]/60">
              22/08/2026
            </span>

          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="info-card info-card-strong space-y-3 p-5">
              <p className=" uppercase  text-[color:var(--ink)]/60">
                Vigsel
              </p>
              <p className="text-base">14:00</p>
              <p className="text-[color:var(--ink)]/70">Kungsholms kyrka.</p>
            </div>
            <div className="info-card info-card-strong space-y-3 p-5">
              <p className=" uppercase  text-[color:var(--ink)]/60">
                Middag + Fest
              </p>
              <p className="text-base">16:30</p>
              <p className="text-[color:var(--ink)]/70">Fördrink och mingel på Långängens gård.</p>
            </div>
          </div>
        </section>

        <section id="toastmasters" className="space-y-6 border-b border-[color:var(--line)]/15 py-16">
          <h2 className="text-2xl sm:text-3xl">Toastmasters</h2>
          <div className="info-card info-card-strong p-5">
            <p className="text-base">Karl Nygren och Ida Bjarke.</p>
            <p className="mt-3 text-[color:var(--ink)]/70">
              Hör av er till dem .
            </p>
          </div>
        </section>

        <section id="osa" className="space-y-6 py-16">
          <h2 className="text-2xl sm:text-3xl">OSA</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            <RsvpForm />
            <div className="info-card space-y-4 p-5">
              <div>
              <p className="text-xs uppercase  text-[color:var(--ink)]/60">
                OSA senast
              </p>
              <p className="mt-2 text-base">1 maj</p>
              {/* <p className="text-sm text-[color:var(--ink)]/70">Tack för att ni svarar i tid.</p> */}
              <p className="text-sm text-[color:var(--ink)]/70">{"Man får självklart OSA direkt till oss på valfritt sätt, eller höra av sig om man har några som helst frågor <3"} </p>

              </div>
            </div>
          </div>
        </section>
         <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/brollopsjakten"
              className="rounded-xl border border-black bg-black px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              Spela bröllopsjakten nu
            </Link>
          </div>
      </main>
    </div>
  );
}
