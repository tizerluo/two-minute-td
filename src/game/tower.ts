import { CELL, Vec2, cellCenter, isBuildable, WAYPOINTS } from "./map";
import { Enemy, damageEnemy, applySplashDamage } from "./enemy";
import {
  TowerConfig,
  ARROW_TOWER_CONFIG,
  CANNON_TOWER_CONFIG,
  DamageType,
  getTowerConfig,
} from "../data/towers";

export { WAYPOINTS, applySplashDamage };

export interface Tower {
  id: number;
  type: string;
  name: string;
  col: number;
  row: number;
  x: number;
  y: number;
  cost: number;
  damage: number;
  rate: number; // shots per second
  range: number; // cells
  rangePx: number; // pixels
  cooldown: number; // seconds until ready
  angle: number; // radians
  targetEnemyId: number | null;
  lastShotTimer: number;
  lastShotTarget: Vec2 | null;
  damageType?: DamageType;
  splashRadius?: number;
  splashRadiusPx?: number;
  color?: string;
  slow?: { pct: number; duration: number };
  slowPct?: number;
  slowDuration?: number;
}

let nextTowerId = 1;

export function resetTowerId(): void {
  nextTowerId = 1;
}

export function createTower(
  col: number,
  row: number,
  configOrType: TowerConfig | string = ARROW_TOWER_CONFIG,
): Tower {
  const config =
    typeof configOrType === "string"
      ? getTowerConfig(configOrType)
      : configOrType;
  const center = cellCenter({ col, row });
  const splashRadius = config.splashRadius;
  const splashRadiusPx =
    splashRadius !== undefined
      ? splashRadius <= 10
        ? splashRadius * CELL
        : splashRadius
      : undefined;

  return {
    id: nextTowerId++,
    type: config.type,
    name: config.name,
    col,
    row,
    x: center.x,
    y: center.y,
    cost: config.cost,
    damage: config.damage,
    rate: config.rate,
    range: config.range,
    rangePx: config.range * CELL,
    cooldown: 0,
    angle: -Math.PI / 2,
    targetEnemyId: null,
    lastShotTimer: 0,
    lastShotTarget: null,
    damageType: config.damageType,
    splashRadius,
    splashRadiusPx,
    color: config.color,
    slow: config.slow,
    slowPct: config.slowPct ?? config.slow?.pct,
    slowDuration: config.slowDuration ?? config.slow?.duration,
  };
}

export function canPlaceTower(
  state: { gold: number; towers: readonly Tower[] },
  col: number,
  row: number,
  costOrConfig: number | TowerConfig | string = ARROW_TOWER_CONFIG.cost,
): boolean {
  if (!isBuildable(col, row)) return false;
  if (state.towers.some((t) => t.col === col && t.row === row)) return false;
  let cost = ARROW_TOWER_CONFIG.cost;
  if (typeof costOrConfig === "number") {
    cost = costOrConfig;
  } else if (typeof costOrConfig === "string") {
    cost = getTowerConfig(costOrConfig).cost;
  } else if (costOrConfig && typeof costOrConfig === "object") {
    cost = costOrConfig.cost;
  }
  if (state.gold < cost) return false;
  return true;
}

export function placeTower(
  state: { gold: number; towers: Tower[] },
  col: number,
  row: number,
  configOrType: TowerConfig | string = ARROW_TOWER_CONFIG,
): Tower | null {
  const config =
    typeof configOrType === "string"
      ? getTowerConfig(configOrType)
      : configOrType;
  if (!canPlaceTower(state, col, row, config.cost)) {
    return null;
  }
  state.gold -= config.cost;
  const tower = createTower(col, row, config);
  state.towers.push(tower);
  return tower;
}

export function placeArrowTower(
  state: { gold: number; towers: Tower[] },
  col: number,
  row: number,
): Tower | null {
  return placeTower(state, col, row, ARROW_TOWER_CONFIG);
}

