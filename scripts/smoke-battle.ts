/* Engine smoke test — simulates battles end-to-end without the UI.
   Run with: npx tsx scripts/smoke-battle.ts */
import { createInstance, grantXp, xpReward } from "../game/systems/leveling";
import { makeBattleCreature, executeSkill, chooseEnemySkill, statusGate, endOfTurnStatus, runBossHooks, playerActsFirst, tickCooldowns } from "../game/systems/battle";
import { attemptCapture } from "../game/systems/capture";
import { eligibleEvolution, applyEvolution } from "../game/systems/evolution";
import { getSpecies } from "../game/data/creatures";
import { BOSSES } from "../game/data/bosses";

let failures = 0;
const check = (cond: boolean, msg: string) => {
  if (!cond) {
    failures++;
    console.error("  ✗ " + msg);
  } else console.log("  ✓ " + msg);
};

// ---- 1. Simulated wild battle ----
console.log("Wild battle: sproutling L10 vs mossling L5");
{
  const a = makeBattleCreature(createInstance("sproutling", 10));
  const b = makeBattleCreature(createInstance("mossling", 5));
  let turns = 0;
  while (a.inst.currentHp > 0 && b.inst.currentHp > 0 && turns < 50) {
    turns++;
    tickCooldowns(a); tickCooldowns(b);
    const order = playerActsFirst(a, b) ? [a, b] : [b, a];
    for (const actor of order) {
      const target = actor === a ? b : a;
      if (actor.inst.currentHp <= 0 || target.inst.currentHp <= 0) continue;
      const gate = statusGate(actor, actor === a ? "player" : "enemy");
      if (!gate.canAct) continue;
      const skill = chooseEnemySkill(actor, target, false);
      executeSkill(actor, target, skill, actor === a ? "player" : "enemy");
    }
    endOfTurnStatus(a, "player");
    endOfTurnStatus(b, "enemy");
  }
  check(turns < 50, `battle resolves (${turns} turns)`);
  check(b.inst.currentHp <= 0, "higher-level creature wins");
}

// ---- 2. XP & level-up & evolution ----
console.log("Progression: level-ups and evolution");
{
  const c = createInstance("sproutling", 15);
  const before = c.level;
  grantXp(c, xpReward("thornhide", 30, true) * 10);
  check(c.level > before, `gains levels (${before} → ${c.level})`);
  const evo = eligibleEvolution(c, { completedQuests: new Set() });
  check(!!evo && evo.toSpeciesId === "florabeast", "evolution unlocks at threshold");
  if (evo) {
    applyEvolution(c, evo);
    check(c.speciesId === "florabeast", "evolution applies");
    check(c.currentHp > 0 && c.currentHp <= c.stats.hp, "HP stays valid after evolution");
  }
}

// ---- 3. Branch + item evolution ----
console.log("Branch evolution: branchling + charms");
{
  const c = createInstance("branchling", 10);
  const sun = eligibleEvolution(c, { usedItemId: "sun-charm", completedQuests: new Set() });
  const moon = eligibleEvolution(c, { usedItemId: "moon-charm", completedQuests: new Set() });
  check(sun?.toSpeciesId === "solivine", "sun charm → solivine");
  check(moon?.toSpeciesId === "lunivine", "moon charm → lunivine");
  const none = eligibleEvolution(c, { completedQuests: new Set() });
  check(!none, "no evolution without the item");
}

// ---- 4. Capture odds ----
console.log("Capture: odds respond to HP / orb / status");
{
  const target = createInstance("mossling", 5);
  let fullHp = 0, lowHp = 0, lowHpUltra = 0;
  const N = 4000;
  for (let i = 0; i < N; i++) {
    target.currentHp = target.stats.hp;
    if (attemptCapture(target, "basic-orb").success) fullHp++;
    target.currentHp = 1;
    if (attemptCapture(target, "basic-orb").success) lowHp++;
    if (attemptCapture(target, "ultra-orb").success) lowHpUltra++;
  }
  check(lowHp > fullHp, `low HP helps (${(lowHp / N * 100).toFixed(0)}% vs ${(fullHp / N * 100).toFixed(0)}%)`);
  check(lowHpUltra >= lowHp, `better orb helps (${(lowHpUltra / N * 100).toFixed(0)}%)`);
  const legend = createInstance("luxorath", 44);
  legend.currentHp = legend.stats.hp;
  let legendCaught = 0;
  for (let i = 0; i < N; i++) if (attemptCapture(legend, "basic-orb").success) legendCaught++;
  check(legendCaught / N < 0.1, `legendary at full HP is hard (${(legendCaught / N * 100).toFixed(1)}%)`);
}

