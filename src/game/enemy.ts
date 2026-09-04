import { CELL, Vec2, WAYPOINTS } from "./map";
import { EnemyConfig, GRUNT_CONFIG } from "../data/enemies";

export interface Enemy {
  id: number;
  type: string;
  name: string;
  hp: number;
  maxHp: number;
  speed: number; // cells per second (1.5 for Grunt)
  speedCells: number; // 1.5
  speedPx: number; // pixels per second (1.5 * CELL = 96)
  x: number;
  y: number;
  waypointIndex: number;
  radius: number;
  color: string;
  spawnDelay: number;
  leaked: boolean;
  dead: boolean;
  reward: number;
  singleDamageMult?: number;
  livesCost?: number;
}

let nextEnemyId = 1;

export function resetEnemyId(): void {
  nextEnemyId = 1;
}

export function createEnemy(
  config: EnemyConfig = GRUNT_CONFIG,
  spawnDelay = 0,
): Enemy {
  const start: Vec2 = WAYPOINTS[0] ?? { x: 32, y: 96 };
  return {
    id: nextEnemyId++,
    type: config.type,
    name: config.name,
    hp: config.hp,
    maxHp: config.hp,
    speed: config.speed,
    speedCells: config.speed,
    speedPx: config.speed * CELL,
    x: start.x,
    y: start.y,
    waypointIndex: 1,
    radius: config.radius,
    color: config.color,
    spawnDelay,
    leaked: false,
    dead: false,
    reward: config.reward ?? 10,
    singleDamageMult: config.singleDamageMult ?? 1,
    livesCost: config.livesCost ?? 1,
  };
}

export function updateEnemy(
  enemy: Enemy,
  dt: number,
  onLeak?: (enemy: Enemy) => void,
): void {
  if (enemy.dead || enemy.leaked) return;

  if (enemy.spawnDelay > 0) {
    enemy.spawnDelay -= dt;
    if (enemy.spawnDelay > 0) return;
  }

  let remainingDist = enemy.speedPx * dt;

  while (remainingDist > 0 && enemy.waypointIndex < WAYPOINTS.length) {
    const target = WAYPOINTS[enemy.waypointIndex]!;
    const dx = target.x - enemy.x;
    const dy = target.y - enemy.y;
    const dist = Math.hypot(dx, dy);

    if (dist <= remainingDist) {
      enemy.x = target.x;
      enemy.y = target.y;
      remainingDist -= dist;
      enemy.waypointIndex++;
    } else {
      enemy.x += (dx / dist) * remainingDist;
      enemy.y += (dy / dist) * remainingDist;
      remainingDist = 0;
    }
  }

  if (enemy.waypointIndex >= WAYPOINTS.length) {
    enemy.leaked = true;
    if (onLeak) {
      onLeak(enemy);
    }
  }
}

export function drawEnemy(ctx: CanvasRenderingContext2D, enemy: Enemy): void {
  if (enemy.dead || enemy.leaked || enemy.spawnDelay > 0) return;

  ctx.save();

  // Draw enemy body as a circle
  ctx.beginPath();
  ctx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2);
  ctx.fillStyle = enemy.color;
  ctx.fill();
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Small health bar above enemy circle
  const barW = 24;
  const barH = 4;
  const barX = enemy.x - barW / 2;
  const barY = enemy.y - enemy.radius - 8;

  ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
  ctx.fillRect(barX - 1, barY - 1, barW + 2, barH + 2);
  ctx.fillStyle = "#2ecc71";
  const hpRatio = Math.max(0, Math.min(1, enemy.hp / enemy.maxHp));
  ctx.fillRect(barX, barY, barW * hpRatio, barH);

  ctx.restore();
}

export function updateEnemies(
  enemies: Enemy[],
  dt: number,
  onLeak?: (enemy: Enemy) => void,
): Enemy[] {
  for (const enemy of enemies) {
    updateEnemy(enemy, dt, onLeak);
  }
  return enemies.filter((e) => !e.dead && !e.leaked);
}

export function drawEnemies(
  ctx: CanvasRenderingContext2D,
  enemies: readonly Enemy[],
): void {
  for (const enemy of enemies) {
    drawEnemy(ctx, enemy);
  }
}

/**
 * Apply damage to an enemy. Marks dead when hp <= 0 and calls onKill.
 * Returns true if the hit resulted in a kill.
 */
export function damageEnemy(
  enemy: Enemy,
  amount: number,
  onKill?: (enemy: Enemy) => void,
): boolean {
  if (enemy.dead || enemy.leaked) return false;
  enemy.hp -= amount;
  if (enemy.hp <= 0) {
    enemy.hp = 0;
    if (!enemy.dead) {
      enemy.dead = true;
      if (onKill) {
        onKill(enemy);
      }
    }
    return true;
  }
  return false;
}

