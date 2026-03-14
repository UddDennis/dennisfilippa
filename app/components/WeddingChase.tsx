"use client";

import { CSSProperties, useEffect, useRef, useState } from "react";

type GameState = "idle" | "running" | "over";

type Obstacle = {
  kind: "danger" | "bonus";
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  sprite: HTMLImageElement;
};

type PlayerPart = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

const CANVAS_WIDTH = 640;
const CANVAS_HEIGHT = 480;
const PLAYER_PART_WIDTH = 64;
const PLAYER_PART_HEIGHT = 80;
const PLAYER_PART_GAP = 10;
const PLAYER_SWING_MAX_RAD = Math.PI / 18; // ~10deg
const PLAYER_SWING_SPEED = 0.006;
const OBSTACLE_SIZE = 56;
const PLAYER_HITBOX_PAD_X = 5;
const PLAYER_HITBOX_PAD_Y = 8;
const OBSTACLE_HITBOX_PAD_X = 8;
const OBSTACLE_HITBOX_PAD_Y = 8;
const PLAYER_LEFT_SPRITE_PATH = "/filippa.webp";
const PLAYER_RIGHT_SPRITE_PATH = "/dennis.webp";
const BONUS_SPRITE_PATH = "/ring.webp";
const DANGER_SPRITE_PATHS = [
  "/animal.webp",
  "/banana.webp",
  "/foot-ball.webp",
  "/wet-floor.webp",
];
const BONUS_SPAWN_CHANCE = 0.18;

const frameStyle: CSSProperties = {
  width: "100%",
  maxWidth: "640px",
  margin: "0 auto",
  overflow: "hidden",
  border: "1px solid rgb(26 23 20 / 35%)",
  borderRadius: 0,
  backgroundColor: "#faf8f4",
  position: "relative",
};

const scoreStyle: CSSProperties = {
  pointerEvents: "none",
  position: "absolute",
  top: "0.75rem",
  left: "0.75rem",
  borderRadius: "0.4rem",
  backgroundColor: "rgb(26 23 20 / 80%)",
  color: "white",
  fontSize: "0.72rem",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.12em",
  padding: "0.25rem 0.5rem",
};

const buttonStyle: CSSProperties = {
  border: "0px solid transparent",
  borderRadius: "0.5rem",
  backgroundColor: "#d64c63",
  color: "white",
  fontWeight: 600,
  fontSize: "0.92rem",
  padding: "0.45rem 0.95rem",
  transition: "background-color 160ms ease",
  outline: "none",
  WebkitTapHighlightColor: "transparent",
};

const messageStyle: CSSProperties = {
  color: "rgb(26 23 20 / 70%)",
  fontSize: "0.8rem",
  margin: 0,
};

const buttonOverlayStyle: CSSProperties = {
  position: "absolute",
  inset: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  pointerEvents: "none",
};

const rootStyle: CSSProperties = {
  userSelect: "none",
  WebkitUserSelect: "none",
  WebkitTapHighlightColor: "transparent",
};

function insetRect(rect: Rect, padX: number, padY: number): Rect {
  return {
    x: rect.x + padX,
    y: rect.y + padY,
    width: Math.max(1, rect.width - padX * 2),
    height: Math.max(1, rect.height - padY * 2),
  };
}

function intersects(a: Rect, b: Rect) {
  const aRight = a.x + a.width;
  const aBottom = a.y + a.height;

  return (
    a.x < b.x + b.width &&
    aRight > b.x &&
    a.y < b.y + b.height &&
    aBottom > b.y
  );
}

function getPlayerParts(player: { x: number; y: number }) {
  const left: PlayerPart = {
    x: player.x - PLAYER_PART_GAP / 2 - PLAYER_PART_WIDTH,
    y: player.y - PLAYER_PART_HEIGHT / 2,
    width: PLAYER_PART_WIDTH,
    height: PLAYER_PART_HEIGHT,
  };

  const right: PlayerPart = {
    x: player.x + PLAYER_PART_GAP / 2,
    y: player.y - PLAYER_PART_HEIGHT / 2,
    width: PLAYER_PART_WIDTH,
    height: PLAYER_PART_HEIGHT,
  };

  return { left, right };
}

