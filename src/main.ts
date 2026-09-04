import "./styles.css";
import { drawMap, MAP_H, MAP_W } from "./game/map";
import {
  createGameState,
  updateGameState,
  drawEnemies,
  GameState,
} from "./game/state";

const canvas = document.createElement("canvas");
canvas.width = MAP_W;
canvas.height = MAP_H;

const app = document.querySelector("#app");
if (!app) {
  throw new Error("#app not found");
}
app.appendChild(canvas);

// Accessible DOM status indicator for lives
const livesElement = document.createElement("div");
livesElement.id = "lives";
livesElement.className = "lives-text";
livesElement.setAttribute("aria-live", "polite");
// Visually hidden so it doesn't duplicate the canvas overlay text
livesElement.style.position = "absolute";
livesElement.style.width = "1px";
livesElement.style.height = "1px";
livesElement.style.padding = "0";
livesElement.style.margin = "-1px";
livesElement.style.overflow = "hidden";
livesElement.style.clip = "rect(0, 0, 0, 0)";
livesElement.style.whiteSpace = "nowrap";
livesElement.style.border = "0";
app.appendChild(livesElement);

const ctx = canvas.getContext("2d");
if (!ctx) {
  throw new Error("2d context unavailable");
}

export const gameState: GameState = createGameState();
// Expose for testing or inspection
(window as unknown as { gameState: GameState }).gameState = gameState;

let lastTime: number | null = null;

function frame(time: number): void {
  if (lastTime === null) {
    lastTime = time;
  }
  const dt = Math.min((time - lastTime) / 1000, 0.1);
  lastTime = time;

  updateGameState(gameState, dt);

  // Sync DOM representation
  livesElement.textContent = `Lives: ${gameState.lives}`;
  canvas.setAttribute("data-lives", String(gameState.lives));

  drawMap(ctx!);
  drawEnemies(ctx!, gameState);

  // Light title overlay (does not obscure the map much)
  ctx!.fillStyle = "rgba(233, 69, 96, 0.85)";
  ctx!.font = "18px system-ui, sans-serif";
  ctx!.textAlign = "left";
  ctx!.textBaseline = "top";
  ctx!.fillText("Two-Minute TD", 10, 8);

  // Lives text overlay
  ctx!.fillStyle = "#f1faee";
  ctx!.font = "bold 18px system-ui, sans-serif";
  ctx!.textAlign = "right";
  ctx!.textBaseline = "top";
  ctx!.fillText(`Lives: ${gameState.lives}`, MAP_W - 12, 8);

  if (gameState.lives <= 0) {
    ctx!.fillStyle = "rgba(231, 76, 60, 0.9)";
    ctx!.font = "bold 32px system-ui, sans-serif";
    ctx!.textAlign = "center";
    ctx!.textBaseline = "middle";
    ctx!.fillText("GAME OVER", MAP_W / 2, MAP_H / 2);
  }

  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
