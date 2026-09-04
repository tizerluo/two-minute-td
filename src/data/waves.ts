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
];

export const TOTAL_WAVES = WAVES.length;
export const waves = WAVES;
export const WAVE_TABLE = WAVES;

