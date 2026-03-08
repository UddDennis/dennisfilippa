"use client";

import Link from "next/link";
import { CSSProperties, FormEvent, useEffect, useState } from "react";
import { Button, Col, Container, Form, Row } from "react-bootstrap";
import Typography from "@mui/material/Typography";
import WeddingChase from "../components/WeddingChase";
import { useMediaQuery } from "@mui/material";

type ScoreEntry = {
  name: string;
  score: number;
  createdAt: string;
};

const mainTextColor = "#381010";
const rootStyle = {
  minHeight: "100vh",
  backgroundColor: "#f6f2ea",
  color: "#1a1714",
  "--ink": "#1a1714",
  "--line": "#1a1714",
} as CSSProperties;

const panelStyle: CSSProperties = {
  border: "1px solid rgb(26 23 20 / 20%)",
  borderRadius: "0.75rem",
  backgroundColor: "rgb(255 255 255 / 90%)",
};

const inputStyle: CSSProperties = {
  border: "1px solid rgb(26 23 20 / 30%)",
  borderRadius: "0.5rem",
  backgroundColor: "white",
  padding: "0.55rem 0.8rem",
};

export default function Brollopsjakten() {
  const isMobile = useMediaQuery("(max-width:600px)");
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
    <Container fluid className="px-0" style={rootStyle}>
      <Container style={{ maxWidth: "64rem" }} className="px-4 px-sm-5 pb-5 pt-4 pt-sm-5">
        <Col as="header" className="d-flex flex-column gap-3" style={{alignItems: 'center'}}>
          <Row>
            <Col xs="auto">
              <Link
                href="/"
                style={{
                  textDecoration: "none",
                  color: "rgb(26 23 20 / 70%)",
                }}
              >
                <Typography variant="caption" component="span" style={{fontFamily: "Didot", color: mainTextColor}}>
                  Tillbaka
                </Typography>
              </Link>
            </Col>
          </Row>
          <Typography variant="h1" style={{fontFamily: "Didot", color: mainTextColor, textAlign: 'center', fontSize: isMobile ? '48px' : '96px'}} >Bröllopsjakten</Typography>
          <Typography variant="body1" style={{fontFamily: "Didot", color: mainTextColor, textAlign: 'center', maxWidth: "42rem" }}>
            Dennis och Filippa ska gifta sig, men det verkar vara stökigt i kyrkan. Hjälp dem
            fram till altaret. Spela med piltangenterna eller håll in på sidorna av skärmen för att flytta i sidled. Men glöm inte att FÅNGA RINGARNA!
          </Typography>
        </Col>

        <Col as="section" className="d-flex flex-column gap-4 mt-4">
          <WeddingChase onFinish={(value) => setLatestScore(value)} />

          <Row className="g-4">
            <Col lg={6}>
              <Col as="form" onSubmit={handleSubmit} className="d-flex flex-column gap-3 p-4" style={panelStyle}>
                <Typography variant="overline" style={{fontFamily: "Didot", color: mainTextColor}}>
                  Spara poängen
                </Typography>
                <Typography variant="body1" style={{fontFamily: "Didot", color: mainTextColor}}>Senaste poäng: {latestScore ?? "-"}</Typography>

                <Form.Group controlId="leader-name">
                  <Form.Label style={{fontFamily: "Didot", color: mainTextColor, marginBottom: "0.35rem" }}>
                    Namn
                  </Form.Label>
                  <Form.Control
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="T.ex. Filippa"
                    style={inputStyle}
                  />
                </Form.Group>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    // color: mainTextColor,
                    color: "white",
                    border: "0px solid black",
                    backgroundColor: "#d64c63",
                    borderRadius: "0.5rem",
                    fontWeight: 600,
                  }}
                >
                  {isSubmitting ? "Sparar..." : "Spara poäng"}
                </Button>

                {statusMessage ? (
                  <Typography variant="caption" sx={{ color: "rgb(26 23 20 / 70%)" }}>
                    {statusMessage}
                  </Typography>
                ) : null}
              </Col>
            </Col>

            <Col lg={6}>
              <Col className="d-flex flex-column gap-3 p-4 h-100" style={panelStyle}>
                <Typography variant="overline" style={{fontFamily: "Didot", color: mainTextColor}}>
                  Topplista
                </Typography>

                <Col className="d-flex flex-column gap-2 p-0">
                  {leaderboard.length === 0 ? (
                    <Typography variant="body2" sx={{ color: "rgb(26 23 20 / 70%)" }}>
                      Ingen poäng ännu. Var först!
                    </Typography>
                  ) : (
                    leaderboard.map((entry, index) => (
                      <Row key={`${entry.name}-${entry.createdAt}-${index}`} className="align-items-end gy-1">
                        <Col>
                          <Typography variant="subtitle1" style={{fontFamily: "Didot", color: mainTextColor}}>
                            {index + 1}. {entry.name}
                          </Typography>
                          <Typography variant="caption" style={{fontFamily: "Didot", color: mainTextColor}}>
                            {new Date(entry.createdAt).toLocaleString("sv-SE", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </Typography>
                        </Col>
                        <Col xs="auto">
                          <Typography variant="subtitle1" component="span" style={{fontFamily: "Didot", color: mainTextColor}}>
                            {entry.score}
                          </Typography>
                        </Col>
                      </Row>
                    ))
                  )}
                </Col>
              </Col>
            </Col>
          </Row>
        </Col>
      </Container>
    </Container>
  );
}
