"use client";

import { FormEvent, useState } from "react";

export default function RsvpForm() {
  const [fullName, setFullName] = useState("");
  const [canAttend, setCanAttend] = useState<"yes" | "no">("yes");
  const [foodAllergies, setFoodAllergies] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const submitRsvp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!fullName.trim()) {
      setMessage("Skriv för- och efternamn.");
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          canAttend: canAttend === "yes",
          foodAllergies: foodAllergies.trim(),
        }),
      });

      const payload = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(payload.message ?? "Kunde inte spara OSA.");
      }

      setMessage("Tack! Din OSA är sparad.");
      setFullName("");
      setFoodAllergies("");
      setCanAttend("yes");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Något gick fel.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={submitRsvp} className="space-y-4 border border-[color:var(--line)]/20 bg-white/80 p-5">
      <p className="text-base">OSA-formulär</p>

      <div className="space-y-2">
        <label htmlFor="rsvp-name" className="block text-sm text-[color:var(--ink)]/75">
          För- och efternamn
        </label>
        <input
          id="rsvp-name"
          type="text"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          maxLength={80}
          required
          className="w-full border border-[color:var(--line)]/30 bg-white px-3 py-2 outline-none focus:border-black"
          placeholder="Till exempel Dennis Svensson"
        />
      </div>

      <div className="space-y-2">
        <p className="text-sm text-[color:var(--ink)]/75">Kan du komma?</p>
        <div className="flex gap-4 text-sm">
          <label className="inline-flex items-center gap-2">
            <input
              type="radio"
              name="canAttend"
              checked={canAttend === "yes"}
              onChange={() => setCanAttend("yes")}
            />
            Ja, jag kommer
          </label>
          <label className="inline-flex items-center gap-2">
            <input
              type="radio"
              name="canAttend"
              checked={canAttend === "no"}
              onChange={() => setCanAttend("no")}
            />
            Nej, jag kan inte
          </label>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="rsvp-allergies" className="block text-sm text-[color:var(--ink)]/75">
          Matallergier / specialkost (valfritt)
        </label>
        <textarea
          id="rsvp-allergies"
          value={foodAllergies}
          onChange={(event) => setFoodAllergies(event.target.value)}
          maxLength={400}
          rows={3}
          className="w-full border border-[color:var(--line)]/30 bg-white px-3 py-2 outline-none focus:border-black"
          placeholder="Exempel: laktos, gluten..."
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full border border-black bg-black px-4 py-2 text-white transition disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? "Sparar..." : "Skicka OSA"}
      </button>

      {message ? <p className="text-sm text-[color:var(--ink)]/75">{message}</p> : null}
    </form>
  );
}
