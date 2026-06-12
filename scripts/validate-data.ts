/* Data integrity validator — run with: npx tsx scripts/validate-data.ts */
import { CREATURES, SPECIES_MAP } from "../game/data/creatures";
import { SKILLS, SKILL_MAP } from "../game/data/skills";
import { ITEMS, ITEM_MAP } from "../game/data/items";
import { NPCS, NPC_MAP } from "../game/data/npcs";
import { TRAINERS, TRAINER_MAP } from "../game/data/trainers";
import { BOSSES, BOSS_MAP } from "../game/data/bosses";
import { QUESTS, QUEST_MAP } from "../game/data/quests";
import { MAPS, isWalkable } from "../game/data/maps";
import { SHOPS } from "../game/data/shops";

const errors: string[] = [];
const err = (msg: string) => errors.push(msg);

// ---- Counts ----
// 50 core species + AR-exclusive Embercub (#51)
if (CREATURES.length !== 51) err(`Expected 51 creatures, got ${CREATURES.length}`);
if (SKILLS.length < 100) err(`Expected >=100 skills, got ${SKILLS.length}`);
if (NPCS.length !== 30) err(`Expected 30 NPCs, got ${NPCS.length}`);
if (TRAINERS.length !== 20) err(`Expected 20 trainers, got ${TRAINERS.length}`);
if (BOSSES.length !== 8) err(`Expected 8 bosses, got ${BOSSES.length}`);

// ---- Unique ids ----
function checkUnique(label: string, ids: string[]) {
  const seen = new Set<string>();
  for (const id of ids) {
    if (seen.has(id)) err(`Duplicate ${label} id: ${id}`);
    seen.add(id);
  }
}
checkUnique("creature", CREATURES.map((c) => c.id));
checkUnique("skill", SKILLS.map((s) => s.id));
checkUnique("item", ITEMS.map((i) => i.id));
checkUnique("npc", NPCS.map((n) => n.id));
checkUnique("trainer", TRAINERS.map((t) => t.id));
checkUnique("boss", BOSSES.map((b) => b.id));
checkUnique("quest", QUESTS.map((q) => q.id));
checkUnique("dexNumber", CREATURES.map((c) => String(c.dexNumber)));

// ---- Creatures ----
for (const c of CREATURES) {
  for (const l of c.learnset) {
    if (!SKILL_MAP[l.skillId]) err(`${c.id}: unknown skill ${l.skillId}`);
  }
  if (c.learnset.length === 0 || c.learnset[0].level !== 1) err(`${c.id}: must learn a skill at level 1`);
  for (const e of c.evolutions) {
    if (!SPECIES_MAP[e.toSpeciesId]) err(`${c.id}: unknown evolution target ${e.toSpeciesId}`);
    if (e.method === "item" && !ITEM_MAP[String(e.param)]) err(`${c.id}: unknown evolution item ${e.param}`);
    if (e.method === "quest" && !QUEST_MAP[String(e.param)]) err(`${c.id}: unknown evolution quest ${e.param}`);
  }
}

// ---- NPCs ----
for (const n of NPCS) {
  if (n.questId && !QUEST_MAP[n.questId]) err(`${n.id}: unknown quest ${n.questId}`);
  if (n.shopId && !SHOPS.find((s) => s.id === n.shopId)) err(`${n.id}: unknown shop ${n.shopId}`);
}

// ---- Trainers / Bosses ----
for (const t of TRAINERS) {
  for (const m of t.team) if (!SPECIES_MAP[m.speciesId]) err(`${t.id}: unknown species ${m.speciesId}`);
  for (const r of t.rewardItems ?? []) if (!ITEM_MAP[r.itemId]) err(`${t.id}: unknown reward item ${r.itemId}`);
}
for (const b of BOSSES) {
  if (!SPECIES_MAP[b.speciesId]) err(`${b.id}: unknown species ${b.speciesId}`);
  for (const r of b.rewardItems) if (!ITEM_MAP[r.itemId]) err(`${b.id}: unknown reward item ${r.itemId}`);
}

// ---- Quests ----
for (const q of QUESTS) {
  if (q.requires && !QUEST_MAP[q.requires]) err(`${q.id}: unknown prereq ${q.requires}`);
  if (q.giverNpcId && !NPC_MAP[q.giverNpcId]) err(`${q.id}: unknown giver ${q.giverNpcId}`);
  for (const r of q.rewardItems ?? []) if (!ITEM_MAP[r.itemId]) err(`${q.id}: unknown reward item ${r.itemId}`);
  for (const o of q.objectives) {
    if (o.kind === "talk" && !NPC_MAP[o.npcId]) err(`${q.id}: unknown npc ${o.npcId}`);
    if (o.kind === "defeat_trainer" && !TRAINER_MAP[o.trainerId]) err(`${q.id}: unknown trainer ${o.trainerId}`);
    if (o.kind === "defeat_boss" && !BOSS_MAP[o.bossId]) err(`${q.id}: unknown boss ${o.bossId}`);
    if (o.kind === "collect" && !ITEM_MAP[o.itemId]) err(`${q.id}: unknown item ${o.itemId}`);
    if (o.kind === "reach" && !MAPS.find((m) => m.id === o.mapId)) err(`${q.id}: unknown map ${o.mapId}`);
  }
}

