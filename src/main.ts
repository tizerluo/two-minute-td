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
  resetGameState,
  updateGameState,
  drawEnemies,
  drawTowers,
  placeTower,
  canPlaceTower,
  startWave,
  GameState,
} from "./game/state";
import { ARROW_TOWER_CONFIG } from "./data/towers";
import { TOTAL_WAVES } from "./data/waves";

const canvas = document.createElement("canvas");
canvas.width = MAP_W;
canvas.height = MAP_H;

const app = document.querySelector("#app");
if (!app) {
  throw new Error("#app not found");
}
app.appendChild(canvas);

function createAriaStatus(id: string, className: string): HTMLDivElement {
  const el = document.createElement("div");
  el.id = id;
  el.className = className;
  el.setAttribute("aria-live", "polite");
  el.style.position = "absolute";
  el.style.width = "1px";
  el.style.height = "1px";
  el.style.padding = "0";
  el.style.margin = "-1px";
  el.style.overflow = "hidden";
  el.style.clip = "rect(0, 0, 0, 0)";
  el.style.whiteSpace = "nowrap";
  el.style.border = "0";
  return el;
}

// Accessible DOM status indicators
const livesElement = createAriaStatus("lives", "lives-text");
const goldElement = createAriaStatus("gold", "gold-text");
const waveElement = createAriaStatus("wave", "wave-text");
const statusElement = createAriaStatus("status", "status-text");

app.appendChild(livesElement);
app.appendChild(goldElement);
app.appendChild(waveElement);
app.appendChild(statusElement);

// Controls container with Restart button
const controlsContainer = document.createElement("div");
controlsContainer.className = "game-controls";

const restartBtn = document.createElement("button");
restartBtn.id = "restart";
restartBtn.className = "restart-btn";
restartBtn.textContent = "Restart (R)";
restartBtn.addEventListener("click", () => {
  resetGameState(gameState);
});
controlsContainer.appendChild(restartBtn);
app.appendChild(controlsContainer);

const ctx = canvas.getContext("2d");
if (!ctx) {
  throw new Error("2d context unavailable");
}

export const gameState: GameState = createGameState();

// Expose for testing or inspection
interface WindowWithGame {
  gameState: GameState;
  placeTower: (col: number, row: number) => unknown;
  resetGameState: (state?: GameState) => void;
  restartGame: (state?: GameState) => void;
  startWave: (state?: GameState) => void;
}

const win = window as unknown as WindowWithGame;
win.gameState = gameState;
win.placeTower = (col: number, row: number) => placeTower(gameState, col, row);
win.resetGameState = () => resetGameState(gameState);
win.restartGame = () => resetGameState(gameState);
win.startWave = () => startWave(gameState);

let hoverCell: Cell | null = null;

canvas.addEventListener("mousemove", (event: MouseEvent) => {
  if (gameState.gameOver) {
    hoverCell = null;
    return;
  }
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
  if (gameState.gameOver) {
    resetGameState(gameState);
    return;
  }
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const clickX = (event.clientX - rect.left) * scaleX;
  const clickY = (event.clientY - rect.top) * scaleY;
  const cell = worldToCell(clickX, clickY);
  if (!cell) return;
  placeTower(gameState, cell.col, cell.row);
});

window.addEventListener("keydown", (event: KeyboardEvent) => {
  if (event.key === "r" || event.key === "R") {
    resetGameState(gameState);
  } else if (event.code === "Space" && gameState.status === "build") {
    startWave(gameState);
  }
});

let lastTime: number | null = null;

