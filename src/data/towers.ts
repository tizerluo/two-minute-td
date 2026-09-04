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

export const TOWER_CONFIGS: Record<string, TowerConfig> = {
  arrow: ARROW_TOWER_CONFIG,
};

export const TOWERS = TOWER_CONFIGS;

export function getTowerConfig(type: string): TowerConfig {
  return TOWER_CONFIGS[type] ?? ARROW_TOWER_CONFIG;
}

