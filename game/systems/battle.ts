import type { CreatureInstance, ElementType, Skill, StatKey, StatusEffect } from "../data/types";
import type { BossMechanic } from "../data/types";
import { getSpecies } from "../data/creatures";
import { getSkill } from "../data/skills";
import { effectivenessVs, effectivenessText } from "../data/typeChart";

// ---------------------------------------------------------------
// Battle-time wrapper around a CreatureInstance
// ---------------------------------------------------------------

export interface BattleCreature {
  inst: CreatureInstance;
  stages: Record<StatKey, number>; // -3..+3
  cooldowns: Record<string, number>; // skillId -> turns remaining
  statusTurns: number;
  /** boss-only state */
  bossHooks?: BossMechanic["hook"][];
  bossTurn?: number;
  usedHealOnce?: boolean;
  usedLastStand?: boolean;
}

export function makeBattleCreature(inst: CreatureInstance, bossHooks?: BossMechanic["hook"][]): BattleCreature {
  return {
    inst,
    stages: { hp: 0, attack: 0, defense: 0, magic: 0, speed: 0 },
    cooldowns: {},
    statusTurns: 0,
    bossHooks,
    bossTurn: 0,
    usedHealOnce: false,
    usedLastStand: false,
  };
}

export function stageMultiplier(stage: number): number {
  return stage >= 0 ? (2 + stage) / 2 : 2 / (2 - stage);
}

export function effectiveStat(bc: BattleCreature, key: Exclude<StatKey, "hp">): number {
  let value = bc.inst.stats[key] * stageMultiplier(bc.stages[key]);
  if (key === "attack" && bc.inst.status === "burn") value *= 0.7;
  if (key === "speed" && bc.inst.status === "stun") value *= 0.75;
  // boss enrage
  if (key === "attack" && bc.bossHooks?.includes("enrage_below_half") && bc.inst.currentHp <= bc.inst.stats.hp / 2) {
    value *= 1.35;
  }
  return Math.max(1, Math.floor(value));
}

const PHYSICAL_ANIMS = new Set(["slash", "quake", "burst"]);

export function isPhysical(skill: Skill): boolean {
  return PHYSICAL_ANIMS.has(skill.animation);
}

// ---------------------------------------------------------------
// Battle events — the engine emits a script the UI plays back
// ---------------------------------------------------------------

export type BattleEvent =
  | { type: "text"; text: string }
  | { type: "skill"; actor: "player" | "enemy"; skillId: string }
  | { type: "damage"; target: "player" | "enemy"; amount: number; crit: boolean; effectivenessMsg: string | null }
  | { type: "heal"; target: "player" | "enemy"; amount: number }
  | { type: "status"; target: "player" | "enemy"; status: StatusEffect | null }
  | { type: "stat"; target: "player" | "enemy"; statChanges: Partial<Record<StatKey, number>> }
  | { type: "faint"; target: "player" | "enemy" }
  | { type: "miss"; actor: "player" | "enemy" };

export interface AttackOutcome {
  events: BattleEvent[];
  targetFainted: boolean;
}

export const STATUS_LABEL: Record<StatusEffect, string> = {
  burn: "burned",
  freeze: "frozen solid",
  poison: "poisoned",
  sleep: "fast asleep",
  stun: "stunned",
};

function elementsOf(inst: CreatureInstance): [ElementType, ElementType | undefined] {
  const s = getSpecies(inst.speciesId);
  return [s.element, s.secondaryElement];
}

function nameOf(inst: CreatureInstance): string {
  return inst.nickname ?? getSpecies(inst.speciesId).name;
}

// ---------------------------------------------------------------
// Pre-turn status gate: can this creature act?
// ---------------------------------------------------------------

export interface StatusGate {
  canAct: boolean;
  events: BattleEvent[];
}

