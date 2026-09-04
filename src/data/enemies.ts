export interface EnemyConfig {
  type: string;
  name: string;
  hp: number;
  speed: number; // cells per second
  radius: number;
  color: string;
}

export const GRUNT_CONFIG: EnemyConfig = {
  type: "grunt",
  name: "Grunt",
  hp: 30,
  speed: 1.5,
  radius: 14,
  color: "#e63946",
};
