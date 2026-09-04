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
  waveScheduler,
  spawnGrunt,
  spawnRunner,
  spawnTank,
  spawnEnemy,
  handleEnemyLeak,
  calculateDamage,
  damageEnemy,
  applyDamage,
  applySplashDamage,
  applySlow,
  clearSlow,
  placeArrowTower,
  placeCannonTower,
  placeIceTower,
  placeCannon,
  placeArrow,
  placeIce,
  GameState,
} from "./game/state";
import { Enemy } from "./game/enemy";
import {
  ENEMY_CONFIGS,
  GRUNT_CONFIG,
  RUNNER_CONFIG,
  TANK_CONFIG,
  getEnemyConfig,
} from "./data/enemies";
import {
  ARROW_TOWER_CONFIG,
  CANNON_TOWER_CONFIG,
  CANNON_CONFIG,
  ICE_TOWER_CONFIG,
  ICE_CONFIG,
  TOWER_CONFIGS,
  TOWERS,
  TowerConfig,
  getTowerConfig,
} from "./data/towers";
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

// Controls container with Build Bar and Restart button
const controlsContainer = document.createElement("div");
controlsContainer.className = "game-controls";

const buildBar = document.createElement("div");
buildBar.id = "build-bar";
buildBar.className = "build-bar";
buildBar.setAttribute("role", "toolbar");
buildBar.setAttribute("aria-label", "Build Bar");

const arrowBtn = document.createElement("button");
arrowBtn.id = "build-arrow";
arrowBtn.className = "build-btn tower-btn build-arrow-btn active selected";
arrowBtn.setAttribute("data-tower", "arrow");
arrowBtn.setAttribute("data-type", "arrow");
arrowBtn.setAttribute("data-cost", String(ARROW_TOWER_CONFIG.cost));
arrowBtn.setAttribute("aria-pressed", "true");
arrowBtn.textContent = `Arrow (${ARROW_TOWER_CONFIG.cost}g)`;

const cannonBtn = document.createElement("button");
cannonBtn.id = "build-cannon";
cannonBtn.className = "build-btn tower-btn build-cannon-btn";
cannonBtn.setAttribute("data-tower", "cannon");
cannonBtn.setAttribute("data-type", "cannon");
cannonBtn.setAttribute("data-cost", String(CANNON_TOWER_CONFIG.cost));
cannonBtn.setAttribute("aria-pressed", "false");
cannonBtn.textContent = `Cannon (${CANNON_TOWER_CONFIG.cost}g)`;

const iceBtn = document.createElement("button");
iceBtn.id = "build-ice";
iceBtn.className = "build-btn tower-btn build-ice-btn";
iceBtn.setAttribute("data-tower", "ice");
iceBtn.setAttribute("data-type", "ice");
iceBtn.setAttribute("data-cost", String(ICE_TOWER_CONFIG.cost));
iceBtn.setAttribute("aria-pressed", "false");
iceBtn.textContent = `Ice (${ICE_TOWER_CONFIG.cost}g)`;

buildBar.appendChild(arrowBtn);
buildBar.appendChild(cannonBtn);
buildBar.appendChild(iceBtn);
controlsContainer.appendChild(buildBar);

const restartBtn = document.createElement("button");
restartBtn.id = "restart";
restartBtn.className = "restart-btn";
restartBtn.textContent = "Restart (R)";
restartBtn.addEventListener("click", () => {
  resetGameState(gameState);
  selectTowerType("arrow");
});
controlsContainer.appendChild(restartBtn);
app.appendChild(controlsContainer);

const ctx = canvas.getContext("2d");
if (!ctx) {
  throw new Error("2d context unavailable");
}

export const gameState: GameState = createGameState();

let selectedTowerType = "arrow";

export function selectTowerType(type: string): void {
  const normalized = type.toLowerCase().replace(/[\s_-]?tower$/, "").trim();
  if (normalized === "cannon") {
    selectedTowerType = "cannon";
    arrowBtn.classList.remove("active", "selected");
    arrowBtn.setAttribute("aria-pressed", "false");
    cannonBtn.classList.add("active", "selected");
    cannonBtn.setAttribute("aria-pressed", "true");
    iceBtn.classList.remove("active", "selected");
    iceBtn.setAttribute("aria-pressed", "false");
  } else if (normalized === "ice") {
    selectedTowerType = "ice";
    arrowBtn.classList.remove("active", "selected");
    arrowBtn.setAttribute("aria-pressed", "false");
    cannonBtn.classList.remove("active", "selected");
    cannonBtn.setAttribute("aria-pressed", "false");
    iceBtn.classList.add("active", "selected");
    iceBtn.setAttribute("aria-pressed", "true");
  } else {
    selectedTowerType = "arrow";
    cannonBtn.classList.remove("active", "selected");
    cannonBtn.setAttribute("aria-pressed", "false");
    arrowBtn.classList.add("active", "selected");
    arrowBtn.setAttribute("aria-pressed", "true");
    iceBtn.classList.remove("active", "selected");
    iceBtn.setAttribute("aria-pressed", "false");
  }
  buildBar.setAttribute("data-selected", selectedTowerType);
  canvas.setAttribute("data-selected-tower", selectedTowerType);
}