export function placeCannonTower(
  state: { gold: number; towers: Tower[] },
  col: number,
  row: number,
): Tower | null {
  return placeTower(state, col, row, CANNON_TOWER_CONFIG);
}

export const buildTower = placeTower;

/**
 * Calculate remaining distance along path WAYPOINTS to the end waypoint.
 * Smaller distance means nearer to end.
 */
export function getDistanceToEnd(enemy: Enemy): number {
  if (enemy.waypointIndex >= WAYPOINTS.length) {
    return 0;
  }
  const nextWp = WAYPOINTS[enemy.waypointIndex]!;
  const distToNext = Math.hypot(nextWp.x - enemy.x, nextWp.y - enemy.y);
  const remainingWaypoints = WAYPOINTS.length - 1 - enemy.waypointIndex;
  return distToNext + remainingWaypoints * CELL;
}

/**
 * Find the nearest-to-end enemy in range of the tower.
 * Uses WAYPOINTS path progress to determine which enemy is closest to the finish.
 */
export function findTarget(
  tower: Tower,
  enemies: readonly Enemy[],
): Enemy | null {
  let bestEnemy: Enemy | null = null;
  let bestDistToEnd = Infinity;

  for (const enemy of enemies) {
    if (enemy.dead || enemy.leaked || enemy.spawnDelay > 0) {
      continue;
    }
    const distToTower = Math.hypot(enemy.x - tower.x, enemy.y - tower.y);
    if (distToTower <= tower.rangePx) {
      const distToEnd = getDistanceToEnd(enemy);
      if (distToEnd < bestDistToEnd) {
        bestDistToEnd = distToEnd;
        bestEnemy = enemy;
      }
    }
  }

  return bestEnemy;
}

export function updateTower(
  tower: Tower,
  enemies: readonly Enemy[],
  dt: number,
  onShoot?: (tower: Tower, target: Enemy) => void,
  onKill?: (enemy: Enemy) => void,
): void {
  if (tower.lastShotTimer > 0) {
    tower.lastShotTimer -= dt;
  }

  if (tower.cooldown > 0) {
    tower.cooldown -= dt;
  }

  if (tower.cooldown <= 0) {
    const target = findTarget(tower, enemies);
    if (target) {
      tower.angle = Math.atan2(target.y - tower.y, target.x - tower.x);
      tower.targetEnemyId = target.id;
      tower.lastShotTarget = { x: target.x, y: target.y };
      tower.lastShotTimer = 0.12;
      tower.cooldown = 1 / tower.rate;

      if (onShoot) {
        onShoot(tower, target);
      }

      if (tower.damageType === "splash" || tower.type === "cannon") {
        applySplashDamage(
          target,
          enemies,
          tower.damage,
          tower.splashRadius ?? 1.5,
          onKill,
        );
      } else {
        damageEnemy(target, tower.damage, tower.damageType ?? "single", onKill);
      }
    } else {
      tower.cooldown = 0;
      tower.targetEnemyId = null;
    }
  }
}

export function updateTowers(
  state: { gold: number; towers: Tower[]; enemies: Enemy[] },
  dt: number,
  onKill?: (enemy: Enemy) => void,
): void {
  for (const tower of state.towers) {
    updateTower(
      tower,
      state.enemies,
      dt,
      undefined,
      (killed) => {
        state.gold += killed.reward;
        if (onKill) {
          onKill(killed);
        }
      },
    );
  }
}

