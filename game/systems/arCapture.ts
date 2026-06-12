/**
 * AR Capture — spawn logic and capture math for the camera-overlay mode.
 *
 * Capture chance builds on the core formula (species rate × HP × orb) and
 * adds two AR-only skill factors:
 *   aimFactor   — how close the thrown orb lands to the monster's center
 *   depthFactor — monsters drift near/far; throws while it is close land harder
 */
import type { CreatureInstance } from "../data/types";
import { getSpecies } from "../data/creatures";
import { getItem } from "../data/items";
import { getMap } from "../data/maps";
import { createInstance } from "./leveling";

export const AR_MAX_THROWS = 6;

/** Weighted AR spawn for the player's current map.
 *  Embercub is AR-exclusive and can appear anywhere (~18%). */
export function spawnArCreature(mapId: string, partyLevel: number): CreatureInstance {
  const map = getMap(mapId);
  if (Math.random() < 0.18 || map.encounters.length === 0) {
    const level = Math.max(3, Math.min(40, partyLevel - 1 + Math.floor(Math.random() * 4)));
    return createInstance("embercub", level);
  }
  const total = map.encounters.reduce((s, e) => s + e.weight, 0);
  let roll = Math.random() * total;
  const entry =
    map.encounters.find((e) => {
      roll -= e.weight;
      return roll <= 0;
    }) ?? map.encounters[0];
  const level = entry.minLevel + Math.floor(Math.random() * (entry.maxLevel - entry.minLevel + 1));
  return createInstance(entry.speciesId, level);
}

export interface ArThrowInput {
  /** 0 = orb landed dead-center on the monster, 1 = grazed the edge */
  aimError: number;
  /** 0 = monster at its farthest, 1 = at its nearest */
  depth: number;
}

export interface ArThrowResult {
  outcome: "miss" | "broke-free" | "captured";
  shakes: number;
  chance: number;
}

export function arCaptureChance(target: CreatureInstance, orbItemId: string, t: ArThrowInput): number {
  const species = getSpecies(target.speciesId);
  const orb = getItem(orbItemId);
  const orbPower = orb.orbPower ?? 1;
  const hpFactor = (3 * target.stats.hp - 2 * target.currentHp) / (3 * target.stats.hp);
  const statusBonus =
    target.status === "sleep" || target.status === "freeze" ? 2 : target.status ? 1.5 : 1;
  const aimFactor = 1.15 - t.aimError * 0.55; // 1.15 bullseye … 0.6 graze
  const depthFactor = 0.8 + t.depth * 0.4; // 0.8 far … 1.2 near
  const raw = (species.captureRate / 255) * hpFactor * statusBonus * orbPower * aimFactor * depthFactor;
  return Math.min(0.95, Math.max(0.03, raw));
}

export function resolveArThrow(
  target: CreatureInstance,
  orbItemId: string,
  t: ArThrowInput,
  rng: () => number = Math.random
): ArThrowResult {
  // A throw far off-target whiffs entirely — no capture roll.
  if (t.aimError > 1) return { outcome: "miss", shakes: 0, chance: 0 };
  const chance = arCaptureChance(target, orbItemId, t);
  const success = rng() < chance;
  let shakes: number;
  if (success) shakes = 3;
  else {
    const closeness = rng() * chance * 1.4;
    shakes = closeness > chance * 0.9 ? 3 : closeness > chance * 0.45 ? 2 : 1;
  }
  return { outcome: success ? "captured" : "broke-free", shakes, chance };
}
