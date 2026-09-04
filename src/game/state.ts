import { Enemy, createEnemy, updateEnemies, drawEnemy, resetEnemyId } from "./enemy";
import {
  Tower,
  createTower,
  updateTowers,
  drawTowers,
  placeTower,
  canPlaceTower,
  buildTower,
  resetTowerId,
} from "./tower";
import { GRUNT_CONFIG, getEnemyConfig } from "../data/enemies";
import { WAVES, TOTAL_WAVES, WaveConfig, SpawnEntry } from "../data/waves";

export const INITIAL_LIVES = 10;
export const INITIAL_GOLD = 120;
export const BUILD_PHASE_DURATION = 3; // 3 seconds initial build phase
export const DEFAULT_INITIAL_ENEMIES = 4;
export const SPAWN_INTERVAL = 1.2;

export type GameStatus = "build" | "wave" | "won" | "lost";

export interface GameState {
  lives: number;
  gold: number;
  enemies: Enemy[];
  towers: Tower[];
  wave: number;
  currentWave: number;
  totalWaves: number;
  status: GameStatus;
  phase: GameStatus;
  buildTimer: number;
  spawnTimer: number;
  spawnedInWave: number;
  spawnIndex: number;
  isWon: boolean;
  isLost: boolean;
  gameOver: boolean;
  won: boolean;
  lost: boolean;
}

export function createGameState(): GameState {
  return {
    lives: INITIAL_LIVES,
    gold: INITIAL_GOLD,
    enemies: [],
    towers: [],
    wave: 1,
    currentWave: 1,
    totalWaves: TOTAL_WAVES,
    status: "build",
    phase: "build",
    buildTimer: BUILD_PHASE_DURATION,
    spawnTimer: 0,
    spawnedInWave: 0,
    spawnIndex: 0,
    isWon: false,
    isLost: false,
    gameOver: false,
    won: false,
    lost: false,
  };
}

export function resetGameState(state: GameState): GameState {
  state.lives = INITIAL_LIVES;
  state.gold = INITIAL_GOLD;
  state.enemies = [];
  state.towers = [];
  state.wave = 1;
  state.currentWave = 1;
  state.totalWaves = TOTAL_WAVES;
  state.status = "build";
  state.phase = "build";
  state.buildTimer = BUILD_PHASE_DURATION;
  state.spawnTimer = 0;
  state.spawnedInWave = 0;
  state.spawnIndex = 0;
  state.isWon = false;
  state.isLost = false;
  state.gameOver = false;
  state.won = false;
  state.lost = false;
  resetEnemyId();
  resetTowerId();
  return state;
}

export const restartGame = resetGameState;

function getWaveSpawns(waveConfig?: WaveConfig): readonly SpawnEntry[] {
  if (!waveConfig) return [];
  if (waveConfig.spawns && waveConfig.spawns.length > 0) {
    return waveConfig.spawns;
  }
  if (waveConfig.entries && waveConfig.entries.length > 0) {
    return waveConfig.entries;
  }
  if (waveConfig.spawnList && waveConfig.spawnList.length > 0) {
    return waveConfig.spawnList;
  }
  return [];
}

function spawnEnemyByType(type: string, delay = 0): Enemy {
  const config = getEnemyConfig(type);
  return createEnemy(config, delay);
}

export function startWave(state: GameState): void {
  if (state.status === "build") {
    state.status = "wave";
    state.phase = "wave";
    state.buildTimer = 0;
    const waveConfig = WAVES[state.wave - 1];
    const spawns = getWaveSpawns(waveConfig);
    if (waveConfig && state.spawnedInWave === 0 && spawns.length > 0) {
      const entry = spawns[0];
      state.enemies.push(spawnEnemyByType(entry.type, 0));
      state.spawnedInWave = 1;
      state.spawnIndex = 1;
      state.spawnTimer = entry.delay;
    } else {
      state.spawnTimer = 0;
    }
  }
}

