export interface TowerConfig {
  type: string;
  name: string;
  cost: number;
  damage: number;
  rate: number; // shots per second
  range: number; // range in cells
  color?: string;
}

export const ARROW_TOWER_CONFIG: TowerConfig = {
  type: "arrow",
  name: "Arrow Tower",
  cost: 50,
  damage: 10,
  rate: 1,
  range: 2.5,
  color: "#e9c46a",
};
