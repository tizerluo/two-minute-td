import { EnemyConfig, GRUNT_CONFIG } from "./enemies";

export interface WaveConfig {
  waveNumber: number;
  count: number;
  interval: number; // in seconds
  enemyConfig: EnemyConfig;
  enemyType: string;
}

export const WAVES: readonly WaveConfig[] = [
  {
    waveNumber: 1,
    count: 6,
    interval: 0.8,
    enemyConfig: GRUNT_CONFIG,
    enemyType: "grunt",
  },
  {
    waveNumber: 2,
    count: 8,
    interval: 0.7,
    enemyConfig: GRUNT_CONFIG,
    enemyType: "grunt",
  },
];

export const TOTAL_WAVES = WAVES.length;
export const waves = WAVES;
export const WAVE_TABLE = WAVES;
