import { Gloock, Sora } from "next/font/google";

const display = Gloock({
  subsets: ["latin"],
  weight: ["400"],
});

const body = Sora({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

export default function Home() {
  return (
    <div
      className={`${body.className} min-h-screen bg-[#efe9e2] text-[#181411] [--paper:#efe9e2] [--ink:#181411] [--clay:#b06f59] [--moss:#6b7b6b]`}
    >
      <main className="mx-auto max-w-6xl px-6 pb-24 pt-14 sm:px-12">
        <section className="grid gap-10 border-b border-black/10 pb-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-8">
            <div className="space-y-4">
              <p className="text-[10px] uppercase tracking-[0.5em] text-black/50">Dennis & Filippa</p>
              <h1 className={`${display.className} text-5xl leading-tight sm:text-6xl`}>
                En dag att minnas
              </h1>
              <p className="max-w-md text-base leading-7 text-black/70">
                Vigsel i Kungsholmens kyrka och middag pa Langangens gard. En lugn dag med er vi tycker om.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <span className="rounded-full border border-black/20 bg-white/70 px-4 py-2 text-xs uppercase tracking-[0.3em] text-black/60">
                24 Augusti 2025
              </span>
              <span className="rounded-full border border-black/20 bg-white/70 px-4 py-2 text-xs uppercase tracking-[0.3em] text-black/60">
                Stockholm
              </span>
            </div>
            <div className="rounded-3xl border border-black/10 bg-white/80 p-6">
              <p className="text-xs uppercase tracking-[0.4em] text-black/50">Snabba fakta</p>
              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-black/50">Vigsel</p>
                  <p className="mt-2 text-sm text-black/70">Kungsholmens kyrka</p>
                  <p className="text-sm text-black/70">15:00</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-black/50">Middag</p>
                  <p className="mt-2 text-sm text-black/70">Langangens gard</p>
                  <p className="text-sm text-black/70">17:30</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {["Bild 01", "Bild 02", "Bild 03", "Bild 04"].map((label, index) => (
              <div
                key={label}
                className={`flex aspect-[4/3] items-center justify-center rounded-3xl border border-dashed border-black/20 bg-white/80 text-xs uppercase tracking-[0.35em] text-black/40 ${
                  index === 1 ? "sm:row-span-2 sm:aspect-auto" : ""
                }`}
              >
                {label}
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-12 border-b border-black/10 py-14 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <h2 className={`${display.className} text-3xl`}>Planen</h2>
            <p className="text-base leading-7 text-black/70">
              Dagen halls enkel. Exakta tider och detaljer skickas ut narmare datumet.
            </p>
            <div className="space-y-4">
              {[
                { label: "14:30", text: "Samling vid kyrkan" },
                { label: "15:00", text: "Vigsel" },
                { label: "17:30", text: "Middag pa garden" },
                { label: "20:00", text: "Dans och bar" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between rounded-2xl border border-black/10 bg-white/80 px-5 py-4">
                  <span className="text-sm font-semibold text-[color:var(--clay)]">{item.label}</span>
                  <span className="text-sm text-black/70">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-6">
            <div className="rounded-3xl border border-black/10 bg-white/80 p-6">
              <p className="text-xs uppercase tracking-[0.4em] text-black/50">OSA</p>
              <p className="mt-4 text-sm text-black/70">Svara senast 1 juli 2025.</p>
              <p className="text-sm text-black/70">rsvp@dennisfilippa.com</p>
            </div>
            <div className="rounded-3xl border border-black/10 bg-white/80 p-6">
              <p className="text-xs uppercase tracking-[0.4em] text-black/50">Praktiskt</p>
              <div className="mt-4 space-y-3 text-sm text-black/70">
                <p>Kladsel: uppklatt men bekvamt.</p>
                <p>Tal: meddela oss i forvag.</p>
                <p>Presenter: mer info senare.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-12 py-14 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-3xl border border-black/10 bg-[linear-gradient(135deg,_#ffffff,_var(--paper))] p-6">
            <h2 className={`${display.className} text-3xl`}>Resa & boende</h2>
            <p className="mt-4 text-base leading-7 text-black/70">
              Tips pa hotell och transporter kommer. Det ar enkelt att ta sig mellan kyrkan och gardens festplats.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {["Karta", "Transport", "Boende", "Parkering"].map((label) => (
                <div
                  key={label}
                  className="flex aspect-[4/3] items-center justify-center rounded-2xl border border-dashed border-black/20 bg-white/80 text-xs uppercase tracking-[0.35em] text-black/40"
                >
                  {label}
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-black/10 bg-white/80 p-6">
            <p className="text-xs uppercase tracking-[0.4em] text-black/50">Kontakt</p>
            <p className="mt-4 text-sm text-black/70">For fragor om dagen, maila oss.</p>
            <p className="mt-3 text-sm text-black/70">rsvp@dennisfilippa.com</p>
            <div className="mt-8 border-t border-black/10 pt-6 text-xs uppercase tracking-[0.3em] text-black/40">
              Fler detaljer kommer
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
