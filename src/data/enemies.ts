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

export const ENEMY_CONFIGS: Record<string, EnemyConfig> = {
  grunt: GRUNT_CONFIG,
};

export const ENEMIES = ENEMY_CONFIGS;

export function getEnemyConfig(type: string): EnemyConfig {
  return ENEMY_CONFIGS[type] ?? GRUNT_CONFIG;
}

