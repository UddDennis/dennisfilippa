"use client"; 
import { Italiana, Space_Mono } from "next/font/google";
import HighscoreGame from "./components/HighscoreGame";
import RsvpForm from "./components/RsvpForm";
import {Row, Col, Button} from 'react-bootstrap';

const display = Italiana({
  subsets: ["latin"],
  weight: ["400"],
});

const mono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
});

export default function Home() {
  return (
    <div
      className={`${display.className} min-h-screen scroll-smooth bg-[#f6f2ea] text-[#1a1714] [--paper:#f6f2ea] [--ink:#1a1714] [--accent:#8b5e3c] [--line:#1a1714]`}
    >
      <main className="mx-auto max-w-4xl px-6 pb-24 sm:px-10">
        <section
          id="top"
          className="relative flex h-screen min-h-screen flex-col justify-center gap-8 border-b border-[color:var(--line)]/15 py-14"
        >
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_#ffffff_0%,_var(--paper)_48%,_#efe6da_100%)]" />
          <div className="floaty space-y-4">
          <Row>
            <Col>
            <h1 className="text-4xl leading-tight sm:text-6xl">Vi gifter oss!</h1>
            </Col>
            <Col>
            <h1 className="text-4xl leading-tight sm:text-6xl">22 augusti</h1>
            </Col>
            <Col>
            <h1 className="text-4xl leading-tight sm:text-6xl">2026</h1>
            </Col>

            <Button 
              onClick={() => {
                window.scrollTo({
                  top: document.documentElement.scrollHeight,
                  behavior: 'smooth'
                })    
              }}
              style={{
                color: "white",
                background: "black",
                borderColor: "white",
                maxWidth: "120px"
              }}
            >
              kom vettja
            </Button>
          </Row>
          </div>
        </section>

        <section id="tider" className="space-y-6 border-b border-[color:var(--line)]/15 py-16">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="text-2xl sm:text-3xl">Tider & plats</h2>
            <span className={`${mono.className} text-xs uppercase tracking-[0.4em] text-[color:var(--ink)]/60`}>
              24/08/2025
            </span>

          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-3 border border-[color:var(--line)]/20 bg-white/80 p-5">
              <p className={`${mono.className} text-xs uppercase tracking-[0.4em] text-[color:var(--ink)]/60`}>
                Vigsel
              </p>
              <p className="text-base">14:00</p>
              <p className="text-sm text-[color:var(--ink)]/70">Plats meddelas i inbjudan.</p>
            </div>
            <div className="space-y-3 border border-[color:var(--line)]/20 bg-white/80 p-5">
              <p className={`${mono.className} text-xs uppercase tracking-[0.4em] text-[color:var(--ink)]/60`}>
                Fest
              </p>
              <p className="text-base">16:30</p>
              <p className="text-sm text-[color:var(--ink)]/70">Middag och firande efter vigseln.</p>
            </div>
          </div>
        </section>

        <section id="toastmasters" className="space-y-6 border-b border-[color:var(--line)]/15 py-16">
          <h2 className="text-2xl sm:text-3xl">Toastmasters</h2>
          <div className="border border-[color:var(--line)]/20 bg-white/80 p-5">
            <p className="text-base">Karl Nygren och Ida Bjarke.</p>
            <p className="mt-3 text-sm text-[color:var(--ink)]/70">
              Hör gärna av er till dem om ni vill hålla tal eller göra något under kvällen.
            </p>
          </div>
        </section>

        <section id="osa" className="space-y-6 py-16">
          <h2 className="text-2xl sm:text-3xl">OSA</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            <RsvpForm />
            <div className="space-y-4 border border-[color:var(--line)]/20 bg-white/80 p-5">
              <div>
              <p className={`${mono.className} text-xs uppercase tracking-[0.4em] text-[color:var(--ink)]/60`}>
                Sista datum
              </p>
              <p className="mt-2 text-base">1 maj</p>
              <p className="text-sm text-[color:var(--ink)]/70">Tack för att ni svarar i tid.</p>
              </div>
              <div>
                <p className={`${mono.className} text-xs uppercase tracking-[0.4em] text-[color:var(--ink)]/60`}>
                  Kontakt
                </p>
                <p className="mt-2 text-base">rsvp@dennisfilippa.com</p>
                <p className="text-sm text-[color:var(--ink)]/70">Skriv gärna om något strular i formuläret.</p>
              </div>
            </div>
          </div>
        </section>
        <HighscoreGame />
      </main>
    </div>
  );
}
