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
