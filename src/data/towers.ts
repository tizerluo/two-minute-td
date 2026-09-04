export type DamageType = "single" | "splash";
export type TowerDamageType = DamageType;

export interface SlowEffect {
  pct: number;
  duration: number; // in seconds
}

export interface TowerConfig {
  type: string;
  name: string;
  cost: number;
  damage: number;
  rate: number; // shots per second
  range: number; // range in cells
  color?: string;
  damageType: DamageType;
  splashRadius?: number; // splash radius in cells or pixels
  slow?: {
    pct: number;
    duration: number;
  };
  slowPct?: number;
  slowDuration?: number;
}

export const ARROW_TOWER_CONFIG: TowerConfig = {
  type: "arrow",
  name: "Arrow Tower",
  cost: 50,
  damage: 10,
  rate: 1,
  range: 2.5,
  color: "#e9c46a",
  damageType: "single",
};

export const CANNON_TOWER_CONFIG: TowerConfig = {
  type: "cannon",
  name: "Cannon Tower",
  cost: 80,
  damage: 22,
  rate: 0.5,
  range: 2.5,
  damageType: "splash",
  splashRadius: 1.5,
  color: "#e76f51",
};

export const CANNON_CONFIG = CANNON_TOWER_CONFIG;

export const ICE_TOWER_CONFIG: TowerConfig = {
  type: "ice",
  name: "Ice Tower",
  cost: 60,
  damage: 4,
  rate: 1.0,
  range: 2.5,
  damageType: "single",
  color: "#4cc9f0",
  slow: {
    pct: 0.4,
    duration: 1.5,
  },
  slowPct: 0.4,
  slowDuration: 1.5,
};

export const ICE_CONFIG = ICE_TOWER_CONFIG;

export const TOWER_CONFIGS: Record<string, TowerConfig> = {
  arrow: ARROW_TOWER_CONFIG,
  cannon: CANNON_TOWER_CONFIG,
  ice: ICE_TOWER_CONFIG,
};

export const TOWERS = TOWER_CONFIGS;

export function getTowerConfig(type: string): TowerConfig {
  const key = type.toLowerCase().replace(/[\s_-]?tower$/, "").trim();
  return TOWER_CONFIGS[key] ?? TOWER_CONFIGS[type] ?? ARROW_TOWER_CONFIG;
}

