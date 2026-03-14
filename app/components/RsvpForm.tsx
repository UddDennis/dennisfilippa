"use client";

import { FormEvent, useState } from "react";
import { Button, Col, Form } from "react-bootstrap";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box"
import { useMediaQuery } from "@mui/material";
import ElectricBorder from "./ElectricBorder";

const inputStyle = {
  border: "0px solid rgb(26 23 20 / 30%)",
  borderRadius: "0.5rem",
  backgroundColor: "rgb(255 255 255 / 92%)",
  padding: "0.55rem 0.8rem",
};

const mainTextColor = "#381010";
const selectedFillColor = "#fa758b";
const electricBorderColor = "#ffffe5";

export default function RsvpForm() {
  const [fullName, setFullName] = useState("");
  const [canAttend, setCanAttend] = useState<boolean>(true);
  const [foodAllergies, setFoodAllergies] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const isMobile = useMediaQuery("(max-width:600px)");

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
          canAttend: canAttend,
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
      setCanAttend(true);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Något gick fel.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Col as="form" onSubmit={submitRsvp} className="info-card h-100 d-flex flex-column gap-3 p-4">


      <Form.Group controlId="rsvp-name">
        <Form.Label style={{ fontFamily: "Didot", color: mainTextColor , marginBottom: "0.35rem" }}>
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
        <Typography style={{ fontFamily: "Didot", color: mainTextColor , marginBottom: "0.35rem" }}>
          Kan du komma?
        </Typography>
        <Col className="d-flex flex-wrap gap-4 p-0 " style={{justifyContent: isMobile ? 'center' : 'left'}}>
      
          <Box
            sx={{
                position: 'relative',
                display: 'inline-flex',
                borderRadius: '6px',
                backgroundColor: "#fba2b1",
                cursor: 'pointer',
                maxHeight: '40px',
                userSelect: 'none',
                // maxWidth: '260px',
                touchAction: 'manipulation',
            }}
        >
            <Box
                sx={{
                    position: 'absolute',
                    top: '0px',
                    bottom: '0px',
                    left: '0px',
                    width: 'calc(50%)',
                    transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: !canAttend ? 'translateX(100%)' : 'translateX(0)',
                    zIndex: 0,
                    pointerEvents: 'none',
                }}
            >
                <ElectricBorder
                  active
                  color={electricBorderColor}
                  speed={0.5}
                  chaos={0.2}
                  thickness={1.2}
                  borderRadius={6}
                  style={{ width: "100%", height: "100%", borderRadius: 2 }}
                >
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      borderRadius: 6,
                      backgroundColor: selectedFillColor,
                    }}
                  />
                </ElectricBorder>
            </Box>
            
              <Box
                  key={12}
                  onPointerDown={(e) => {
                      e.preventDefault();
                      return setCanAttend(true);
                  }}
                  onClick={() => {
                      return setCanAttend(true);
                  }}
                  sx={{
                      position: 'relative',
                      zIndex: 1,
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      px: 2,
                      py: 1,
                      fontWeight: 600,
                      // borderWidth: 1,
                      fontSize: '0.85rem',
                      lineHeight: 1.2,
                      color:  mainTextColor,
                      transition: 'color 0.25s ease',
                      whiteSpace: 'nowrap',
                      // borderRadius: '2px',
                  }}
              >
                  {"Jag kan komma "}
              </Box>
              <Box
                  key={13}
                  onPointerDown={(e) => {
                      e.preventDefault();
                      return setCanAttend(false);
                  }}
                  onClick={() => {
                      return setCanAttend(false);
                  }}
                  sx={{
                      position: 'relative',
                      zIndex: 1,
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      px: 2,
                      py: 1,
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      lineHeight: 1.2,
                      color:  mainTextColor,
                      transition: 'color 0.25s ease',
                      whiteSpace: 'nowrap',
                      // borderRadius: '2px',
                  }}
              >
                  {"Jag kommer inte"}
              </Box>
        </Box>
        </Col>
      </Form.Group>

      <Form.Group controlId="rsvp-allergies">
        <Form.Label style={{ fontFamily: "Didot", color: mainTextColor , marginBottom: "0.35rem" }}>
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
          border: "0px solid black",
          backgroundColor: "#d64c63",
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
