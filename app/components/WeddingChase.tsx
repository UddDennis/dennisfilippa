"use client";

import { useEffect, useRef, useState } from "react";

type GameState = "idle" | "running" | "over";

type Obstacle = {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  sprite: HTMLImageElement;
};

const CANVAS_WIDTH = 640;
const CANVAS_HEIGHT = 480;

function intersects(a: { x: number; y: number; width: number; height: number }, b: Obstacle) {
  const aLeft = a.x - a.width / 2;
  const aTop = a.y - a.height / 2;
  const aRight = aLeft + a.width;
  const aBottom = aTop + a.height;

  return (
    aLeft < b.x + b.width &&
    aRight > b.x &&
    aTop < b.y + b.height &&
    aBottom > b.y
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
    const touchKeys = { left: false, right: false };
    let activeTouchPointerId: number | null = null;
    let animationFrame: number;
    let lastTime = performance.now();
    let lastSpawn = lastTime;
    let latestScore = 0;
    let running = true;

    const playerSprite = new Image();
    playerSprite.src = "/sprites/player-couple-placeholder.svg";
    const obstacleSprites = [
      "/sprites/obstacle-1-placeholder.svg",
      "/sprites/obstacle-2-placeholder.svg",
      "/sprites/obstacle-3-placeholder.svg",
    ].map((src) => {
      const image = new Image();
      image.src = src;
      return image;
    });

    const drawScene = () => {
      ctx.fillStyle = "#f6f2ea";
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      ctx.fillStyle = "#d9c7b0";
      ctx.fillRect(0, CANVAS_HEIGHT - 140, CANVAS_WIDTH, 140);

      if (playerSprite.complete && playerSprite.naturalWidth > 0) {
        ctx.drawImage(
          playerSprite,
          player.x - player.width / 2,
          player.y - player.height / 2,
          player.width,
          player.height,
        );
      } else {
        ctx.fillStyle = "#2f1d16";
        ctx.fillRect(player.x - player.width / 2, player.y - player.height / 2, player.width, player.height);
      }

      obstacles.forEach((obstacle) => {
        if (obstacle.sprite.complete && obstacle.sprite.naturalWidth > 0) {
          ctx.drawImage(obstacle.sprite, obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        } else {
          ctx.fillStyle = "#5d3426";
          ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        }
      });
    };

    const updateTouchDirection = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const relativeX = ((event.clientX - rect.left) / rect.width) * CANVAS_WIDTH;
      const steerLeft = relativeX < CANVAS_WIDTH / 2;
      touchKeys.left = steerLeft;
      touchKeys.right = !steerLeft;
    };

    const clearTouchDirection = () => {
      touchKeys.left = false;
      touchKeys.right = false;
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (event.pointerType !== "touch") {
        return;
      }
      activeTouchPointerId = event.pointerId;
      updateTouchDirection(event);
      event.preventDefault();
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType !== "touch" || activeTouchPointerId !== event.pointerId) {
        return;
      }
      updateTouchDirection(event);
      event.preventDefault();
    };

    const handlePointerUp = (event: PointerEvent) => {
      if (event.pointerType !== "touch" || activeTouchPointerId !== event.pointerId) {
        return;
      }
      activeTouchPointerId = null;
      clearTouchDirection();
      event.preventDefault();
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
      const width = 44 + Math.random() * 30;
      const height = 44 + Math.random() * 30;
      const sprite = obstacleSprites[Math.floor(Math.random() * obstacleSprites.length)];
      obstacles.push({
        x: Math.random() * (CANVAS_WIDTH - width),
        y: -height,
        width,
        height,
        speed: 110 + Math.random() * 90,
        sprite,
      });
    };

    const concludeGame = () => {
      if (!running) {
        return;
      }

      running = false;
      setGameState("over");
      setMessage("Game over. Try again or submit your score.");
      onFinish?.(latestScore);
    };

    const loop = (currentTime: number) => {
      if (!running) {
        return;
      }

      const delta = currentTime - lastTime;
      lastTime = currentTime;

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
          latestScore += 1;
          setScore(latestScore);
          onScore?.(latestScore);
        } else if (intersects(player, obstacle)) {
          concludeGame();
          break;
        }
      }

      const moveSpeed = 220;
      let velocity = 0;
      if (keys.left || touchKeys.left) {
        velocity -= moveSpeed;
      }
      if (keys.right || touchKeys.right) {
        velocity += moveSpeed;
      }

      player.x = Math.min(
        Math.max(player.x + (velocity * delta) / 1000, player.width / 2),
        CANVAS_WIDTH - player.width / 2,
      );

      drawScene();
      animationFrame = requestAnimationFrame(loop);
    };

    canvas.addEventListener("pointerdown", handlePointerDown, { passive: false });
    canvas.addEventListener("pointermove", handlePointerMove, { passive: false });
    canvas.addEventListener("pointerup", handlePointerUp, { passive: false });
    canvas.addEventListener("pointercancel", handlePointerUp, { passive: false });
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    animationFrame = requestAnimationFrame(loop);

    return () => {
      running = false;
      cancelAnimationFrame(animationFrame);
      canvas.removeEventListener("pointerdown", handlePointerDown);
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerup", handlePointerUp);
      canvas.removeEventListener("pointercancel", handlePointerUp);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [gameState, runId, onFinish, onScore]);

  return (
    <div className="space-y-3">
      <div className="relative mx-auto w-full max-w-[640px] overflow-hidden rounded border border-black/40 bg-[#f6f2ea]">
        <canvas ref={canvasRef} className="block w-full touch-none" />
        <div className="pointer-events-none absolute left-3 top-3 rounded bg-black/70 px-2 py-1 text-xs font-medium uppercase tracking-[0.15em] text-white">
          Poäng: {score}
        </div>
      </div>
      <div className="mx-auto flex w-full max-w-[640px] flex-col items-start gap-2">
        <button
          type="button"
          onClick={startGame}
          className="rounded border border-black bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#2a2521]"
        >
          {gameState === "running" ? "Startar..." : gameState === "over" ? "Spela igen" : "Spela bröllopsjakten nu"}
        </button>
        {message ? <p className="text-xs text-[color:var(--ink)]/70">{message}</p> : null}
      </div>
    </div>
  );
}
