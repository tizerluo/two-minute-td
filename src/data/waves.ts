import { EnemyConfig, GRUNT_CONFIG } from "./enemies";

export interface SpawnEntry {
  type: string;
  delay: number; // in seconds
}

export type WaveSpawnEntry = SpawnEntry;

export interface WaveConfig {
  waveNumber: number;
  spawns: readonly SpawnEntry[];
  entries?: readonly SpawnEntry[];
  spawnList?: readonly SpawnEntry[];
  count?: number;
  interval?: number; // in seconds
  enemyConfig?: EnemyConfig;
  enemyType?: string;
}

export const WAVES: readonly WaveConfig[] = [
  {
    waveNumber: 1,
    spawns: [
      { type: "grunt", delay: 0.8 },
      { type: "grunt", delay: 0.8 },
      { type: "grunt", delay: 0.8 },
      { type: "grunt", delay: 0.8 },
      { type: "grunt", delay: 0.8 },
      { type: "grunt", delay: 0.8 },
    ],
    get entries() {
      return this.spawns;
    },
    get spawnList() {
      return this.spawns;
    },
    get count() {
      return this.spawns.length;
    },
    interval: 0.8,
    enemyConfig: GRUNT_CONFIG,
    enemyType: "grunt",
  },
  {
    waveNumber: 2,
    spawns: [
      { type: "grunt", delay: 0.7 },
      { type: "grunt", delay: 0.7 },
      { type: "grunt", delay: 0.7 },
      { type: "grunt", delay: 0.7 },
      { type: "grunt", delay: 0.7 },
      { type: "grunt", delay: 0.7 },
      { type: "grunt", delay: 0.7 },
      { type: "grunt", delay: 0.7 },
    ],
    get entries() {
      return this.spawns;
    },
    get spawnList() {
      return this.spawns;
    },
    get count() {
      return this.spawns.length;
    },
    interval: 0.7,
    enemyConfig: GRUNT_CONFIG,
    enemyType: "grunt",
  },
  {
    waveNumber: 3,
    spawns: [
      { type: "grunt", delay: 0.9 },
      { type: "grunt", delay: 0.9 },
      { type: "grunt", delay: 0.9 },
      { type: "runner", delay: 0.6 },
      { type: "grunt", delay: 0.9 },
      { type: "grunt", delay: 0.9 },
      { type: "runner", delay: 0.7 },
      { type: "grunt", delay: 0.9 },
      { type: "grunt", delay: 0.9 },
      { type: "grunt", delay: 0.9 },
      { type: "runner", delay: 0.6 },
      { type: "runner", delay: 0.7 },
      { type: "grunt", delay: 0.9 },
      { type: "grunt", delay: 0.9 },
      { type: "grunt", delay: 0.9 },
      { type: "grunt", delay: 0.9 },
      { type: "grunt", delay: 0.9 },
      { type: "grunt", delay: 0.9 },
      { type: "grunt", delay: 0.9 },
    ],
    get entries() {
      return this.spawns;
    },
    get spawnList() {
      return this.spawns;
    },
    get count() {
      return this.spawns.length;
    },
    interval: 0.8,
    enemyType: "mixed",
  },
  {
    waveNumber: 4,
    spawns: [
      { type: "runner", delay: 0.5 },
      { type: "runner", delay: 0.5 },
      { type: "runner", delay: 0.6 },
      { type: "grunt", delay: 0.9 },
      { type: "grunt", delay: 0.9 },
      { type: "runner", delay: 0.5 },
      { type: "runner", delay: 0.5 },
      { type: "runner", delay: 0.7 },
      { type: "grunt", delay: 0.9 },
      { type: "grunt", delay: 0.9 },
      { type: "runner", delay: 0.5 },
      { type: "runner", delay: 0.5 },
      { type: "runner", delay: 0.6 },
      { type: "grunt", delay: 0.9 },
      { type: "runner", delay: 0.5 },
      { type: "runner", delay: 0.5 },
      { type: "runner", delay: 0.7 },
      { type: "grunt", delay: 0.9 },
      { type: "grunt", delay: 0.9 },
      { type: "runner", delay: 0.6 },
      { type: "grunt", delay: 0.9 },
      { type: "grunt", delay: 0.9 },
      { type: "runner", delay: 0.6 },
      { type: "grunt", delay: 0.9 },
    ],
    get entries() {
      return this.spawns;
    },
    get spawnList() {
      return this.spawns;
    },
    get count() {
      return this.spawns.length;
    },
    interval: 0.7,
    enemyType: "mixed",
  },
  {
    waveNumber: 5,
    spawns: [
      { type: "grunt", delay: 0.9 },
      { type: "grunt", delay: 0.9 },
      { type: "tank", delay: 1.8 },
      { type: "runner", delay: 0.5 },
      { type: "runner", delay: 0.5 },
      { type: "runner", delay: 0.7 },
      { type: "grunt", delay: 0.9 },
      { type: "grunt", delay: 0.9 },
      { type: "runner", delay: 0.6 },
      { type: "grunt", delay: 0.9 },
      { type: "runner", delay: 0.5 },
      { type: "runner", delay: 0.6 },
      { type: "grunt", delay: 0.9 },
      { type: "grunt", delay: 0.9 },
      { type: "tank", delay: 1.8 },
      { type: "runner", delay: 0.5 },
      { type: "runner", delay: 0.6 },
      { type: "grunt", delay: 0.9 },
      { type: "grunt", delay: 0.9 },
      { type: "grunt", delay: 0.9 },
      { type: "runner", delay: 0.6 },
      { type: "grunt", delay: 0.9 },
      { type: "grunt", delay: 0.9 },
    ],
    get entries() {
      return this.spawns;
    },
    get spawnList() {
      return this.spawns;
    },
    get count() {
      return this.spawns.length;
    },
    interval: 0.8,
    enemyType: "mixed",
  },
  {
    waveNumber: 6,
    spawns: [
      { type: "runner", delay: 0.4 },
      { type: "runner", delay: 0.4 },
      { type: "grunt", delay: 0.7 },
      { type: "grunt", delay: 0.7 },
      { type: "runner", delay: 0.4 },
      { type: "runner", delay: 0.4 },
      { type: "runner", delay: 0.5 },
      { type: "grunt", delay: 0.7 },
      { type: "grunt", delay: 0.7 },
      { type: "runner", delay: 0.4 },
      { type: "runner", delay: 0.4 },
      { type: "grunt", delay: 0.7 },
      { type: "runner", delay: 0.4 },
      { type: "grunt", delay: 0.7 },
      { type: "grunt", delay: 0.7 },
      { type: "runner", delay: 0.5 },
      { type: "runner", delay: 0.5 },
      { type: "grunt", delay: 0.8 },
      { type: "grunt", delay: 0.8 },
      { type: "runner", delay: 0.5 },
      { type: "grunt", delay: 0.8 },
      { type: "grunt", delay: 1.0 },
      { type: "tank", delay: 1.8 },
      { type: "tank", delay: 1.8 },
      { type: "tank", delay: 1.4 },
    ],
    get entries() {
      return this.spawns;
    },
    get spawnList() {
      return this.spawns;
    },
    get count() {
      return this.spawns.length;
    },
    interval: 0.7,
    enemyType: "mixed",
  },
];

export const TOTAL_WAVES = WAVES.length;
export const waves = WAVES;
export const WAVE_TABLE = WAVES;