export function drawTower(ctx: CanvasRenderingContext2D, tower: Tower): void {
  ctx.save();

  // Shot tracer line and impact
  if (tower.lastShotTimer > 0 && tower.lastShotTarget) {
    const alpha = Math.max(0, Math.min(1, tower.lastShotTimer / 0.12));
    ctx.save();
    if (tower.type === "cannon" || tower.damageType === "splash") {
      ctx.strokeStyle = `rgba(231, 111, 81, ${alpha})`;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(tower.x, tower.y);
      ctx.lineTo(tower.lastShotTarget.x, tower.lastShotTarget.y);
      ctx.stroke();

      // Splash explosion circle
      const splashPx =
        tower.splashRadiusPx ??
        (tower.splashRadius
          ? tower.splashRadius <= 10
            ? tower.splashRadius * CELL
            : tower.splashRadius
          : 1.5 * CELL);
      ctx.beginPath();
      ctx.arc(
        tower.lastShotTarget.x,
        tower.lastShotTarget.y,
        splashPx,
        0,
        Math.PI * 2,
      );
      ctx.fillStyle = `rgba(231, 111, 81, ${alpha * 0.25})`;
      ctx.fill();
      ctx.strokeStyle = `rgba(244, 162, 97, ${alpha * 0.7})`;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Center flash
      ctx.fillStyle = `rgba(255, 230, 109, ${alpha})`;
      ctx.beginPath();
      ctx.arc(tower.lastShotTarget.x, tower.lastShotTarget.y, 6, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.strokeStyle = `rgba(255, 209, 102, ${alpha})`;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(tower.x, tower.y);
      ctx.lineTo(tower.lastShotTarget.x, tower.lastShotTarget.y);
      ctx.stroke();

      // Small impact flash
      ctx.fillStyle = `rgba(255, 230, 109, ${alpha})`;
      ctx.beginPath();
      ctx.arc(tower.lastShotTarget.x, tower.lastShotTarget.y, 4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // Tower square base
  const baseSize = 40;
  const half = baseSize / 2;
  ctx.fillStyle = "#264653";
  ctx.fillRect(tower.x - half, tower.y - half, baseSize, baseSize);
  ctx.strokeStyle = tower.type === "cannon" ? "#e76f51" : "#2a9d8f";
  ctx.lineWidth = 2;
  ctx.strokeRect(tower.x - half, tower.y - half, baseSize, baseSize);

  // Turret circle
  ctx.beginPath();
  ctx.arc(tower.x, tower.y, 13, 0, Math.PI * 2);
  ctx.fillStyle =
    tower.color ?? (tower.type === "cannon" ? "#e76f51" : "#e9c46a");
  ctx.fill();
  ctx.strokeStyle = tower.type === "cannon" ? "#b23a22" : "#f4a261";
  ctx.lineWidth = 2;
  ctx.stroke();

  if (tower.type === "cannon") {
    // Cannon barrel
    ctx.save();
    ctx.translate(tower.x, tower.y);
    ctx.rotate(tower.angle);
    ctx.fillStyle = "#2b2d42";
    ctx.fillRect(0, -4.5, 18, 9);
    ctx.strokeStyle = "#1a1a2e";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(0, -4.5, 18, 9);
    // Muzzle ring
    ctx.fillStyle = "#e76f51";
    ctx.fillRect(15, -5.5, 3.5, 11);
    ctx.strokeRect(15, -5.5, 3.5, 11);
    ctx.restore();
  } else {
    // Arrow launcher pointer
    ctx.save();
    ctx.translate(tower.x, tower.y);
    ctx.rotate(tower.angle);
    ctx.strokeStyle = "#ffffff";
    ctx.fillStyle = "#ffffff";
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(-4, 0);
    ctx.lineTo(16, 0);
    ctx.stroke();

    // Arrowhead tip
    ctx.beginPath();
    ctx.moveTo(18, 0);
    ctx.lineTo(11, -5);
    ctx.lineTo(13, 0);
    ctx.lineTo(11, 5);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  ctx.restore();
}

export function drawTowers(
  ctx: CanvasRenderingContext2D,
  target: { towers: readonly Tower[] } | readonly Tower[],
): void {
  const list: readonly Tower[] = "towers" in target ? target.towers : target;
  for (const tower of list) {
    drawTower(ctx, tower);
  }
}
