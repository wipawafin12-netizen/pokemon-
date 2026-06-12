import type { CreatureInstance, CreatureSpecies, Stats } from "../data/types";
import { getSpecies } from "../data/creatures";

export const MAX_LEVEL = 60;
export const MAX_PARTY = 6;

/** Total XP required to BE at a given level (cubic curve). */
export function xpForLevel(level: number): number {
  return level * level * level;
}

export function xpToNext(inst: CreatureInstance): number {
  return xpForLevel(inst.level + 1) - inst.xp;
}

/** Stat values at a given level from species base stats. */
export function statsAtLevel(species: CreatureSpecies, level: number): Stats {
  const grow = (base: number) => Math.floor((2 * base * level) / 100) + 5;
  return {
    hp: Math.floor((2 * species.baseStats.hp * level) / 100) + level + 10,
    attack: grow(species.baseStats.attack),
    defense: grow(species.baseStats.defense),
    magic: grow(species.baseStats.magic),
    speed: grow(species.baseStats.speed),
  };
}

/** Skills a species knows at a level (latest 4). */
export function skillsAtLevel(species: CreatureSpecies, level: number): string[] {
  return species.learnset
    .filter((l) => l.level <= level)
    .slice(-4)
    .map((l) => l.skillId);
}

let uidCounter = 0;
export function newUid(): string {
  uidCounter += 1;
  return `c${Date.now().toString(36)}-${uidCounter.toString(36)}-${Math.floor(Math.random() * 1e6).toString(36)}`;
}

export function createInstance(speciesId: string, level: number, opts: Partial<CreatureInstance> = {}): CreatureInstance {
  const species = getSpecies(speciesId);
  const lvl = Math.max(1, Math.min(MAX_LEVEL, level));
  const stats = statsAtLevel(species, lvl);
  return {
    uid: newUid(),
    speciesId,
    level: lvl,
    xp: xpForLevel(lvl),
    currentHp: stats.hp,
    stats,
    skills: skillsAtLevel(species, lvl),
    status: null,
    friendship: 70,
    isShiny: Math.random() < 1 / 256,
    ...opts,
  };
}

export interface LevelUpResult {
  levelsGained: number;
  newSkills: string[];
}

/** Grant XP; handles multi-level-ups, stat growth and skill learning. */
export function grantXp(inst: CreatureInstance, amount: number): LevelUpResult {
  const species = getSpecies(inst.speciesId);
  const result: LevelUpResult = { levelsGained: 0, newSkills: [] };
  inst.xp += amount;
  while (inst.level < MAX_LEVEL && inst.xp >= xpForLevel(inst.level + 1)) {
    inst.level += 1;
    result.levelsGained += 1;
    const before = inst.stats;
    const after = statsAtLevel(species, inst.level);
    const hpGain = after.hp - before.hp;
    inst.stats = after;
    inst.currentHp = Math.min(after.hp, inst.currentHp + hpGain);
    inst.friendship = Math.min(255, inst.friendship + 3);
    for (const l of species.learnset) {
      if (l.level === inst.level && !inst.skills.includes(l.skillId)) {
        if (inst.skills.length >= 4) inst.skills.shift();
        inst.skills.push(l.skillId);
        result.newSkills.push(l.skillId);
      }
    }
  }
  return result;
}

/** XP earned for defeating an enemy. */
export function xpReward(enemySpeciesId: string, enemyLevel: number, vsTrainer: boolean): number {
  const species = getSpecies(enemySpeciesId);
  const base = (species.baseXp * enemyLevel) / 7;
  return Math.max(1, Math.floor(base * (vsTrainer ? 1.3 : 1)));
}