// ---- 5. Boss mechanics sanity: every boss is beatable by an appropriately-leveled party ----
// A real player picks a type counter and carries potions; model that.
// Small party (a real player carries six): a bulky wall + offensive counters.
const PARTY: Record<string, string[]> = {
  "boss-verdant": ["solfang", "leviadon"], // fire vs nature
  "boss-cavern": ["leviadon", "elderbloom"], // water/nature vs earth
  "boss-desert": ["avalanchor", "leviadon"], // ice vs earth/wind
  "boss-frozen": ["solfang", "titanstone"], // fire vs ice
  "boss-thunder": ["titanstone", "leviadon"], // earth vs electric
  "boss-sky": ["leviadon", "nyxfiend"], // bulk + shadow burst vs light
  "boss-gate": ["seraphlume", "leviadon"], // light vs shadow
  "boss-final": ["leviadon", "seraphlume", "luxorath"], // the finale warrants a fuller team
};
console.log("Bosses: beatable at +4 levels with a small party and potions");
for (const boss of BOSSES) {
  const lvl = Math.min(60, boss.level + 4);
  const party = PARTY[boss.id].map((id) => makeBattleCreature(createInstance(id, lvl)));
  let hero = party[0];
  const inst = createInstance(boss.speciesId, boss.level);
  inst.stats = { ...inst.stats, hp: Math.floor(inst.stats.hp * 1.5) };
  inst.currentHp = inst.stats.hp;
  const foe = makeBattleCreature(inst, boss.mechanics.map((m) => m.hook));
  let turns = 0;
  let heroWon = false;
  let potions = 6;
  let revives = 2; // endgame players carry Revive Embers
  while (turns < 100) {
    turns++;
    tickCooldowns(hero); tickCooldowns(foe);
    // hero turn: drink a Large Potion when low (a turn spent, like real play)
    const hg = statusGate(hero, "player");
    if (hg.canAct) {
      if (potions > 0 && hero.inst.currentHp < hero.inst.stats.hp * 0.35) {
        potions--;
        hero.inst.currentHp = Math.min(hero.inst.stats.hp, hero.inst.currentHp + 120);
        hero.inst.status = null; // panacea-style top-up
      } else {
        const s = chooseEnemySkill(hero, foe, true);
        executeSkill(hero, foe, s, "player");
      }
    }
    if (foe.inst.currentHp <= 0) { heroWon = true; break; }
    // boss turn
    runBossHooks(foe, hero, "enemy");
    const fg = statusGate(foe, "enemy");
    if (fg.canAct) {
      const s = chooseEnemySkill(foe, hero, true);
      executeSkill(foe, hero, s, "enemy");
    }
    endOfTurnStatus(hero, "player");
    endOfTurnStatus(foe, "enemy");
    if (foe.inst.currentHp <= 0) { heroWon = true; break; }
    if (hero.inst.currentHp <= 0) {
      const next = party.find((c) => c.inst.currentHp > 0);
      if (next) {
        hero = next; // switch in (boss already acted this turn)
      } else if (revives > 0) {
        revives--;
        hero.inst.currentHp = Math.floor(hero.inst.stats.hp / 2);
        hero.inst.status = null;
      } else break;
    }
  }
  check(heroWon, `${boss.name} (${getSpecies(boss.speciesId).name} L${boss.level}) beatable in ${turns} turns (${6 - potions} potions)`);
}

if (failures) {
  console.error(`\n❌ ${failures} smoke failure(s)`);
  process.exit(1);
}
console.log("\n✅ Engine smoke test passed");