export function spawnGrunt(state: GameState, delay = 0): Enemy {
  const enemy = createEnemy(GRUNT_CONFIG, delay);
  state.enemies.push(enemy);
  return enemy;
}

export function waveScheduler(state: GameState, dt: number): void {
  if (state.status !== "wave") return;

  const waveIndex = state.wave - 1;
  const waveConfig = WAVES[waveIndex];
  if (!waveConfig) return;

  const spawns = getWaveSpawns(waveConfig);
  const totalSpawns = spawns.length;

  if (state.spawnedInWave < totalSpawns) {
    state.spawnTimer -= dt;
    while (state.spawnTimer <= 0 && state.spawnedInWave < totalSpawns) {
      const entry = spawns[state.spawnedInWave];
      state.enemies.push(spawnEnemyByType(entry.type, 0));
      state.spawnedInWave++;
      state.spawnIndex = state.spawnedInWave;
      state.spawnTimer += entry.delay;
    }
  }
}

export function updateGameState(state: GameState, dt: number): void {
  if (state.gameOver || state.lives <= 0) {
    if (state.lives <= 0 && !state.gameOver) {
      state.lives = 0;
      state.status = "lost";
      state.phase = "lost";
      state.isLost = true;
      state.lost = true;
      state.gameOver = true;
    }
    return;
  }

  // 1. Build Phase countdown
  if (state.status === "build") {
    if (state.buildTimer > dt) {
      state.buildTimer -= dt;
      dt = 0;
    } else {
      dt -= state.buildTimer;
      state.buildTimer = 0;
      state.status = "wave";
      state.phase = "wave";
      state.spawnTimer = 0;
      state.spawnedInWave = 0;
      state.spawnIndex = 0;
    }
  }

  // 2. Wave enemy spawn scheduler
  waveScheduler(state, dt);

  // 3. Update enemies along path
  state.enemies = updateEnemies(state.enemies, dt, (leakedEnemy) => {
    const cost = leakedEnemy.livesCost ?? 1;
    state.lives = Math.max(0, state.lives - cost);
  });

  // 4. Update towers (targeting, shooting, cooldown, gold reward)
  updateTowers(state, dt);

  // 5. Filter out dead enemies
  state.enemies = state.enemies.filter((e) => !e.dead);

  // 6. Check lose condition
  if (state.lives <= 0) {
    state.lives = 0;
    state.status = "lost";
    state.phase = "lost";
    state.isLost = true;
    state.lost = true;
    state.gameOver = true;
    return;
  }

  // 7. Check wave completion condition
  if (state.status === "wave") {
    const waveIndex = state.wave - 1;
    const waveConfig = WAVES[waveIndex];
    const spawns = getWaveSpawns(waveConfig);
    const totalSpawns = spawns.length || (waveConfig?.count ?? 0);

    if (
      waveConfig &&
      state.spawnedInWave >= totalSpawns &&
      state.enemies.length === 0
    ) {
      if (state.wave < TOTAL_WAVES) {
        // After W1 clear start W2
        state.wave++;
        state.currentWave = state.wave;
        state.spawnedInWave = 0;
        state.spawnIndex = 0;
        state.spawnTimer = 0;
        state.status = "wave";
        state.phase = "wave";

        const nextConfig = WAVES[state.wave - 1];
        const nextSpawns = getWaveSpawns(nextConfig);
        if (nextSpawns.length > 0) {
          const entry = nextSpawns[0];
          state.enemies.push(spawnEnemyByType(entry.type, 0));
          state.spawnedInWave = 1;
          state.spawnIndex = 1;
          state.spawnTimer = entry.delay;
        }
      } else {
        // Clear W2 = win
        state.status = "won";
        state.phase = "won";
        state.isWon = true;
        state.won = true;
        state.gameOver = true;
      }
    }
  }
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

export {
  drawTowers,
  placeTower,
  canPlaceTower,
  buildTower,
  createTower,
};
export type { WaveConfig, SpawnEntry };