function drawRotatedSprite(
  ctx: CanvasRenderingContext2D,
  sprite: HTMLImageElement,
  part: PlayerPart,
  angleRad: number,
) {
  const centerX = part.x + part.width / 2;
  const centerY = part.y + part.height / 2;

  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.rotate(angleRad);

  if (sprite.complete && sprite.naturalWidth > 0) {
    ctx.drawImage(sprite, -part.width / 2, -part.height / 2, part.width, part.height);
  } else {
    ctx.fillStyle = "#2f1d16";
    ctx.fillRect(-part.width / 2, -part.height / 2, part.width, part.height);
  }

  ctx.restore();
}

function getDifficultyFactor(score: number) {
  return Math.min(3, 1 + score * 0.04);
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Could not load sprite: ${src}`));
    image.src = src;
  });
}

type Props = {
  onFinish?: (score: number) => void;
  onScore?: (score: number) => void;
};

export default function WeddingChase({ onFinish, onScore }: Props = {}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const spritesRef = useRef<{
    playerLeft: HTMLImageElement;
    playerRight: HTMLImageElement;
    danger: HTMLImageElement[];
    bonus: HTMLImageElement;
  } | null>(null);
  const [gameState, setGameState] = useState<GameState>("idle");
  const [isLoadingSprites, setIsLoadingSprites] = useState(true);
  const [runId, setRunId] = useState(0);
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    const preloadSprites = async () => {
      try {
        const [playerLeft, playerRight, bonus, ...danger] = await Promise.all([
          loadImage(PLAYER_LEFT_SPRITE_PATH),
          loadImage(PLAYER_RIGHT_SPRITE_PATH),
          loadImage(BONUS_SPRITE_PATH),
          ...DANGER_SPRITE_PATHS.map((src) => loadImage(src)),
        ]);

        if (isCancelled) {
          return;
        }

        spritesRef.current = {
          playerLeft,
          playerRight,
          danger,
          bonus,
        };
        setIsLoadingSprites(false);
      } catch {
        if (isCancelled) {
          return;
        }
        setIsLoadingSprites(false);
        setMessage("Kunde inte ladda spelets bilder. Ladda om sidan och prova igen.");
      }
    };

    void preloadSprites();

    return () => {
      isCancelled = true;
    };
  }, []);

  const startGame = () => {
    if (!spritesRef.current || isLoadingSprites) {
      setMessage("Laddar spelets bilder...");
      return;
    }
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

    const sprites = spritesRef.current;
    if (!sprites) {
      return;
    }

    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    const player = { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - 70 };
    const obstacles: Obstacle[] = [];
    const keys = { left: false, right: false };
    const touchKeys = { left: false, right: false };
    let activeTouchPointerId: number | null = null;
    let animationFrame: number;
    let lastTime = performance.now();
    let lastSpawn = lastTime;
    let latestScore = 0;
    let running = true;

    const drawScene = (timeMs: number) => {
      ctx.fillStyle = "#faf8f4";
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      const playerParts = getPlayerParts(player);
      const swing = Math.sin(timeMs * PLAYER_SWING_SPEED) * PLAYER_SWING_MAX_RAD;
      drawRotatedSprite(ctx, sprites.playerLeft, playerParts.left, -swing);
      drawRotatedSprite(ctx, sprites.playerRight, playerParts.right, swing);

      obstacles.forEach((obstacle) => {
        if (obstacle.sprite.complete && obstacle.sprite.naturalWidth > 0) {
          ctx.drawImage(obstacle.sprite, obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        } else {
          ctx.fillStyle = obstacle.kind === "bonus" ? "#d4a20b" : "#5d3426";
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
      const isBonus = Math.random() < BONUS_SPAWN_CHANCE;
      const difficulty = getDifficultyFactor(latestScore);
      const sprite = isBonus
        ? sprites.bonus
        : sprites.danger[Math.floor(Math.random() * sprites.danger.length)];

      obstacles.push({
        kind: isBonus ? "bonus" : "danger",
        x: Math.random() * (CANVAS_WIDTH - OBSTACLE_SIZE),
        y: -OBSTACLE_SIZE,
        width: OBSTACLE_SIZE,
        height: OBSTACLE_SIZE,
        speed: (110 + Math.random() * 90) * difficulty,
        sprite,
      });
    };

    const concludeGame = () => {
      if (!running) {
        return;
      }

      running = false;
      setGameState("over");
      setMessage("Du förlorade tyvärr. Försök igen eller spara dina poäng");
      onFinish?.(latestScore);
    };

    const loop = (currentTime: number) => {
      if (!running) {
        return;
      }

      const delta = currentTime - lastTime;
      lastTime = currentTime;

      const spawnBase = Math.max(260, 680 - latestScore * 10);
      const spawnJitter = Math.max(150, 450 - latestScore * 6);
      if (currentTime - lastSpawn > spawnBase + Math.random() * spawnJitter) {
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
          if (obstacle.kind === "danger") {
            latestScore += 1;
            setScore(latestScore);
            onScore?.(latestScore);
          }
        } else {
          const playerParts = getPlayerParts(player);
          const obstacleHitbox = insetRect(obstacle, OBSTACLE_HITBOX_PAD_X, OBSTACLE_HITBOX_PAD_Y);
          const leftHitbox = insetRect(playerParts.left, PLAYER_HITBOX_PAD_X, PLAYER_HITBOX_PAD_Y);
          const rightHitbox = insetRect(playerParts.right, PLAYER_HITBOX_PAD_X, PLAYER_HITBOX_PAD_Y);
          if (intersects(leftHitbox, obstacleHitbox) || intersects(rightHitbox, obstacleHitbox)) {
            if (obstacle.kind === "bonus") {
              obstacles.splice(i, 1);
              latestScore += 5;
              setScore(latestScore);
              onScore?.(latestScore);
            } else {
              concludeGame();
              break;
            }
          }
        }
      }

      const moveSpeed = 300;
      let velocity = 0;
      if (keys.left || touchKeys.left) {
        velocity -= moveSpeed;
      }
      if (keys.right || touchKeys.right) {
        velocity += moveSpeed;
      }

      const playerTotalWidth = PLAYER_PART_WIDTH * 2 + PLAYER_PART_GAP;
      player.x = Math.min(
        Math.max(player.x + (velocity * delta) / 1000, playerTotalWidth / 2),
        CANVAS_WIDTH - playerTotalWidth / 2,
      );

      drawScene(currentTime);
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
    <div className="d-flex flex-column gap-3" style={rootStyle}>
      <div style={frameStyle}>
        <canvas ref={canvasRef} className="d-block w-100" style={{ touchAction: "none" }} />
        <div style={scoreStyle}>Poäng: {score}</div>

        {gameState !== "running" ? (
          <div style={buttonOverlayStyle}>
            <button
              type="button"
              onClick={startGame}
              disabled={isLoadingSprites || !spritesRef.current}
              style={{ ...buttonStyle, pointerEvents: "auto" }}
              onMouseDown={(event) => {
                event.preventDefault();
                event.currentTarget.blur();
              }}
              onPointerUp={(event) => {
                event.currentTarget.blur();
              }}
            >
              {isLoadingSprites
                ? "Laddar bilder..."
                : gameState === "over"
                  ? "Spela igen"
                  : "Starta spel"}
            </button>
          </div>
        ) : null}
      </div>

      {message ? <p style={messageStyle}>{message}</p> : null}
    </div>
  );
}
