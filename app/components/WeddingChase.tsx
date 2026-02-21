"use client";

import { useEffect, useRef, useState } from "react";

type GameState = "idle" | "running" | "over";

type Obstacle = {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  color: string;
};

const CANVAS_WIDTH = 640;
const CANVAS_HEIGHT = 480;

function intersects(a: { x: number; y: number; width: number; height: number }, b: Obstacle) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

type Props = {
  onFinish?: (score: number) => void;
  onScore?: (score: number) => void;
};

export default function WeddingChase({ onFinish, onScore }: Props = {}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [gameState, setGameState] = useState<GameState>("idle");
  const [runId, setRunId] = useState(0);
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState<string | null>(null);

  const startGame = () => {
    setScore(0);
    setGameState("running");
    setRunId((current) => current + 1);
    setMessage(null);
  };

  useEffect(() => {
    if (gameState !== "running") {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    const player = { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - 70, width: 64, height: 64 };
    const obstacles: Obstacle[] = [];
    const keys = { left: false, right: false };
    let animationFrame: number;
    let lastTime = performance.now();
    let lastSpawn = lastTime;
    let distance = 0;
    let lastScorePublished = 0;
    let running = true;

    const drawScene = () => {
      ctx.fillStyle = "#f6f2ea";
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      ctx.fillStyle = "#d9c7b0";
      ctx.fillRect(0, CANVAS_HEIGHT - 140, CANVAS_WIDTH, 140);

      ctx.fillStyle = "#2f1d16";
      ctx.fillRect(player.x - player.width / 2, player.y - player.height / 2, player.width, player.height);
      ctx.fillStyle = "#f0d3b0";
      ctx.fillRect(player.x - player.width / 2 + 8, player.y - player.height / 2 - 24, 16, 24);
      ctx.fillRect(player.x + player.width / 2 - 24, player.y - player.height / 2 - 24, 16, 24);

      obstacles.forEach((obstacle) => {
        ctx.fillStyle = obstacle.color;
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
      });
    };

    const handlePointer = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      player.x = Math.min(Math.max(x, player.width / 2), CANVAS_WIDTH - player.width / 2);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        keys.left = true;
      }
      if (event.key === "ArrowRight") {
        keys.right = true;
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        keys.left = false;
      }
      if (event.key === "ArrowRight") {
        keys.right = false;
      }
    };

    const spawnObstacle = () => {
      const width = 40 + Math.random() * 40;
      const height = 20 + Math.random() * 20;
      obstacles.push({
        x: Math.random() * (CANVAS_WIDTH - width),
        y: -height,
        width,
        height,
        speed: 110 + Math.random() * 90,
        color: `hsl(${Math.random() * 30}, 60%, ${40 + Math.random() * 20}%)`,
      });
    };

    const concludeGame = () => {
      if (!running) {
        return;
      }

      running = false;
      setGameState("over");
      setMessage("Game over. Try again or submit your score.");
      onFinish?.(lastScorePublished);
    };

    const loop = (currentTime: number) => {
      if (!running) {
        return;
      }

      const delta = currentTime - lastTime;
      lastTime = currentTime;
      distance += delta * 0.03;
      const displayScore = Math.floor(distance / 10);
      if (displayScore !== lastScorePublished) {
        lastScorePublished = displayScore;
        setScore(displayScore);
        onScore?.(displayScore);
      }

      if (currentTime - lastSpawn > 600 + Math.random() * 400) {
        spawnObstacle();
        lastSpawn = currentTime;
      }

      obstacles.forEach((obstacle) => {
        obstacle.y += (obstacle.speed * delta) / 1000;
      });

      for (let i = obstacles.length - 1; i >= 0; i -= 1) {
        const obstacle = obstacles[i];
        if (obstacle.y > CANVAS_HEIGHT) {
          obstacles.splice(i, 1);
        } else if (intersects(player, obstacle)) {
          concludeGame();
          break;
        }
      }

      const moveSpeed = 220;
      let velocity = 0;
      if (keys.left) {
        velocity -= moveSpeed;
      }
      if (keys.right) {
        velocity += moveSpeed;
      }

      player.x = Math.min(
        Math.max(player.x + (velocity * delta) / 1000, player.width / 2),
        CANVAS_WIDTH - player.width / 2,
      );

      drawScene();
      animationFrame = requestAnimationFrame(loop);
    };

    canvas.addEventListener("pointermove", handlePointer);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    animationFrame = requestAnimationFrame(loop);

    return () => {
      running = false;
      cancelAnimationFrame(animationFrame);
      canvas.removeEventListener("pointermove", handlePointer);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [gameState, runId, onFinish, onScore]);

  return (
    <div className="space-y-5">
      <div className="rounded border border-[color:var(--line)]/20 bg-white/90 p-5">
        <div className="relative">
          <canvas ref={canvasRef} className="mx-auto block w-full max-w-[640px]" />
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm uppercase tracking-[0.4em] text-[color:var(--ink)]/60">
            Bröllopsjakten
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
          <p className="font-medium">Poäng: {score}</p>
          <p className="text-[color:var(--ink)]/70">Status: {gameState === "running" ? "Spelar..." : gameState === "over" ? "Avslutad" : "Redo"}</p>
          <button
            type="button"
            onClick={startGame}
            className="rounded border border-black bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#2a2521]"
          >
            {gameState === "running" ? "Startar..." : gameState === "over" ? "Spela igen" : "Spela bröllopsjakten nu"}
          </button>
        </div>
        {message ? <p className="mt-2 text-xs text-[color:var(--ink)]/70">{message}</p> : null}
      </div>
    </div>
  );
}
