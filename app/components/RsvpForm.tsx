"use client";

import { FormEvent, useState } from "react";
import { Button, Col, Form } from "react-bootstrap";
import Typography from "@mui/material/Typography";

const inputStyle = {
  border: "1px solid rgb(26 23 20 / 30%)",
  borderRadius: "0.5rem",
  backgroundColor: "rgb(255 255 255 / 92%)",
  padding: "0.55rem 0.8rem",
};

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
    <Col as="form" onSubmit={submitRsvp} className="info-card h-100 d-flex flex-column gap-3 p-4">
      <Typography variant="subtitle1">Formulär</Typography>

      <Form.Group controlId="rsvp-name">
        <Form.Label style={{ color: "rgb(26 23 20 / 75%)", marginBottom: "0.35rem" }}>
          För- och efternamn
        </Form.Label>
        <Form.Control
          type="text"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          maxLength={80}
          required
          style={inputStyle}
          placeholder="T.ex. Dennis Udd"
        />
      </Form.Group>

      <Form.Group>
        <Typography variant="body2" sx={{ color: "rgb(26 23 20 / 75%)", marginBottom: "0.35rem" }}>
          Kan du komma?
        </Typography>
        <Col className="d-flex flex-wrap gap-4 p-0">
          <Form.Check
            inline
            type="radio"
            id="can-attend-yes"
            label="Ja, jag kommer"
            name="canAttend"
            checked={canAttend === "yes"}
            onChange={() => setCanAttend("yes")}
          />
          <Form.Check
            inline
            type="radio"
            id="can-attend-no"
            label="Nej, jag kan inte"
            name="canAttend"
            checked={canAttend === "no"}
            onChange={() => setCanAttend("no")}
          />
        </Col>
      </Form.Group>

      <Form.Group controlId="rsvp-allergies">
        <Form.Label style={{ color: "rgb(26 23 20 / 75%)", marginBottom: "0.35rem" }}>
          Allergier / specialkost (valfritt)
        </Form.Label>
        <Form.Control
          as="textarea"
          value={foodAllergies}
          onChange={(event) => setFoodAllergies(event.target.value)}
          maxLength={400}
          rows={3}
          style={inputStyle}
          placeholder="Exempel: laktos, gluten..."
        />
      </Form.Group>

      <Button
        type="submit"
        disabled={isSubmitting}
        style={{
          border: "1px solid black",
          backgroundColor: "black",
          borderRadius: "0.75rem",
          fontWeight: 600,
          marginTop: "0.25rem",
        }}
      >
        {isSubmitting ? "Sparar..." : "Skicka"}
      </Button>

      {message ? (
        <Typography variant="body2" sx={{ color: "rgb(26 23 20 / 75%)" }}>
          {message}
        </Typography>
      ) : null}
    </Col>
  );
}
