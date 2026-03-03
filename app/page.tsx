"use client";

import { CSSProperties, useEffect } from "react";
import Link from "next/link";
import Typography from "@mui/material/Typography";
import { Button, Col, Container, Row } from "react-bootstrap";
import RsvpForm from "./components/RsvpForm";
import HeartsTrail from "./components/HeartsTrail";
import { useMediaQuery } from "@mui/material";

const rootStyle = {
  minHeight: "100vh",
  backgroundColor: "#f6f2ea",
  color: "#1a1714",
  "--paper": "#f6f2ea",
  "--ink": "#e25473",
  "--accent": "#8b5e3c",
  "--line": "#1a1714",
} as CSSProperties;

const mainTextColor = "#381010";

const sectionDivider = { borderBottom: "1px solid rgb(26 23 20 / 15%)" };

export default function Home() {
  const isMobile = useMediaQuery('max-width:600px');

  
  const isMdUp = useMediaQuery("(min-width:768px)");
  const tiderRowStyle = {
    display: "flex",
    flexDirection: isMdUp ? "row" : "column",
    alignItems: isMdUp ? "center" : "flex-start",
    justifyContent: "space-between",
    gap: "1.5rem",
    flexWrap: "wrap",
  };
  const textColStyle = {
    flex: "1 1 0%",
    minWidth: 0,
  } as CSSProperties;
  const placeholderColStyle = {
    flex: "0 0 auto",
  };
  return (
    <Container fluid className="px-0" style={rootStyle}>
      <HeartsTrail />

      <Container style={{ maxWidth: "72rem" }} className="px-4 px-sm-5 pb-5">
        <Col
          as="section"
          id="top"
          className="position-relative d-flex flex-column justify-content-center"
          style={{
            minHeight: "100vh",
            gap: "2rem",
            paddingTop: "3.5rem",
            paddingBottom: "3.5rem",
          }}
        >
          <Col
            className="position-absolute top-0 start-0 w-100 h-100 p-0"
            style={{
              zIndex: -1,
              background: "radial-gradient(circle at top, #ffffff 0%, var(--paper) 48%, #efe6da 100%)",
            }}
          />


          <Row className=" g-4" style={{alignContent: "center", justifyContent: "center", textAlign: "center"}}>
              <Typography variant="h4" style={{fontFamily: "Didot", color: mainTextColor}}>22 augusti 2026</Typography>
          </Row>
          <Row className=" g-4" style={{alignContent: "center", justifyContent: "center", textAlign: "center"}}>
            <Typography variant="h1" style={{fontFamily: "Didot" , color: mainTextColor, fontSize: isMobile ? "140px" : "60px"}}>Vi gifter oss!</Typography>
          </Row>
          <Row style={{alignContent: "center", justifyContent: "center"}}>
              <Button
                onClick={() => {
                  window.scrollTo({
                    top: document.documentElement.scrollHeight,
                    behavior: "smooth",
                  });
                }}
                style={{
                  borderRadius: "4px",
                  border: "0px solid black",
                  backgroundColor: "#d64c63",
                  color: "white",
                  fontWeight: 600,
                  fontFamily: "Didot",
                  maxWidth: "150px",
                  padding: "0.4rem 1.25rem",
                }}
              >
                OSA här
              </Button>
          </Row>
        </Col>

        <Col id="tider" className="py-5">
          <Row className="g-2 mb-3 align-items-baseline">
            <Col>
              <Typography variant="h2" style={{ fontFamily: "Didot", color: mainTextColor }}>
                Vigsel
              </Typography>
            </Col>
          </Row>
          <Row className="g-4">
            <Col md={6}>
              <Col className=" h-100 p-4 d-flex flex-column gap-4">
                <Row className="g-3 align-items-center flex-column flex-md-row"
                    style={{display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start",}}>
                  <Col style={{flex: "1 1 0%"}}>
                    <Typography variant="subtitle1">14:00</Typography>
                    <Typography variant="body2" sx={{ color: "rgb(26 23 20 / 70%)" }}>
                      Kungsholms kyrka
                    </Typography>
                    <Typography variant="body2" sx={{ color: "rgb(26 23 20 / 70%)" }}>
                      Ringklockor kl 14.00
                    </Typography>
                  </Col>
                  <Col xs={12} sm={5} style={{flex: "0 0 auto"}}>
                    <div className="tider-placeholder">Placeholder picture</div>
                  </Col>
                </Row>
              </Col>
            </Col>
          </Row>

          
        <Col id="tider" className="py-5">
          <Row className="g-2 mb-3 align-items-baseline">
            <Col style={{alignContent: "right", justifyContent: "right" , textAlign: "right"}}>
              <Typography variant="h2" style={{ fontFamily: "Didot", color: mainTextColor }}>
                Middag och fest
              </Typography>
            </Col>
          </Row>
          <Row className="g-4">
            <Col md={6}>
              <Col className=" h-100 p-4 d-flex flex-column gap-4">
                <Row className="g-3 align-items-center flex-column flex-md-row">
                  <Col xs={12} sm={5} className="order-md-1 order-2">
                    <div className="tider-placeholder">Placeholder picture</div>
                  </Col>
                  <Col className="order-md-2 order-1">
                    <Typography variant="subtitle1">16:30</Typography>
                    <Typography variant="body2" sx={{ color: "rgb(26 23 20 / 70%)" }}>
                      Långängens gård – fördrink och mingel.
                    </Typography>
                    <Typography variant="body2" sx={{ color: "rgb(26 23 20 / 70%)" }}>
                      Band och dans hela natten.
                    </Typography>
                  </Col>
                </Row>
              </Col>
            </Col>
            </Row>
        </Col>
        </Col>

        <Col as="section" id="toastmasters" className="py-5" style={sectionDivider}>
          <Typography variant="h2" sx={{ marginBottom: "1.2rem" }}>
            Toastmasters
          </Typography>
          <Col className="info-card info-card-strong p-4">
            <Typography variant="subtitle1">Karl Nygren och Ida Bjarke.</Typography>
            <Typography variant="body2" sx={{ color: "rgb(26 23 20 / 70%)", marginTop: "0.8rem" }}>
              Hör av er till dem.
            </Typography>
          </Col>
        </Col>

        <Col as="section" id="osa" className="py-5">
          <Typography variant="h2" sx={{ marginBottom: "1.2rem" }}>
            OSA
          </Typography>

          <Row className="g-4">
            <Col sm={6}>
              <RsvpForm />
            </Col>
            <Col sm={6}>
              <Col className="info-card p-4 d-flex flex-column gap-3 h-100 justify-content-center">
                <Typography variant="overline" sx={{ color: "rgb(26 23 20 / 60%)" }}>
                  OSA senast
                </Typography>
                <Typography variant="subtitle1">1 maj</Typography>
                <Typography variant="body2" sx={{ color: "rgb(26 23 20 / 70%)" }}>
                  Man får självklart OSA direkt till oss på valfritt sätt, eller höra av sig om man
                  har några som helst frågor.
                </Typography>
              </Col>
            </Col>
          </Row>
        </Col>

        <Row className="mt-2 g-3">
          <Col xs="auto">
            <Link
              href="/brollopsjakten"
              style={{
                display: "inline-flex",
                alignItems: "center",
                border: "1px solid black",
                backgroundColor: "black",
                color: "white",
                borderRadius: "0.75rem",
                fontWeight: 600,
                fontSize: "0.92rem",
                padding: "0.62rem 1rem",
                textDecoration: "none",
              }}
            >
              Spela bröllopsjakten nu
            </Link>
          </Col>
        </Row>
      </Container>
    </Container>
  );
}