arrowBtn.addEventListener("click", () => selectTowerType("arrow"));
cannonBtn.addEventListener("click", () => selectTowerType("cannon"));
iceBtn.addEventListener("click", () => selectTowerType("ice"));

// Expose for testing or inspection
interface WindowWithGame {
  gameState: GameState;
  placeTower: (
    arg1: number | GameState,
    arg2: number,
    arg3?: number | string | TowerConfig,
    arg4?: string | TowerConfig,
  ) => unknown;
  placeArrow: (col: number, row: number) => unknown;
  placeCannon: (col: number, row: number) => unknown;
  placeIce: (col: number, row: number) => unknown;
  placeArrowTower: (col: number, row: number) => unknown;
  placeCannonTower: (col: number, row: number) => unknown;
  placeIceTower: (col: number, row: number) => unknown;
  selectTower: (type: string) => void;
  selectedTower: () => string;
  setSelectedTower: (type: string) => void;
  resetGameState: (state?: GameState) => void;
  restartGame: (state?: GameState) => void;
  startWave: (state?: GameState) => void;
  waveScheduler: (state?: GameState, dt?: number) => void;
  spawnGrunt: (state?: GameState, delay?: number) => Enemy;
  spawnRunner: (state?: GameState, delay?: number) => Enemy;
  spawnTank: (state?: GameState, delay?: number) => Enemy;
  spawnEnemy: (state?: GameState, type?: string, delay?: number) => Enemy;
  calculateDamage: typeof calculateDamage;
  damageEnemy: typeof damageEnemy;
  applyDamage: typeof applyDamage;
  applySplashDamage: typeof applySplashDamage;
  applySlow: typeof applySlow;
  clearSlow: typeof clearSlow;
  handleEnemyLeak: typeof handleEnemyLeak;
  ENEMY_CONFIGS: typeof ENEMY_CONFIGS;
  RUNNER_CONFIG: typeof RUNNER_CONFIG;
  TANK_CONFIG: typeof TANK_CONFIG;
  GRUNT_CONFIG: typeof GRUNT_CONFIG;
  getEnemyConfig: typeof getEnemyConfig;
  TOWER_CONFIGS: typeof TOWER_CONFIGS;
  TOWERS: typeof TOWER_CONFIGS;
  ARROW_TOWER_CONFIG: typeof ARROW_TOWER_CONFIG;
  CANNON_TOWER_CONFIG: typeof CANNON_TOWER_CONFIG;
  CANNON_CONFIG: typeof CANNON_TOWER_CONFIG;
  ICE_TOWER_CONFIG: typeof ICE_TOWER_CONFIG;
  ICE_CONFIG: typeof ICE_TOWER_CONFIG;
  getTowerConfig: typeof getTowerConfig;
}

const win = window as unknown as WindowWithGame;
win.gameState = gameState;
win.placeTower = (
  arg1: number | GameState,
  arg2: number,
  arg3?: number | string | TowerConfig,
  arg4?: string | TowerConfig,
) => {
  if (typeof arg1 === "object" && arg1 !== null) {
    const state = arg1 as GameState;
    const col = arg2;
    const row = arg3 as number;
    const config = arg4
      ? typeof arg4 === "string"
        ? getTowerConfig(arg4)
        : arg4
      : getTowerConfig(selectedTowerType);
    return placeTower(state, col, row, config);
  }
  const col = arg1 as number;
  const row = arg2;
  const typeOrConfig = arg3 as string | TowerConfig | undefined;
  const config = typeOrConfig
    ? typeof typeOrConfig === "string"
      ? getTowerConfig(typeOrConfig)
      : typeOrConfig
    : getTowerConfig(selectedTowerType);
  return placeTower(gameState, col, row, config);
};
win.placeArrow = (col: number, row: number) =>
  placeArrow(gameState, col, row);
win.placeCannon = (col: number, row: number) =>
  placeCannon(gameState, col, row);
win.placeIce = (col: number, row: number) =>
  placeIce(gameState, col, row);
win.placeArrowTower = (col: number, row: number) =>
  placeArrowTower(gameState, col, row);
win.placeCannonTower = (col: number, row: number) =>
  placeCannonTower(gameState, col, row);
win.placeIceTower = (col: number, row: number) =>
  placeIceTower(gameState, col, row);
win.selectTower = (type: string) => selectTowerType(type);
win.selectedTower = () => selectedTowerType;
win.setSelectedTower = (type: string) => selectTowerType(type);
win.resetGameState = () => {
  resetGameState(gameState);
  selectTowerType("arrow");
};
win.restartGame = () => {
  resetGameState(gameState);
  selectTowerType("arrow");
};
win.startWave = () => startWave(gameState);
win.waveScheduler = (state = gameState, dt = 0) => waveScheduler(state, dt);
win.spawnGrunt = (state = gameState, delay = 0) => spawnGrunt(state, delay);
win.spawnRunner = (state = gameState, delay = 0) => spawnRunner(state, delay);
win.spawnTank = (state = gameState, delay = 0) => spawnTank(state, delay);
win.spawnEnemy = (state = gameState, type = "grunt", delay = 0) =>
  spawnEnemy(state, type, delay);
