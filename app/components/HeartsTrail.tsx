"use client";

import { CSSProperties, useEffect, useRef, useState } from "react";

type Heart = {
  id: number;
  x: number;
  y: number;
  size: number;
  rotate: number;
  duration: number;
  hue: number;
  driftX: number;
  driftY: number;
};

const SPAWN_INTERVAL_MS = 65;
const MAX_HEARTS = 70;

export default function HeartsTrail() {
  const [hearts, setHearts] = useState<Heart[]>([]);
  const lastSpawn = useRef(0);
  const idRef = useRef(0);
  const timers = useRef<number[]>([]);
  const prefersReducedMotion = useRef(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    prefersReducedMotion.current = mediaQuery.matches;

    const onMotionChange = (event: MediaQueryListEvent) => {
      prefersReducedMotion.current = event.matches;
      if (event.matches) {
        setHearts([]);
      }
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", onMotionChange);
    } else {
      mediaQuery.addListener(onMotionChange);
    }

    const spawn = (x: number, y: number) => {
      if (prefersReducedMotion.current) {
        return;
      }
      if (!Number.isFinite(x) || !Number.isFinite(y)) {
        return;
      }
      const now = Date.now();
      if (now - lastSpawn.current < SPAWN_INTERVAL_MS) {
        return;
      }
      lastSpawn.current = now;

      idRef.current += 1;
      const id = idRef.current;
      const duration = 900 + Math.floor(Math.random() * 600);

      const heart: Heart = {
        id,
        x,
        y,
        size: 10 + Math.floor(Math.random() * 10),
        rotate: -25 + Math.floor(Math.random() * 50),
        duration,
        hue: 340 + Math.floor(Math.random() * 20),
        driftX: -18 + Math.floor(Math.random() * 36),
        driftY: 95 + Math.floor(Math.random() * 70),
      };

      setHearts((prev) => {
        const next = [...prev, heart];
        if (next.length > MAX_HEARTS) {
          return next.slice(next.length - MAX_HEARTS);
        }
        return next;
      });

      const timer = window.setTimeout(() => {
        setHearts((prev) => prev.filter((item) => item.id !== id));
      }, duration + 120);
      timers.current.push(timer);
    };

    const handleMouseMove = (event: MouseEvent) => {
      spawn(event.clientX, event.clientY);
    };

    const handleTouchStart = (event: TouchEvent) => {
      const point = event.touches[0];
      if (!point) return;
      spawn(point.clientX, point.clientY);
    };

    const handleTouchMove = (event: TouchEvent) => {
      const point = event.touches[0];
      if (!point) return;
      spawn(point.clientX, point.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", onMotionChange);
      } else {
        mediaQuery.removeListener(onMotionChange);
      }
      timers.current.forEach((timer) => window.clearTimeout(timer));
      timers.current = [];
    };
  }, []);

  return (
    <div className="heart-layer" aria-hidden="true">
      {hearts.map((heart) => (
        <span
          key={heart.id}
          className="heart-particle"
          style={{
            left: `${heart.x}px`,
            top: `${heart.y}px`,
          }}
        >
          <span
            className="heart-glyph"
            style={
              {
                fontSize: `${heart.size}px`,
                transform: `rotate(${heart.rotate}deg)`,
                animationDuration: `${heart.duration}ms`,
                color: `hsl(${heart.hue}deg 88% 58%)`,
                "--heart-drift-x": `${heart.driftX}px`,
                "--heart-drift-y": `${heart.driftY}px`,
              } as CSSProperties
            }
          >
            ♥
          </span>
        </span>
      ))}
    </div>
  );
}
