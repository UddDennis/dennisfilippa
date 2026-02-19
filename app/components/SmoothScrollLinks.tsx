"use client";

import { useCallback } from "react";
import { Col, Row } from "react-bootstrap";

type SmoothScrollLink = {
  label: string;
  targetId: string;
};

type SmoothScrollLinksProps = {
  links: SmoothScrollLink[];
  className?: string;
  linkClassName?: string;
  durationMs?: number;
};

const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function SmoothScrollLinks({
  links,
  className,
  linkClassName,
  durationMs = 900,
}: SmoothScrollLinksProps) {
  const handleScroll = useCallback(
    (targetId: string) => {
      const target = document.getElementById(targetId);
      if (!target) return;

      if (prefersReducedMotion()) {
        target.scrollIntoView({ behavior: "auto" });
        return;
      }

      const startY = window.scrollY;
      const targetY = target.getBoundingClientRect().top + window.scrollY;
      const distance = targetY - startY;
      let startTime: number | null = null;

      const step = (timestamp: number) => {
        if (startTime === null) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / durationMs, 1);
        const eased = easeInOutCubic(progress);

        window.scrollTo(0, startY + distance * eased);

        if (progress < 1) {
          requestAnimationFrame(step);
        }
      };

      requestAnimationFrame(step);
    },
    [durationMs]
  );

  return (
    <Row className={["g-3", className].filter(Boolean).join(" ")}>
      {links.map((link) => (
        <Col key={link.targetId} xs="auto">
          <button
            type="button"
            onClick={() => handleScroll(link.targetId)}
            className={linkClassName}
          >
            {link.label}
          </button>
        </Col>
      ))}
    </Row>
  );
}