export function statusGate(bc: BattleCreature, side: "player" | "enemy", rng: () => number = Math.random): StatusGate {
  const inst = bc.inst;
  const events: BattleEvent[] = [];
  if (!inst.status) return { canAct: true, events };

  bc.statusTurns += 1;
  switch (inst.status) {
    case "freeze": {
      if (rng() < 0.25 || bc.statusTurns > 3) {
        inst.status = null;
        bc.statusTurns = 0;
        events.push({ type: "status", target: side, status: null });
        events.push({ type: "text", text: `${nameOf(inst)} thawed out!` });
        return { canAct: true, events };
      }
      events.push({ type: "text", text: `${nameOf(inst)} is frozen solid!` });
      return { canAct: false, events };
    }
    case "sleep": {
      if (rng() < 0.4 || bc.statusTurns > 3) {
        inst.status = null;
        bc.statusTurns = 0;
        events.push({ type: "status", target: side, status: null });
        events.push({ type: "text", text: `${nameOf(inst)} woke up!` });
        return { canAct: true, events };
      }
      events.push({ type: "text", text: `${nameOf(inst)} is fast asleep...` });
      return { canAct: false, events };
    }
    case "stun": {
      if (bc.statusTurns > 2) {
        inst.status = null;
        bc.statusTurns = 0;
        events.push({ type: "status", target: side, status: null });
        events.push({ type: "text", text: `${nameOf(inst)} shook off the stun!` });
        return { canAct: true, events };
      }
      if (rng() < 0.4) {
        events.push({ type: "text", text: `${nameOf(inst)} is stunned and can't move!` });
        return { canAct: false, events };
      }
      return { canAct: true, events };
    }
    default:
      return { canAct: true, events };
  }
}

/** End-of-turn damage from burn / poison. */
export function endOfTurnStatus(bc: BattleCreature, side: "player" | "enemy"): BattleEvent[] {
  const inst = bc.inst;
  const events: BattleEvent[] = [];
  if (inst.status === "burn" || inst.status === "poison") {
    const frac = inst.status === "burn" ? 0.06 : 0.1;
    const dmg = Math.max(1, Math.floor(inst.stats.hp * frac));
    inst.currentHp = Math.max(0, inst.currentHp - dmg);
    events.push({ type: "text", text: `${nameOf(inst)} is hurt by ${inst.status === "burn" ? "its burn" : "poison"}!` });
    events.push({ type: "damage", target: side, amount: dmg, crit: false, effectivenessMsg: null });
    if (inst.currentHp <= 0) events.push({ type: "faint", target: side });
  }
  return events;
}

// ---------------------------------------------------------------
// Skill execution
// ---------------------------------------------------------------

