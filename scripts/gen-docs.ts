/* Generates database documentation from the live game data.
   Run with: npx tsx scripts/gen-docs.ts */
import { writeFileSync, mkdirSync } from "fs";
import { CREATURES, getSpecies } from "../game/data/creatures";
import { SKILLS } from "../game/data/skills";
import { QUESTS } from "../game/data/quests";
import { ITEMS } from "../game/data/items";
import { TRAINERS } from "../game/data/trainers";
import { BOSSES } from "../game/data/bosses";
import { NPCS } from "../game/data/npcs";
import { ELEMENTS, ELEMENT_LABEL, effectiveness } from "../game/data/typeChart";

mkdirSync("docs", { recursive: true });

// ---------- Type chart ----------
{
  let md = `# Type Effectiveness Table\n\n> Generated from \`game/data/typeChart.ts\` — attacker rows × defender columns.\n> **2** = super effective · **½** = not very effective · blank = neutral\n\n| Atk \\\\ Def | ${ELEMENTS.map((e) => ELEMENT_LABEL[e]).join(" | ")} |\n|---|${ELEMENTS.map(() => "---").join("|")}|\n`;
  for (const atk of ELEMENTS) {
    md += `| **${ELEMENT_LABEL[atk]}** | ${ELEMENTS.map((def) => {
      const m = effectiveness(atk, def);
      return m === 2 ? "**2**" : m === 0.5 ? "½" : "";
    }).join(" | ")} |\n`;
  }
  md += `\n## Design notes\n\n- Every element has at least two offensive targets and at least one weakness — no dead types.\n- Light and Shadow are mutually super effective (mutual glass-cannon matchup) and resist themselves.\n- Ice is the broadest offensive type (3 targets) but is fragile and resisted by itself, Fire and Light.\n- Dual-element defenders multiply both charts (max 4×, min ¼×).\n- STAB (same-type attack bonus): ×1.2.\n`;
  writeFileSync("docs/TYPE_CHART.md", md);
}

// ---------- Creature database ----------
{
  let md = `# Creature Database — 50 Species\n\n> Generated from \`game/data/creatures.ts\`. Stats are base stats; battle stats grow with level.\n\n| # | Name | Element | Rarity | Stage | HP | ATK | DEF | MAG | SPD | Capture | Evolution |\n|---|---|---|---|---|---|---|---|---|---|---|---|\n`;
  for (const c of CREATURES) {
    const el = c.secondaryElement ? `${ELEMENT_LABEL[c.element]}/${ELEMENT_LABEL[c.secondaryElement]}` : ELEMENT_LABEL[c.element];
    const evo = c.evolutions.length
      ? c.evolutions.map((e) => `${getSpecies(e.toSpeciesId).name} (${e.label})`).join("; ")
      : "—";
    md += `| ${c.dexNumber} | **${c.name}** | ${el} | ${c.rarity} | ${c.stage} | ${c.baseStats.hp} | ${c.baseStats.attack} | ${c.baseStats.defense} | ${c.baseStats.magic} | ${c.baseStats.speed} | ${c.captureRate} | ${evo} |\n`;
  }
  md += `\n## Lore entries\n\n`;
  for (const c of CREATURES) {
    md += `**#${c.dexNumber} ${c.name}** — *${c.habitat}*\n\n> ${c.description}\n\n`;
  }
  writeFileSync("docs/CREATURE_DATABASE.md", md);
}

// ---------- Skill database ----------
{
  let md = `# Skill Database — ${SKILLS.length} Skills\n\n> Generated from \`game/data/skills.ts\`.\n\n| Skill | Element | Tier | Category | Power | Acc | CD | Animation | Notes |\n|---|---|---|---|---|---|---|---|---|\n`;
  for (const s of SKILLS) {
    const notes: string[] = [];
    if (s.statusEffect) notes.push(`${s.statusChance}% ${s.statusEffect}`);
    if (s.statChanges) notes.push(Object.entries(s.statChanges).map(([k, v]) => `${k} ${v > 0 ? "+" : ""}${v}`).join(", "));
    if (s.healPercent) notes.push(`heal ${s.healPercent}%`);
    if (s.drainPercent) notes.push(`drain ${s.drainPercent}%`);
    if (s.multiHit) notes.push(`${s.multiHit} hits`);
    if (s.critBonus) notes.push(`+${s.critBonus}% crit`);
    md += `| **${s.name}** | ${ELEMENT_LABEL[s.element]} | ${s.tier} | ${s.category} | ${s.power || "—"} | ${s.accuracy} | ${s.cooldown} | ${s.animation} | ${notes.join("; ") || "—"} |\n`;
  }
  writeFileSync("docs/SKILL_DATABASE.md", md);
}