win.calculateDamage = calculateDamage;
win.damageEnemy = damageEnemy;
win.applyDamage = applyDamage;
win.applySplashDamage = applySplashDamage;
win.applySlow = applySlow;
win.clearSlow = clearSlow;
win.handleEnemyLeak = handleEnemyLeak;
win.ENEMY_CONFIGS = ENEMY_CONFIGS;
win.RUNNER_CONFIG = RUNNER_CONFIG;
win.TANK_CONFIG = TANK_CONFIG;
win.GRUNT_CONFIG = GRUNT_CONFIG;
win.getEnemyConfig = getEnemyConfig;
win.TOWER_CONFIGS = TOWER_CONFIGS;
win.TOWERS = TOWERS;
win.ARROW_TOWER_CONFIG = ARROW_TOWER_CONFIG;
win.CANNON_TOWER_CONFIG = CANNON_TOWER_CONFIG;
win.CANNON_CONFIG = CANNON_CONFIG;
win.ICE_TOWER_CONFIG = ICE_TOWER_CONFIG;
win.ICE_CONFIG = ICE_CONFIG;
win.getTowerConfig = getTowerConfig;

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
    selectTowerType("arrow");
    return;
  }
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const clickX = (event.clientX - rect.left) * scaleX;
  const clickY = (event.clientY - rect.top) * scaleY;
  const cell = worldToCell(clickX, clickY);
  if (!cell) return;
  const config = getTowerConfig(selectedTowerType);
  placeTower(gameState, cell.col, cell.row, config);
});

window.addEventListener("keydown", (event: KeyboardEvent) => {
  if (event.key === "r" || event.key === "R") {
    resetGameState(gameState);
    selectTowerType("arrow");
  } else if (event.code === "Space" && gameState.status === "build") {
    startWave(gameState);
  } else if (event.key === "1") {
    selectTowerType("arrow");
  } else if (event.key === "2") {
    selectTowerType("cannon");
  } else if (event.key === "3") {
    selectTowerType("ice");
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

  // Update button affordability states
  if (gameState.gold >= ARROW_TOWER_CONFIG.cost) {
    arrowBtn.classList.remove("cannot-afford");
  } else {
    arrowBtn.classList.add("cannot-afford");
  }
  if (gameState.gold >= CANNON_TOWER_CONFIG.cost) {
    cannonBtn.classList.remove("cannot-afford");
  } else {
    cannonBtn.classList.add("cannot-afford");
  }
  if (gameState.gold >= ICE_TOWER_CONFIG.cost) {
    iceBtn.classList.remove("cannot-afford");
  } else {
    iceBtn.classList.add("cannot-afford");
  }

  drawMap(ctx!);

  // Hover placement indicator
  const activeConfig = getTowerConfig(selectedTowerType);
  if (
    !gameState.gameOver &&
    hoverCell &&
    canPlaceTower(gameState, hoverCell.col, hoverCell.row, activeConfig.cost)
  ) {
    const center = cellCenter(hoverCell);
    ctx!.save();
    ctx!.beginPath();
    ctx!.arc(center.x, center.y, activeConfig.range * CELL, 0, Math.PI * 2);
    if (activeConfig.type === "cannon") {
      ctx!.fillStyle = "rgba(231, 111, 81, 0.08)";
      ctx!.fill();
      ctx!.strokeStyle = "rgba(231, 111, 81, 0.5)";
      ctx!.lineWidth = 1.5;
      ctx!.setLineDash([4, 4]);
      ctx!.stroke();

      ctx!.fillStyle = "rgba(231, 111, 81, 0.25)";
      ctx!.fillRect(hoverCell.col * CELL, hoverCell.row * CELL, CELL, CELL);
    } else if (activeConfig.type === "ice") {
      ctx!.fillStyle = "rgba(76, 201, 240, 0.08)";
      ctx!.fill();
      ctx!.strokeStyle = "rgba(76, 201, 240, 0.5)";
      ctx!.lineWidth = 1.5;
      ctx!.setLineDash([4, 4]);
      ctx!.stroke();

      ctx!.fillStyle = "rgba(76, 201, 240, 0.25)";
      ctx!.fillRect(hoverCell.col * CELL, hoverCell.row * CELL, CELL, CELL);
    } else {
      ctx!.fillStyle = "rgba(233, 196, 106, 0.08)";
      ctx!.fill();
      ctx!.strokeStyle = "rgba(233, 196, 106, 0.4)";
      ctx!.lineWidth = 1.5;
      ctx!.setLineDash([4, 4]);
      ctx!.stroke();

      ctx!.fillStyle = "rgba(233, 196, 106, 0.25)";
      ctx!.fillRect(hoverCell.col * CELL, hoverCell.row * CELL, CELL, CELL);
    }
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
