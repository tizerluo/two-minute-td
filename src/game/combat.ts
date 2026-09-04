import { CELL } from "./map";
import type { Enemy } from "./enemy";
import { DamageType } from "../data/towers";

export type { DamageType };

/**
 * Calculates effective damage after applying target mitigation rules.
 * - For "single" damage type, multiplies damage by target's singleDamageMult (default 1).
 * - For "splash" damage type, deals full damage without single-target mitigation.
 */
export function calculateDamage(
  amount: number,
  damageType?: DamageType,
  target?: { singleDamageMult?: number },
): number;
export function calculateDamage(
  target: { singleDamageMult?: number },
  amount: number,
  damageType?: DamageType,
): number;
export function calculateDamage(
  arg1: number | { singleDamageMult?: number },
  arg2?: DamageType | number | { singleDamageMult?: number },
  arg3?: DamageType | { singleDamageMult?: number },
): number {
  let amount = 0;
  let damageType: DamageType = "single";
  let target: { singleDamageMult?: number } | undefined;

  if (typeof arg1 === "number") {
    amount = arg1;
    if (typeof arg2 === "string") {
      damageType = arg2 as DamageType;
      if (arg3 && typeof arg3 === "object") {
        target = arg3;
      }
    } else if (arg2 && typeof arg2 === "object") {
      target = arg2;
      if (typeof arg3 === "string") {
        damageType = arg3 as DamageType;
      }
    }
  } else {
    target = arg1;
    if (typeof arg2 === "number") {
      amount = arg2;
    }
    if (typeof arg3 === "string") {
      damageType = arg3 as DamageType;
    }
  }

  const normalizedType = String(damageType).toLowerCase();
  if (normalizedType === "single") {
    const mult = target?.singleDamageMult ?? 1;
    return amount * mult;
  }
  return amount;
}

export const calculateEffectiveDamage = calculateDamage;

/**
 * Applies damage to an enemy, factoring in damageType mitigation.
 * Marks enemy as dead if hp drops to 0 or below, triggering onKill callback.
 * Returns true if the enemy was killed by this damage.
 */
export function applyDamage(
  enemy: Enemy,
  amount: number,
  arg3?: DamageType | ((enemy: Enemy) => void),
  arg4?: ((enemy: Enemy) => void) | DamageType,
): boolean {
  if (enemy.dead || enemy.leaked) return false;

  let damageType: DamageType = "single";
  let onKill: ((enemy: Enemy) => void) | undefined;

  if (typeof arg3 === "function") {
    onKill = arg3;
    if (typeof arg4 === "string") {
      damageType = arg4 as DamageType;
    }
  } else if (typeof arg3 === "string") {
    damageType = arg3 as DamageType;
    if (typeof arg4 === "function") {
      onKill = arg4;
    }
  } else if (typeof arg4 === "function") {
    onKill = arg4;
  } else if (typeof arg4 === "string") {
    damageType = arg4 as DamageType;
  }

  const effectiveDamage = calculateDamage(amount, damageType, enemy);
  enemy.hp -= effectiveDamage;

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

export const damageEnemy = applyDamage;

/**
 * Applies splash damage to primary target and all enemies within splashRadius (cells or px).
 * - Primary target is hit with splash damage.
 * - All other active enemies within splashRadius from primary target are hit with splash damage.
 * - Splash damage ignores singleDamageMult (deals full damage).
 * - Invokes onKill for each enemy killed.
 * Returns array of enemies killed by this splash attack.
 */
export function applySplashDamage(
  target: Enemy | { x: number; y: number; id?: number },
  arg2: readonly Enemy[] | number,
  arg3?: number | readonly Enemy[] | ((enemy: Enemy) => void),
  arg4?: number | readonly Enemy[] | ((enemy: Enemy) => void),
  arg5?: (enemy: Enemy) => void,
): Enemy[] {
  let enemies: readonly Enemy[] = [];
  let damage = 0;
  let splashRadius = 1.5;
  let onKill: ((enemy: Enemy) => void) | undefined;

  // Determine arguments based on types
  if (Array.isArray(arg2)) {
    // Signature: (target, enemies, damage, splashRadius?, onKill?)
    enemies = arg2;
    if (typeof arg3 === "number") {
      damage = arg3;
    }
    if (typeof arg4 === "number") {
      splashRadius = arg4;
      if (typeof arg5 === "function") {
        onKill = arg5;
      }
    } else if (typeof arg4 === "function") {
      onKill = arg4;
    }
  } else if (typeof arg2 === "number") {
    // Signature: (target, damage, splashRadius?, enemies?, onKill?)
    // or: (target, damage, enemies, splashRadius?, onKill?)
    damage = arg2;
    if (Array.isArray(arg3)) {
      enemies = arg3;
      if (typeof arg4 === "number") {
        splashRadius = arg4;
        if (typeof arg5 === "function") {
          onKill = arg5;
        }
      } else if (typeof arg4 === "function") {
        onKill = arg4;
      }
    } else if (typeof arg3 === "number") {
      splashRadius = arg3;
      if (Array.isArray(arg4)) {
        enemies = arg4;
        if (typeof arg5 === "function") {
          onKill = arg5;
        }
      } else if (typeof arg4 === "function") {
        onKill = arg4;
      }
    } else if (typeof arg3 === "function") {
      onKill = arg3;
    }
  }

  const radiusPx = splashRadius <= 10 ? splashRadius * CELL : splashRadius;
  const killed: Enemy[] = [];

  const handleKill = (enemy: Enemy) => {
    killed.push(enemy);
    if (onKill) {
      onKill(enemy);
    }
  };

  const isEnemy = "hp" in target && typeof (target as Enemy).hp === "number";
  const targetEnemy = isEnemy ? (target as Enemy) : null;

  // 1. Damage primary target
  if (targetEnemy && !targetEnemy.dead && !targetEnemy.leaked) {
    applyDamage(targetEnemy, damage, "splash", handleKill);
  }

  // 2. Damage other active enemies within splash radius
  const originX = target.x;
  const originY = target.y;
  const primaryId = targetEnemy ? targetEnemy.id : ("id" in target ? (target as { id?: number }).id : undefined);

  for (const enemy of enemies) {
    if (primaryId !== undefined && enemy.id === primaryId) {
      continue;
    }
    if (enemy.dead || enemy.leaked || enemy.spawnDelay > 0) {
      continue;
    }
    const dist = Math.hypot(enemy.x - originX, enemy.y - originY);
    if (dist <= radiusPx) {
      applyDamage(enemy, damage, "splash", handleKill);
    }
  }

  return killed;
}
