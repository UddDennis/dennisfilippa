"use client";

import { CSSProperties, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
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
  const [hasLoaded, setHasLoaded] = useState(false);
  const isMobileQuery = useMediaQuery("(max-width:600px)");
  const isMobile = hasLoaded ? isMobileQuery : true;
  const karlPartRef = useRef<HTMLDivElement | null>(null);
  const idaPartRef = useRef<HTMLDivElement | null>(null);
  const [karlVisible, setKarlVisible] = useState(false);
  const [idaVisible, setIdaVisible] = useState(false);


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
  const toastmasterPartStyle = {
    position: "relative",
    overflow: "visible",
    // borderTop: "1px solid rgb(26 23 20 / 25%)",
    // borderBottom: "1px solid rgb(26 23 20 / 25%)",
    background: "transparent",
  } as CSSProperties;
  const toastmasterLinkStyle = {
    color: mainTextColor,
    textDecorationColor: "rgb(56 16 16 / 40%)",
  } as CSSProperties;
  const toastmasterPortraitStyle = {
    width: isMobile ? "62px" : "84px",
    height: isMobile ? "62px" : "84px",
    borderRadius: "999px",
    boxShadow: "0 10px 22px -14px rgb(17 12 8 / 70%)",
    border: "1px solid rgb(56 16 16 / 25%)",
  } as CSSProperties;
  const getToastmasterImageStyle = (side: "left" | "right", isVisible: boolean) =>
    ({
      position: "absolute",
      top: "0.8rem",
      pointerEvents: "none",
      opacity: isVisible ? 1 : 0,
      willChange: "transform, opacity",
      transition: "transform 700ms cubic-bezier(0.22, 0.86, 0.24, 1), opacity 420ms ease",
      left: side === "left" ? (isMobile ? "-0.7rem" : "14.5rem") : undefined,
      right: side === "right" ? (isMobile ? "-0.7rem" : "10.5rem") : undefined,
      transform: isVisible
        ? "translateX(0)"
        : side === "left"
          ? "translateX(calc(-100vw - 8rem))"
          : "translateX(calc(100vw + 8rem))",
    }) as CSSProperties;

  useEffect(() => {
    setHasLoaded(true);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("IntersectionObserver" in globalThis)) {
      globalThis.setTimeout(() => {
        setKarlVisible(true);
        setIdaVisible(true);
      }, 0);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.target === karlPartRef.current) {
            requestAnimationFrame(() => setKarlVisible(entry.isIntersecting));
          }
          if (entry.target === idaPartRef.current) {
            requestAnimationFrame(() => setIdaVisible(entry.isIntersecting));
          }
        });
      },
      { threshold: 0.05, rootMargin: "0px 0px 20% 0px" }
    );

    const karlNode = karlPartRef.current;
    const idaNode = idaPartRef.current;
    if (karlNode) observer.observe(karlNode);
    if (idaNode) observer.observe(idaNode);

    return () => observer.disconnect();
  }, []);

  return (
    <Container fluid className="px-0" style={rootStyle}>
      <HeartsTrail />

      <Container
        style={{ maxWidth: "72rem", textAlign: isMobile ? "center" : undefined }}
        className="px-4 px-sm-5 pb-5"
      >
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
          <div style={{ position: "relative" }}>
            <div
              style={{
                position: "absolute",
                bottom: "calc(100% + 0.25rem)",
                left: "50%",
                transform: "translateX(-50%)",
                width: isMobile ? "300px" : "420px",
                zIndex: 1,
                pointerEvents: "none",
              }}
            >
              <Image
                src="/puss2.svg"
                alt="Pussbild"
                width={788}
                height={596}
                sizes="(max-width: 600px) 300px, 420px"
                style={{ width: "100%", height: "auto", display: "block" }}
                priority
              />
            </div>

            <Row className=" g-4" style={{alignContent: "center", justifyContent: "center", textAlign: "center"}}>
                <Typography style={{fontFamily: "Didot", color: mainTextColor ,fontSize: isMobile ? "24px" : "34px"}}>22 augusti 2026</Typography>
            </Row>
          </div>
          <Row className=" g-4" style={{alignContent: "center", justifyContent: "center", textAlign: "center"}}>
            <Typography variant="h1" style={{fontFamily: "Didot" , color: mainTextColor, fontSize: isMobile ? "60px" : "140px"}}>Vi gifter oss!</Typography>
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
              <Typography variant="h2" style={{ fontFamily: "Didot", color: mainTextColor , fontSize: isMobile ? "46px" : "80px"}}>
                Vigsel
              </Typography>
            </Col>
          </Row>
          <Row className="g-4" style={{
                position: 'relative',
                display: 'flex',
                justifyContent: 'space-between',}}>
            <Col md={12}>
              <Col className=" h-100 pb-4 d-flex flex-column gap-4">
                <Row className="g-3 align-items-center flex-column flex-md-row"
                    style={{display: "flex", justifyContent: "space-between", alignItems: isMobile ? "center" : "flex-start",}}>
                  <Col style={{flex: "1 1 0%"}}>
                    <Typography variant="subtitle1" style={{ fontFamily: "Didot", fontSize: isMobile ? "18px" : "26px" }} >14:00</Typography>
                    <Typography variant="body2" style={{ fontFamily: "Didot", color: mainTextColor, fontSize: isMobile ? "16px" : "20px" }}>
                      Kungsholms kyrka
                    </Typography>
                    {/* <Typography variant="body2" sx={{ color: "rgb(26 23 20 / 70%)" }}>
                      Ringklockor kl 14.00
                    </Typography> */}
                  </Col>
                  <Col
                    xs={12}
                    sm={5}
                    md="auto"
                    className="ms-md-auto d-flex justify-content-md-end"
                    style={{
                      position: "relative",
                      width: isMobile ? "220px" : "320px",
                      maxWidth: "100%",
                      margin: isMobile ? "0 auto" : undefined,
                      marginTop: isMobile ? "6px" : undefined,
                    }}
                  >
                    <Image
                      src="/kyrkan.webp"
                      alt="Pussbild"
                      width={788}
                      height={596}
                      sizes="(max-width: 600px) 220px, 320px"
                      style={{ width: "100%", height: "auto", display: "block" }}
                    />
                  </Col>
                </Row>
              </Col>
            </Col>
          </Row>


        <Col id="tider" className="py-5">
          <Row className="g-2 mb-3 align-items-baseline">
            <Col style={{alignContent: "right", justifyContent: "right" , textAlign: isMobile ? "center" : "right"}}>
              <Typography variant="h2" style={{ fontFamily: "Didot", color: mainTextColor, fontSize: isMobile ? "46px" : "80px"}}>
                Middag och fest
              </Typography>
            </Col>
          </Row>
          <Row className="g-4">
            <Col md={12}>
              <Col className=" h-100 pb-4 d-flex flex-column gap-4">
                <Row className="g-3 align-items-center flex-column flex-md-row" style={{display: "flex", justifyContent: "space-between", alignItems: isMobile ? "center" : "flex-start"}}>
                  <Col xs={12} sm={5} md="auto" className="order-md-1 order-2 d-flex justify-content-center justify-content-md-start" style={{ margin: isMobile ? "0 auto" : undefined ,
                      marginTop: isMobile ? "6px" : undefined,}}>
                    <Image
                      src="/ladan.webp"
                      alt="Pussbild"
                      width={788}
                      height={596}
                      sizes="(max-width: 600px) 220px, 320px"
                      style={{ width: isMobile ? "220px" : "320px", maxWidth: "100%", height: "auto", display: "block" }}
                    />
                  </Col>
                  <Col md="auto" className="order-md-2 order-1 ms-md-auto text-md-end">
                    <Typography variant="subtitle1" style={{ fontFamily: "Didot" , fontSize: isMobile ? "18px" : "26px"}}>16:30</Typography>
                    <Typography variant="body2" style={{ fontFamily: "Didot", color: mainTextColor , fontSize: isMobile ? "16px" : "20px"}}>
                      Vi samlas på Långängens gård för en fördrink. Mer information kommer!
                      {/* <Link href={"https://maps.app.goo.gl/DGM5ERgLg4qTpQJ17"}>
                        Såhär hittar man hit
                      </Link> */}
                    </Typography>
                    <Typography variant="subtitle1" style={{ fontFamily: "Didot" , fontSize: isMobile ? "18px" : "26px"}}>18:00</Typography>
                    <Typography variant="body2" style={{ fontFamily: "Didot", color: mainTextColor , fontSize: isMobile ? "16px" : "20px"}}>
                      Middag och efterföljande fest.
                    </Typography>
                  </Col>
                </Row>
              </Col>
            </Col>
            </Row>
        </Col>
        </Col>

        <Col as="section" id="toastmasters" className="py-5 mt-5 mb-25" style={{}}>
          <Typography variant="h2" style={{ fontFamily: "Didot", color: mainTextColor, fontSize: isMobile ? "46px" : "60px"}}>
                Toastmasters
          </Typography>
          <Row className="g-4 mt-1">
            <Col md={6}>
              <div ref={idaPartRef} className="p-4 h-100" style={toastmasterPartStyle}>
                <div
                  style={getToastmasterImageStyle("left", idaVisible)}
                >
                  <Image
                    src="/ida.webp"
                    alt="Ida placeholder"
                    width={90}
                    height={90}
                    style={toastmasterPortraitStyle}
                  />
                </div>
                <Typography
                  variant="subtitle1"
                  style={{
                    display: "inline-block",
                    width: "fit-content",
                    fontFamily: "Didot",
                    color: mainTextColor,
                    fontSize: isMobile ? "24px" : "30px",
                  }}
                >
                  Ida Bjarke
                </Typography>
                <Typography variant="body2" sx={{fontFamily: "Didot", color: mainTextColor, marginTop: "0.65rem" }}>
                  <a style={toastmasterLinkStyle}>Ida.bjarke@gmail.com </a>
                </Typography>
                <Typography variant="body2" sx={{fontFamily: "Didot", color: mainTextColor, marginTop: "0.25rem" }}>
                  <a style={toastmasterLinkStyle}>0706459549</a>
                </Typography>
              </div>
            </Col>
            <Col md={6}>
              <div ref={karlPartRef} className="p-4 h-100" style={toastmasterPartStyle}>
                <div
                  style={getToastmasterImageStyle("right", karlVisible)}
                >
                  <Image
                    src="/karl-bild.webp"
                    alt="Karl placeholder"
                    width={90}
                    height={90}
                    style={toastmasterPortraitStyle}
                  />
                </div>
                <Typography
                  variant="subtitle1"
                  style={{
                    display: "inline-block",
                    width: "fit-content",
                    fontFamily: "Didot",
                    color: mainTextColor,
                    fontSize: isMobile ? "24px" : "30px",
                  }}
                >
                  Karl Nygren
                </Typography>
                <Typography variant="body2" sx={{fontFamily: "Didot", color: mainTextColor, marginTop: "0.65rem" }}>
                  <a style={toastmasterLinkStyle}>Kal.nygren@gmail.com</a>
                </Typography>
                <Typography variant="body2" sx={{fontFamily: "Didot", color: mainTextColor, marginTop: "0.25rem" }}>
                  <a style={toastmasterLinkStyle}>0700617107</a>
                </Typography>
              </div>
            </Col>
            
          </Row>
        </Col>

        <Col as="section" id="osa" className="py-5">
          <Typography variant="h2" style={{ fontFamily: "Didot", color: mainTextColor, fontSize: isMobile ? "44px" : "60px"}}>
                OSA
          </Typography>
          <Col sm={6}>
              <Col className=" p-4 d-flex flex-column gap-3 h-100 justify-content-center">
                {/* <Typography variant="overline" style={{ fontFamily: "Didot", color: mainTextColor}}>
                  OSA senast
                </Typography> */}
                <Typography variant="subtitle1" style={{ fontFamily: "Didot"}}>Senast 1 maj</Typography>
                <Typography variant="body2" style={{ fontFamily: "Didot", color: mainTextColor, textAlign: "left"}}>
                  OSA genom att fylla i formuläret nedan eller höra av er till Dennis eller Filippa!  
                </Typography>
                <Typography variant="body2" style={{ fontFamily: "Didot", color: mainTextColor, textAlign: "left"}}>
                  Om du har några frågor, så är det bara att höra av sig antingen till oss eller till våra TMs! 
                </Typography>
              </Col>
            </Col>

          <Row className="g-4">
            <Col sm={6}>
              <RsvpForm />
            </Col>
            
          </Row>
        </Col>

        <Row className="mt-2 g-3 " style={{justifyContent: 'center', textAlign: 'center'}}>
          <Col xs="auto">
            <Link
              href="/brollopsjakten"
              style={{
                display: "inline-flex",
                alignItems: "center",
                border: "0px solid black",
                backgroundColor: "#d64c63",
                color: "white",
                borderRadius: "0.75rem",
                fontWeight: 600,
                fontSize: "0.92rem",
                padding: "0.62rem 1rem",
                textDecoration: "none",
              }}
            >
              Spela Bröllopsjakten
            </Link>
          </Col>
        </Row>
      </Container>
    </Container>
  );
}