// ---------- Quest database ----------
{
  let md = `# Quest Database — ${QUESTS.length} Quests\n\n> Generated from \`game/data/quests.ts\`.\n\n`;
  for (const type of ["story", "side", "daily"] as const) {
    md += `## ${type[0].toUpperCase() + type.slice(1)} Quests\n\n`;
    for (const q of QUESTS.filter((q) => q.type === type)) {
      md += `### ${q.name}${q.order ? ` (Chapter ${q.order})` : ""}\n\n${q.description}\n\n`;
      if (q.giverNpcId) md += `- **Giver:** ${q.giverNpcId}\n`;
      if (q.requires) md += `- **Requires:** ${q.requires}\n`;
      md += `- **Objectives:**\n`;
      for (const o of q.objectives) md += `  - ${o.label}\n`;
      const rewards = [`${q.rewardGold} gold`];
      if (q.rewardCrystals) rewards.push(`${q.rewardCrystals} crystal shards`);
      if (q.rewardXp) rewards.push(`${q.rewardXp} XP`);
      for (const r of q.rewardItems ?? []) rewards.push(`${r.itemId} ×${r.qty}`);
      md += `- **Rewards:** ${rewards.join(", ")}\n\n`;
    }
  }
  writeFileSync("docs/QUEST_DATABASE.md", md);
}

// ---------- World almanac (items / NPCs / trainers / bosses) ----------
{
  let md = `# World Almanac\n\n> Generated from the data files in \`game/data/\`.\n\n## Items (${ITEMS.length})\n\n| Item | Category | Price | Effect |\n|---|---|---|---|\n`;
  for (const i of ITEMS) {
    const price = i.price > 0 ? `${i.price}g` : i.crystalPrice ? `${i.crystalPrice}💎` : "not sold";
    const fx: string[] = [];
    if (i.orbPower) fx.push(`capture ×${i.orbPower}`);
    if (i.healAmount) fx.push(i.healAmount === -1 ? "full heal" : `heal ${i.healAmount}`);
    if (i.cures) fx.push(`cures ${i.cures}`);
    if (i.revivePercent) fx.push(`revive ${i.revivePercent}%`);
    md += `| **${i.name}** | ${i.category} | ${price} | ${fx.join("; ") || i.description} |\n`;
  }
  md += `\n## NPCs (${NPCS.length})\n\n| NPC | Location | Personality | Role |\n|---|---|---|---|\n`;
  for (const n of NPCS) {
    const roles: string[] = [];
    if (n.healer) roles.push("healer");
    if (n.shopId) roles.push(`shop: ${n.shopId}`);
    if (n.questId) roles.push(`quest: ${n.questId}`);
    md += `| **${n.name}** | ${n.location} | ${n.personality} | ${roles.join(", ") || "flavor"} |\n`;
  }
  md += `\n## Trainers (${TRAINERS.length})\n\n| Trainer | Difficulty | Location | Team | Reward |\n|---|---|---|---|---|\n`;
  for (const t of TRAINERS) {
    const team = t.team.map((m) => `${getSpecies(m.speciesId).name} L${m.level}`).join(", ");
    md += `| **${t.title} ${t.name}** | ${"★".repeat(t.difficulty)} | ${t.location} | ${team} | ${t.rewardGold}g |\n`;
  }
  md += `\n## Boss Guardians (${BOSSES.length})\n\n`;
  for (const b of BOSSES) {
    md += `### ${b.name}, ${b.title} — ${getSpecies(b.speciesId).name} L${b.level} (${b.location})\n\n${b.description}\n\n`;
    for (const m of b.mechanics) md += `- **${m.name}** — ${m.description}\n`;
    md += `- **Rewards:** ${b.rewardGold}g, ${b.rewardCrystals} crystal shards, ${b.rewardItems.map((r) => r.itemId).join(", ")}\n\n`;
  }
  writeFileSync("docs/WORLD_ALMANAC.md", md);
}

console.log("✅ docs generated: TYPE_CHART, CREATURE_DATABASE, SKILL_DATABASE, QUEST_DATABASE, WORLD_ALMANAC");