export function executeSkill(
  attacker: BattleCreature,
  defender: BattleCreature,
  skillId: string,
  attackerSide: "player" | "enemy",
  rng: () => number = Math.random
): AttackOutcome {
  const skill = getSkill(skillId);
  const defenderSide = attackerSide === "player" ? "enemy" : "player";
  const events: BattleEvent[] = [];
  const aName = nameOf(attacker.inst);
  const dName = nameOf(defender.inst);

  events.push({ type: "skill", actor: attackerSide, skillId });
  events.push({ type: "text", text: `${aName} used ${skill.name}!` });
  attacker.cooldowns[skillId] = skill.cooldown;

  // Heals & buffs target self
  if (skill.category === "heal") {
    const amount = Math.max(1, Math.floor(attacker.inst.stats.hp * (skill.healPercent ?? 30) / 100));
    attacker.inst.currentHp = Math.min(attacker.inst.stats.hp, attacker.inst.currentHp + amount);
    events.push({ type: "heal", target: attackerSide, amount });
    events.push({ type: "text", text: `${aName} restored ${amount} HP!` });
    return { events, targetFainted: false };
  }

  if (skill.category === "buff") {
    for (const [k, v] of Object.entries(skill.statChanges ?? {})) {
      attacker.stages[k as StatKey] = Math.max(-3, Math.min(3, attacker.stages[k as StatKey] + (v as number)));
    }
    events.push({ type: "stat", target: attackerSide, statChanges: skill.statChanges ?? {} });
    events.push({ type: "text", text: `${aName}'s power rises!` });
    return { events, targetFainted: false };
  }

  if (skill.category === "debuff") {
    if (rng() * 100 > skill.accuracy) {
      events.push({ type: "miss", actor: attackerSide });
      events.push({ type: "text", text: `But it missed!` });
      return { events, targetFainted: false };
    }
    const inverted: Partial<Record<StatKey, number>> = {};
    for (const [k, v] of Object.entries(skill.statChanges ?? {})) {
      defender.stages[k as StatKey] = Math.max(-3, Math.min(3, defender.stages[k as StatKey] + (v as number)));
      inverted[k as StatKey] = v as number;
    }
    events.push({ type: "stat", target: defenderSide, statChanges: inverted });
    events.push({ type: "text", text: `${dName}'s strength falters!` });
    return { events, targetFainted: false };
  }

  // ---- Damage skill ----
  if (rng() * 100 > skill.accuracy) {
    events.push({ type: "miss", actor: attackerSide });
    events.push({ type: "text", text: `${aName}'s attack missed!` });
    return { events, targetFainted: false };
  }

  const hits = skill.multiHit ?? 1;
  let totalDamage = 0;
  let fainted = false;

  for (let h = 0; h < hits && !fainted; h++) {
    const atkStat = isPhysical(skill) ? effectiveStat(attacker, "attack") : effectiveStat(attacker, "magic");
    const defStat = effectiveStat(defender, "defense");
    const level = attacker.inst.level;

    const [pe, se] = elementsOf(attacker.inst);
    const stab = skill.element === pe || skill.element === se ? 1.2 : 1;
    const [dpe, dse] = elementsOf(defender.inst);
    const eff = effectivenessVs(skill.element, dpe, dse);
    const critChance = 6.25 + (skill.critBonus ?? 0);
    const crit = rng() * 100 < critChance;
    const variance = 0.85 + rng() * 0.15;

    let dmg = Math.floor(
      (((2 * level) / 5 + 2) * skill.power * (atkStat / defStat) / 50 + 2) *
        stab * eff * (crit ? 1.5 : 1) * variance
    );
    dmg = Math.max(1, dmg);

    // Boss: last stand
    if (
      defender.bossHooks?.includes("last_stand") &&
      !defender.usedLastStand &&
      defender.inst.currentHp - dmg <= 0
    ) {
      defender.usedLastStand = true;
      dmg = defender.inst.currentHp - 1;
      defender.inst.currentHp = 1;
      events.push({ type: "damage", target: defenderSide, amount: dmg, crit, effectivenessMsg: effectivenessText(eff) });
      events.push({ type: "text", text: `${dName} refuses to fall! It clings on with 1 HP!` });
      totalDamage += dmg;
      continue;
    }

    defender.inst.currentHp = Math.max(0, defender.inst.currentHp - dmg);
    totalDamage += dmg;
    events.push({ type: "damage", target: defenderSide, amount: dmg, crit, effectivenessMsg: effectivenessText(eff) });
    if (crit) events.push({ type: "text", text: "A critical hit!" });
    if (defender.inst.currentHp <= 0) {
      fainted = true;
      events.push({ type: "faint", target: defenderSide });
      events.push({ type: "text", text: `${dName} fainted!` });
    }
  }

  // Drain
  if (skill.drainPercent && totalDamage > 0) {
    const healed = Math.max(1, Math.floor((totalDamage * skill.drainPercent) / 100));
    attacker.inst.currentHp = Math.min(attacker.inst.stats.hp, attacker.inst.currentHp + healed);
    events.push({ type: "heal", target: attackerSide, amount: healed });
    events.push({ type: "text", text: `${aName} drained ${healed} HP!` });
  }

  // Status infliction
  if (!fainted && skill.statusEffect && !defender.inst.status && rng() * 100 < (skill.statusChance ?? 0)) {
    defender.inst.status = skill.statusEffect;
    defender.statusTurns = 0;
    events.push({ type: "status", target: defenderSide, status: skill.statusEffect });
    events.push({ type: "text", text: `${dName} is ${STATUS_LABEL[skill.statusEffect]}!` });
  }

  // Boss: reflect
  if (defender.bossHooks?.includes("reflect") && totalDamage > 0 && defender.inst.currentHp > 0) {
    const reflected = Math.max(1, Math.floor(totalDamage * 0.2));
    attacker.inst.currentHp = Math.max(0, attacker.inst.currentHp - reflected);
    events.push({ type: "text", text: `${dName} reflects ${reflected} damage back!` });
    events.push({ type: "damage", target: attackerSide, amount: reflected, crit: false, effectivenessMsg: null });
    if (attacker.inst.currentHp <= 0) {
      events.push({ type: "faint", target: attackerSide });
      events.push({ type: "text", text: `${aName} fainted!` });
    }
  }

  return { events, targetFainted: fainted };
}

// ---------------------------------------------------------------
// Boss turn hooks (run at the start of the boss's turn)
// ---------------------------------------------------------------

const AURA_STATUS: Partial<Record<ElementType, StatusEffect>> = {
  fire: "burn",
  ice: "freeze",
  electric: "stun",
  nature: "poison",
  shadow: "sleep",
  earth: "stun",
  water: "freeze",
  wind: "stun",
  light: "burn",
};

