import type { CreatureInstance, EvolutionBranch } from "../data/types";
import { getSpecies } from "../data/creatures";
import { skillsAtLevel, statsAtLevel } from "./leveling";

export interface EvolutionCheckContext {
  /** item being used on the creature, if any */
  usedItemId?: string;
  /** ids of completed quests */
  completedQuests: Set<string>;
}

/** Returns the evolution branch this creature is currently eligible for, if any. */
export function eligibleEvolution(inst: CreatureInstance, ctx: EvolutionCheckContext): EvolutionBranch | null {
  const species = getSpecies(inst.speciesId);
  for (const evo of species.evolutions) {
    switch (evo.method) {
      case "level":
        if (!ctx.usedItemId && inst.level >= Number(evo.param)) return evo;
        break;
      case "item":
        if (ctx.usedItemId && ctx.usedItemId === evo.param) return evo;
        break;
      case "friendship":
        if (!ctx.usedItemId && inst.friendship >= Number(evo.param)) return evo;
        break;
      case "quest":
        if (!ctx.usedItemId && ctx.completedQuests.has(String(evo.param))) return evo;
        break;
    }
  }
  return null;
}

/** Mutates the instance into its evolved form. Returns the new species id. */
export function applyEvolution(inst: CreatureInstance, branch: EvolutionBranch): string {
  const newSpecies = getSpecies(branch.toSpeciesId);
  const hpRatio = inst.currentHp / inst.stats.hp;
  inst.speciesId = newSpecies.id;
  inst.stats = statsAtLevel(newSpecies, inst.level);
  inst.currentHp = Math.max(1, Math.floor(inst.stats.hp * hpRatio));
  // Merge in the evolved form's signature skills.
  const evolvedSkills = skillsAtLevel(newSpecies, inst.level);
  for (const s of evolvedSkills) {
    if (!inst.skills.includes(s)) {
      if (inst.skills.length >= 4) inst.skills.shift();
      inst.skills.push(s);
    }
  }
  inst.friendship = Math.min(255, inst.friendship + 10);
  return newSpecies.id;
}