// ---- Shops ----
for (const s of SHOPS) {
  for (const id of [...s.stock, ...(s.crystalStock ?? [])]) {
    if (!ITEM_MAP[id]) err(`shop ${s.id}: unknown item ${id}`);
  }
}

// ---- Maps ----
const mapIds = new Set(MAPS.map((m) => m.id));
for (const m of MAPS) {
  const width = m.grid[0].length;
  m.grid.forEach((row, y) => {
    if (row.length !== width) err(`${m.id}: row ${y} width ${row.length} != ${width}`);
    for (const ch of row) {
      if (!".#~*=BD-,^".includes(ch)) err(`${m.id}: row ${y} has invalid tile '${ch}'`);
    }
  });

  const occupied = new Map<string, string>();
  const occupy = (x: number, y: number, what: string) => {
    const key = `${x},${y}`;
    if (occupied.has(key)) err(`${m.id}: ${what} overlaps ${occupied.get(key)} at ${key}`);
    occupied.set(key, what);
  };

  for (const p of m.portals) {
    if (!isWalkable(m, p.x, p.y)) err(`${m.id}: portal at ${p.x},${p.y} not walkable`);
    if (p.requiresFlag === "__locked__") continue; // decorative locked door
    if (!mapIds.has(p.toMap)) { err(`${m.id}: portal to unknown map ${p.toMap}`); continue; }
    const dest = MAPS.find((mm) => mm.id === p.toMap)!;
    if (!isWalkable(dest, p.toX, p.toY)) err(`${m.id}: portal dest ${p.toMap} ${p.toX},${p.toY} not walkable`);
  }
  for (const n of m.npcs) {
    if (!NPC_MAP[n.npcId]) err(`${m.id}: unknown npc ${n.npcId}`);
    if (!isWalkable(m, n.x, n.y)) err(`${m.id}: npc ${n.npcId} at ${n.x},${n.y} not walkable`);
    occupy(n.x, n.y, `npc ${n.npcId}`);
  }
  for (const t of m.trainers) {
    if (!TRAINER_MAP[t.trainerId]) err(`${m.id}: unknown trainer ${t.trainerId}`);
    if (!isWalkable(m, t.x, t.y)) err(`${m.id}: trainer ${t.trainerId} at ${t.x},${t.y} not walkable`);
    occupy(t.x, t.y, `trainer ${t.trainerId}`);
  }
  for (const it of m.items) {
    if (!ITEM_MAP[it.itemId]) err(`${m.id}: unknown item ${it.itemId}`);
    if (!isWalkable(m, it.x, it.y)) err(`${m.id}: item ${it.itemId} at ${it.x},${it.y} not walkable`);
    occupy(it.x, it.y, `item ${it.itemId}`);
  }
  for (const e of m.encounters) {
    if (!SPECIES_MAP[e.speciesId]) err(`${m.id}: unknown encounter species ${e.speciesId}`);
  }
  if (m.bossId) {
    if (!BOSS_MAP[m.bossId]) err(`${m.id}: unknown boss ${m.bossId}`);
    if (!m.bossPos) err(`${m.id}: boss without bossPos`);
    else {
      if (!isWalkable(m, m.bossPos.x, m.bossPos.y)) err(`${m.id}: boss at ${m.bossPos.x},${m.bossPos.y} not walkable`);
      occupy(m.bossPos.x, m.bossPos.y, `boss ${m.bossId}`);
    }
  }
  if (m.encounterRate > 0 && m.encounters.length === 0) err(`${m.id}: encounterRate without encounters`);
  if (m.encounterRate > 0 && !m.grid.some((r) => r.includes("*"))) err(`${m.id}: encounters but no tall grass`);
}

// ---- Skill tier coverage: every creature must have a damaging level-1 skill ----
for (const c of CREATURES) {
  const first = SKILL_MAP[c.learnset[0]?.skillId];
  if (first && first.category !== "damage") err(`${c.id}: level-1 skill ${first.id} is not a damage skill`);
}

if (errors.length) {
  console.error(`\n❌ ${errors.length} data error(s):\n` + errors.map((e) => "  - " + e).join("\n"));
  process.exit(1);
} else {
  console.log(`✅ Data valid: ${CREATURES.length} creatures, ${SKILLS.length} skills, ${ITEMS.length} items, ${NPCS.length} NPCs, ${TRAINERS.length} trainers, ${BOSSES.length} bosses, ${QUESTS.length} quests, ${MAPS.length} maps`);
}