export function runBossHooks(
  boss: BattleCreature,
  opponent: BattleCreature,
  bossSide: "player" | "enemy",
  rng: () => number = Math.random
): BattleEvent[] {
  if (!boss.bossHooks) return [];
  const events: BattleEvent[] = [];
  const oppSide = bossSide === "player" ? "enemy" : "player";
  boss.bossTurn = (boss.bossTurn ?? 0) + 1;
  const bName = nameOf(boss.inst);

  if (boss.bossHooks.includes("shield_every_3") && boss.bossTurn % 3 === 0) {
    boss.stages.defense = Math.min(3, boss.stages.defense + 1);
    events.push({ type: "stat", target: bossSide, statChanges: { defense: 1 } });
    events.push({ type: "text", text: `${bName}'s guard hardens!` });
  }
  if (boss.bossHooks.includes("speed_ramp")) {
    boss.stages.speed = Math.min(3, boss.stages.speed + 1);
    events.push({ type: "text", text: `${bName} grows even faster!` });
  }
  if (
    boss.bossHooks.includes("heal_once") &&
    !boss.usedHealOnce &&
    boss.inst.currentHp <= boss.inst.stats.hp * 0.3
  ) {
    boss.usedHealOnce = true;
    const amount = Math.floor(boss.inst.stats.hp * 0.4);
    boss.inst.currentHp = Math.min(boss.inst.stats.hp, boss.inst.currentHp + amount);
    events.push({ type: "heal", target: bossSide, amount });
    events.push({ type: "text", text: `${bName} draws on ancient power and recovers ${amount} HP!` });
  }
  if (boss.bossHooks.includes("status_aura") && !opponent.inst.status && rng() < 0.3) {
    const species = getSpecies(boss.inst.speciesId);
    const aura = AURA_STATUS[species.element];
    if (aura) {
      opponent.inst.status = aura;
      opponent.statusTurns = 0;
      events.push({ type: "status", target: oppSide, status: aura });
      events.push({ type: "text", text: `${bName}'s aura overwhelms ${nameOf(opponent.inst)} — ${STATUS_LABEL[aura]}!` });
    }
  }
  return events;
}

/** Does this boss attack twice this turn? */
export function bossStrikesTwice(boss: BattleCreature): boolean {
  return !!boss.bossHooks?.includes("double_strike") && boss.inst.currentHp >= boss.inst.stats.hp * 0.7;
}

// ---------------------------------------------------------------
// Enemy AI
// ---------------------------------------------------------------

export function chooseEnemySkill(
  enemy: BattleCreature,
  player: BattleCreature,
  smart: boolean,
  rng: () => number = Math.random
): string {
  const usable = enemy.inst.skills.filter((id) => (enemy.cooldowns[id] ?? 0) <= 0);
  const pool = usable.length ? usable : enemy.inst.skills;
  if (!smart) return pool[Math.floor(rng() * pool.length)];

  // Smart AI: heal when low, otherwise pick highest expected damage.
  const healSkill = pool.find((id) => getSkill(id).category === "heal");
  if (healSkill && enemy.inst.currentHp < enemy.inst.stats.hp * 0.35 && rng() < 0.7) return healSkill;

  const [dpe, dse] = elementsOf(player.inst);
  let best = pool[0];
  let bestScore = -1;
  for (const id of pool) {
    const s = getSkill(id);
    if (s.category !== "damage") {
      // occasionally buff/debuff early in the fight
      if (enemy.bossTurn !== undefined && enemy.bossTurn <= 1 && rng() < 0.3) return id;
      continue;
    }
    const eff = effectivenessVs(s.element, dpe, dse);
    const score = s.power * eff * (s.accuracy / 100) * (s.multiHit ?? 1);
    if (score > bestScore) {
      bestScore = score;
      best = id;
    }
  }
  return best;
}

// ---------------------------------------------------------------
// Turn order & escape
// ---------------------------------------------------------------

export function playerActsFirst(player: BattleCreature, enemy: BattleCreature, rng: () => number = Math.random): boolean {
  const ps = effectiveStat(player, "speed");
  const es = effectiveStat(enemy, "speed");
  if (ps === es) return rng() < 0.5;
  return ps > es;
}

export function escapeChance(player: BattleCreature, enemy: BattleCreature): number {
  const ps = effectiveStat(player, "speed");
  const es = effectiveStat(enemy, "speed");
  return Math.min(0.95, Math.max(0.25, 0.55 + (ps - es) / 150));
}

export function tickCooldowns(bc: BattleCreature): void {
  for (const k of Object.keys(bc.cooldowns)) {
    if (bc.cooldowns[k] > 0) bc.cooldowns[k] -= 1;
  }
}
