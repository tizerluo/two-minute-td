export interface EnemyConfig {
  type: string;
  name: string;
  hp: number;
  speed: number; // cells per second
  radius: number;
  color: string;
  reward?: number;
  singleDamageMult?: number;
  livesCost?: number;
}

export const GRUNT_CONFIG: EnemyConfig = {
  type: "grunt",
  name: "Grunt",
  hp: 30,
  speed: 1.5,
  radius: 14,
  color: "#e63946",
  reward: 10,
  singleDamageMult: 1,
  livesCost: 1,
};

export const RUNNER_CONFIG: EnemyConfig = {
  type: "runner",
  name: "Runner",
  hp: 18,
  speed: 2.6,
  radius: 10,
  color: "#f4a261",
  reward: 4,
  singleDamageMult: 1,
  livesCost: 1,
};

export const TANK_CONFIG: EnemyConfig = {
  type: "tank",
  name: "Tank",
  hp: 130,
  speed: 1.0,
  radius: 18,
  color: "#457b9d",
  reward: 12,
  singleDamageMult: 0.7,
  livesCost: 2,
};

export const ENEMY_CONFIGS: Record<string, EnemyConfig> = {
  grunt: GRUNT_CONFIG,
  Grunt: GRUNT_CONFIG,
  runner: RUNNER_CONFIG,
  Runner: RUNNER_CONFIG,
  tank: TANK_CONFIG,
  Tank: TANK_CONFIG,
};

export const ENEMIES = ENEMY_CONFIGS;

export function getEnemyConfig(type: string): EnemyConfig {
  const key = type.toLowerCase();
  return ENEMY_CONFIGS[key] ?? ENEMY_CONFIGS[type] ?? GRUNT_CONFIG;
}
