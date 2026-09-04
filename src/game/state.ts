import { Enemy, createEnemy, updateEnemies, drawEnemy } from "./enemy";
import {
  Tower,
  createTower,
  updateTowers,
  drawTowers,
  placeTower,
  canPlaceTower,
  buildTower,
} from "./tower";
import { GRUNT_CONFIG } from "../data/enemies";

export const INITIAL_LIVES = 10;
export const INITIAL_GOLD = 120;
export const DEFAULT_INITIAL_ENEMIES = 4;
export const SPAWN_INTERVAL = 1.2;

export interface GameState {
  lives: number;
  gold: number;
  enemies: Enemy[];
  towers: Tower[];
}

export function createGameState(): GameState {
  const state: GameState = {
    lives: INITIAL_LIVES,
    gold: INITIAL_GOLD,
    enemies: [],
    towers: [],
  };

  // Spawn a few on start
  for (let i = 0; i < DEFAULT_INITIAL_ENEMIES; i++) {
    state.enemies.push(createEnemy(GRUNT_CONFIG, i * SPAWN_INTERVAL));
  }

  return state;
}

export function spawnGrunt(state: GameState, delay = 0): Enemy {
  const enemy = createEnemy(GRUNT_CONFIG, delay);
  state.enemies.push(enemy);
  return enemy;
}

export function updateGameState(state: GameState, dt: number): void {
  state.enemies = updateEnemies(state.enemies, dt, () => {
    state.lives = Math.max(0, state.lives - 1);
  });

  updateTowers(state, dt);

  // Filter out any enemies that died from tower attacks
  state.enemies = state.enemies.filter((e) => !e.dead);
}

export function drawEnemies(
  ctx: CanvasRenderingContext2D,
  target: GameState | readonly Enemy[],
): void {
  const list: readonly Enemy[] = "enemies" in target ? target.enemies : target;
  for (const enemy of list) {
    drawEnemy(ctx, enemy);
  }
}

export { drawTowers, placeTower, canPlaceTower, buildTower, createTower };