function frame(time: number): void {
  if (lastTime === null) {
    lastTime = time;
  }
  const dt = Math.min((time - lastTime) / 1000, 0.1);
  lastTime = time;

  updateGameState(gameState, dt);

  // Sync DOM representations
  livesElement.textContent = `Lives: ${gameState.lives}`;
  canvas.setAttribute("data-lives", String(gameState.lives));

  goldElement.textContent = `Gold: ${gameState.gold}`;
  canvas.setAttribute("data-gold", String(gameState.gold));

  waveElement.textContent = `Wave: ${gameState.wave}/${gameState.totalWaves}`;
  canvas.setAttribute("data-wave", String(gameState.wave));

  statusElement.textContent = gameState.status;
  canvas.setAttribute("data-status", gameState.status);
  canvas.setAttribute("data-game-over", String(gameState.gameOver));
  canvas.setAttribute("data-won", String(gameState.isWon));

  drawMap(ctx!);

  // Hover placement indicator
  if (!gameState.gameOver && hoverCell && canPlaceTower(gameState, hoverCell.col, hoverCell.row)) {
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
    !gameState.gameOver &&
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

  // Top Bar HUD Overlay: Title
  ctx!.fillStyle = "rgba(233, 69, 96, 0.85)";
  ctx!.font = "18px system-ui, sans-serif";
  ctx!.textAlign = "left";
  ctx!.textBaseline = "top";
  ctx!.fillText("Two-Minute TD", 10, 8);

  // Top Bar HUD Overlay: Wave HUD (Center)
  ctx!.fillStyle = "#48cae4";
  ctx!.font = "bold 18px system-ui, sans-serif";
  ctx!.textAlign = "center";
  ctx!.textBaseline = "top";

  if (gameState.status === "build") {
    const remaining = Math.max(0, Math.ceil(gameState.buildTimer));
    ctx!.fillText(`Wave ${gameState.wave}/${gameState.totalWaves} (Starts in ${remaining}s)`, MAP_W / 2, 8);
  } else if (gameState.status === "won") {
    ctx!.fillStyle = "#2ecc71";
    ctx!.fillText(`Wave ${TOTAL_WAVES}/${TOTAL_WAVES} Cleared!`, MAP_W / 2, 8);
  } else {
    ctx!.fillText(`Wave ${gameState.wave}/${gameState.totalWaves}`, MAP_W / 2, 8);
  }

  // Top Bar HUD Overlay: Gold
  ctx!.fillStyle = "#ffd166";
  ctx!.font = "bold 18px system-ui, sans-serif";
  ctx!.textAlign = "right";
  ctx!.textBaseline = "top";
  ctx!.fillText(`Gold: ${gameState.gold}`, MAP_W - 120, 8);

  // Top Bar HUD Overlay: Lives
  ctx!.fillStyle = "#f1faee";
  ctx!.font = "bold 18px system-ui, sans-serif";
  ctx!.textAlign = "right";
  ctx!.textBaseline = "top";
  ctx!.fillText(`Lives: ${gameState.lives}`, MAP_W - 12, 8);

  // Win / Lose Overlays
  if (gameState.isLost || gameState.lives <= 0) {
    ctx!.save();
    ctx!.fillStyle = "rgba(15, 10, 25, 0.75)";
    ctx!.fillRect(0, 0, MAP_W, MAP_H);

    ctx!.fillStyle = "rgba(231, 76, 60, 0.95)";
    ctx!.font = "bold 36px system-ui, sans-serif";
    ctx!.textAlign = "center";
    ctx!.textBaseline = "middle";
    ctx!.fillText("GAME OVER", MAP_W / 2, MAP_H / 2 - 20);

    ctx!.fillStyle = "#f1faee";
    ctx!.font = "16px system-ui, sans-serif";
    ctx!.fillText("Press R or Click to Restart", MAP_W / 2, MAP_H / 2 + 25);
    ctx!.restore();
  } else if (gameState.isWon) {
    ctx!.save();
    ctx!.fillStyle = "rgba(10, 25, 20, 0.75)";
    ctx!.fillRect(0, 0, MAP_W, MAP_H);

    ctx!.fillStyle = "#2ecc71";
    ctx!.font = "bold 36px system-ui, sans-serif";
    ctx!.textAlign = "center";
    ctx!.textBaseline = "middle";
    ctx!.fillText("VICTORY!", MAP_W / 2, MAP_H / 2 - 20);

    ctx!.fillStyle = "#ffd166";
    ctx!.font = "bold 18px system-ui, sans-serif";
    ctx!.fillText("All waves cleared!", MAP_W / 2, MAP_H / 2 + 15);

    ctx!.fillStyle = "#f1faee";
    ctx!.font = "16px system-ui, sans-serif";
    ctx!.fillText("Press R or Click to Restart", MAP_W / 2, MAP_H / 2 + 45);
    ctx!.restore();
  }

  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
