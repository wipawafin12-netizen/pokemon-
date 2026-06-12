import type { CreatureInstance } from "../data/types";
import { getSpecies } from "../data/creatures";
import { getItem } from "../data/items";

export interface CaptureResult {
  success: boolean;
  /** how many shakes the orb makes before the verdict (1..3) */
  shakes: number;
  chance: number;
}

/**
 * Capture chance: species capture rate, scaled by missing HP,
 * status effect bonus and orb power.
 */
export function captureChance(target: CreatureInstance, orbItemId: string): number {
  const species = getSpecies(target.speciesId);
  const orb = getItem(orbItemId);
  const orbPower = orb.orbPower ?? 1;
  const hpFactor = (3 * target.stats.hp - 2 * target.currentHp) / (3 * target.stats.hp); // 1/3 .. 1
  const statusBonus =
    target.status === "sleep" || target.status === "freeze" ? 2 :
    target.status ? 1.5 : 1;
  const raw = (species.captureRate / 255) * hpFactor * statusBonus * orbPower;
  return Math.min(0.95, Math.max(0.03, raw));
}

export function attemptCapture(target: CreatureInstance, orbItemId: string, rng: () => number = Math.random): CaptureResult {
  const chance = captureChance(target, orbItemId);
  const success = rng() < chance;
  // Near misses shake more — sells the drama.
  let shakes: number;
  if (success) shakes = 3;
  else {
    const closeness = rng() * chance * 1.4;
    shakes = closeness > chance * 0.9 ? 3 : closeness > chance * 0.45 ? 2 : 1;
  }
  return { success, shakes, chance };
}
