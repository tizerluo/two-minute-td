import "./styles.css";
import {
  drawMap,
  MAP_H,
  MAP_W,
  worldToCell,
  cellCenter,
  CELL,
  isBuildable,
  Cell,
} from "./game/map";
import {
  createGameState,
  updateGameState,
  drawEnemies,
  drawTowers,
  placeTower,
  canPlaceTower,
  GameState,
} from "./game/state";
import { ARROW_TOWER_CONFIG } from "./data/towers";

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

// Accessible DOM status indicator for gold
const goldElement = document.createElement("div");
goldElement.id = "gold";
goldElement.className = "gold-text";
goldElement.setAttribute("aria-live", "polite");
goldElement.style.position = "absolute";
goldElement.style.width = "1px";
goldElement.style.height = "1px";
goldElement.style.padding = "0";
goldElement.style.margin = "-1px";
goldElement.style.overflow = "hidden";
goldElement.style.clip = "rect(0, 0, 0, 0)";
goldElement.style.whiteSpace = "nowrap";
goldElement.style.border = "0";
app.appendChild(goldElement);

const ctx = canvas.getContext("2d");
if (!ctx) {
  throw new Error("2d context unavailable");
}

export const gameState: GameState = createGameState();
// Expose for testing or inspection
(
  window as unknown as {
    gameState: GameState;
    placeTower: (col: number, row: number) => unknown;
  }
).gameState = gameState;
(
  window as unknown as {
    gameState: GameState;
    placeTower: (col: number, row: number) => unknown;
  }
).placeTower = (col: number, row: number) => placeTower(gameState, col, row);

let hoverCell: Cell | null = null;

canvas.addEventListener("mousemove", (event: MouseEvent) => {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const x = (event.clientX - rect.left) * scaleX;
  const y = (event.clientY - rect.top) * scaleY;
  hoverCell = worldToCell(x, y);
});

canvas.addEventListener("mouseleave", () => {
  hoverCell = null;
});

canvas.addEventListener("click", (event: MouseEvent) => {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const clickX = (event.clientX - rect.left) * scaleX;
  const clickY = (event.clientY - rect.top) * scaleY;
  const cell = worldToCell(clickX, clickY);
  if (!cell) return;
  placeTower(gameState, cell.col, cell.row);
});

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
  goldElement.textContent = `Gold: ${gameState.gold}`;
  canvas.setAttribute("data-gold", String(gameState.gold));

  drawMap(ctx!);

  // Hover placement indicator
  if (hoverCell && canPlaceTower(gameState, hoverCell.col, hoverCell.row)) {
    const center = cellCenter(hoverCell);
    ctx!.save();
    ctx!.beginPath();
    ctx!.arc(center.x, center.y, ARROW_TOWER_CONFIG.range * CELL, 0, Math.PI * 2);
    ctx!.fillStyle = "rgba(233, 196, 106, 0.08)";
    ctx!.fill();
    ctx!.strokeStyle = "rgba(233, 196, 106, 0.4)";
    ctx!.lineWidth = 1.5;
    ctx!.setLineDash([4, 4]);
    ctx!.stroke();

    ctx!.fillStyle = "rgba(233, 196, 106, 0.25)";
    ctx!.fillRect(hoverCell.col * CELL, hoverCell.row * CELL, CELL, CELL);
    ctx!.restore();
  } else if (
    hoverCell &&
    isBuildable(hoverCell.col, hoverCell.row) &&
    !gameState.towers.some((t) => t.col === hoverCell!.col && t.row === hoverCell!.row)
  ) {
    ctx!.save();
    ctx!.fillStyle = "rgba(231, 76, 60, 0.2)";
    ctx!.fillRect(hoverCell.col * CELL, hoverCell.row * CELL, CELL, CELL);
    ctx!.restore();
  }

  drawTowers(ctx!, gameState);
  drawEnemies(ctx!, gameState);

  // Light title overlay (does not obscure the map much)
  ctx!.fillStyle = "rgba(233, 69, 96, 0.85)";
  ctx!.font = "18px system-ui, sans-serif";
  ctx!.textAlign = "left";
  ctx!.textBaseline = "top";
  ctx!.fillText("Two-Minute TD", 10, 8);

  // Gold text overlay
  ctx!.fillStyle = "#ffd166";
  ctx!.font = "bold 18px system-ui, sans-serif";
  ctx!.textAlign = "right";
  ctx!.textBaseline = "top";
  ctx!.fillText(`Gold: ${gameState.gold}`, MAP_W - 120, 8);

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

