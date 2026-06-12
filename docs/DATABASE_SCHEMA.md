# Database Schema

All game data is strongly-typed TypeScript in `game/data/` — the schema lives in [`game/data/types.ts`](../game/data/types.ts) and is enforced at compile time plus by `scripts/validate-data.ts` (referential integrity, map walkability, counts).

```
game/data/
├── types.ts        ← the schema (this document mirrors it)
├── typeChart.ts    ← 9×9 effectiveness matrix + element colors
├── skills.ts       ← 112 Skill rows
├── creatures.ts    ← 50 CreatureSpecies rows
├── items.ts        ← 27 Item rows
├── npcs.ts         ← 30 NPC rows
├── trainers.ts     ← 20 Trainer rows
├── bosses.ts       ← 8 Boss rows
├── quests.ts       ← 19 Quest rows
├── shops.ts        ← 3 Shop rows
└── maps.ts         ← 10 GameMap rows (8 regions + 2 interiors)
```

## Entity relationship overview

```
CreatureSpecies ──< LearnsetEntry >── Skill
       │ ──< EvolutionBranch ──> CreatureSpecies | Item | Quest
CreatureInstance ──> CreatureSpecies          (player-owned / wild)
GameMap ──< EncounterEntry ──> CreatureSpecies
GameMap ──< NPCPlacement ──> NPC ──> Quest | Shop
GameMap ──< TrainerPlacement ──> Trainer ──< TrainerTeamEntry ──> CreatureSpecies
GameMap ──> Boss ──> CreatureSpecies, ──< BossMechanic
GameMap ──< MapPortal ──> GameMap   (requiresFlag gates progression)
GameMap ──< MapItemPickup ──> Item  (one-shot via flag)
Quest ──< QuestObjective ──> NPC | Trainer | Boss | Item | GameMap | element
Shop ──< stock ──> Item
PlayerSave ──< CreatureInstance, QuestProgress, inventory(Item), flags
```

## Core tables

### CreatureSpecies
| Field | Type | Notes |
|---|---|---|
| id | string PK | kebab-case |
| dexNumber | 1–50 unique | |
| name, description, habitat | string | |
| element / secondaryElement | ElementType | 9 elements |
| rarity | common·rare·epic·legendary | drives captureRate & baseXp |
| stage | 1–3 | evolution stage |
| baseStats | {hp, attack, defense, magic, speed} | |
| learnset | {level, skillId}[] | level-1 entry mandatory & damaging |
| evolutions | EvolutionBranch[] | 0–2 branches |
| captureRate | 0–255 | higher = easier |
| baseXp | number | XP yield base |

### Skill
id PK · name · description · element · category (damage/heal/buff/debuff) · tier (basic/advanced/ultimate) · power · accuracy · cooldown · animation (10 kinds) · optional: statusEffect+statusChance · statChanges (±3 stages) · healPercent · drainPercent · multiHit · critBonus.

### Item
id PK · name · description · category (orb/potion/evolution/quest/key) · price (−1 = unsellable) · crystalPrice? · orbPower? · healAmount (−1 = full)? · cures (status|"all")? · revivePercent? · sellPrice?.

### NPC
id PK · name · personality · location (map id) · dialogue[] · sprite (8 archetypes) · questId? · shopId? · healer?.

### Trainer / Boss
Trainer: id PK · name · title · difficulty 1–5 · location · team {speciesId, level}[] · rewardGold · rewardItems? · intro/defeat lines.
Boss: id PK · name · title · location · speciesId · level · mechanics {name, description, hook}[] · rewardGold · rewardCrystals · rewardItems · flag (set on defeat; gates portals).

### Quest
id PK · type (story/side/daily) · name · description · giverNpcId? · requires? (quest id) · order? · objectives (7 discriminated kinds) · rewards (gold/crystals/items/xp).

### GameMap
id PK · name · theme (8 tile palettes) · grid (ASCII rows, validated equal-width) · encounterRate · encounters {speciesId, weight, min/maxLevel}[] · portals {x,y,toMap,toX,toY,requiresFlag?,lockedMessage?}[] · npcs/trainers/items placements (validated walkable + non-overlapping) · bossId?+bossPos? · musicKey.

## Save data (LocalStorage)

### PlayerSave — `eternal-monsters:save:{slot}`
version · slot · playerName · createdAt/updatedAt · playTimeSec · gold · crystals · mapId · pos{x,y} · facing · party (CreatureInstance[], ≤6) · storage · inventory (Record<itemId, qty>) · quests (QuestProgress[]) · dexSeen/dexCaught (speciesId[]) · flags (Record<string, boolean> — boss defeats, item pickups `item-*`, visits `visited-*`) · defeatedTrainers · badges.

### CreatureInstance
uid · speciesId · nickname? · level · xp (cubic curve: `level³`) · currentHp · stats (materialized at level) · skills (≤4 skillIds) · status · friendship 0–255 · isShiny?.

### QuestProgress
questId · progress[] (per objective index) · completed · claimed · dayStamp (daily reset).

### GameSettings — `eternal-monsters:settings`
musicVolume · sfxVolume · textSpeed · darkMode · reducedMotion · touchControls.

## Validation

`npx tsx scripts/validate-data.ts` checks: exact counts (50/≥100/30/20/8), unique ids & dex numbers, every cross-reference resolves, level-1 damaging skill per species, map rows equal width with legal tiles, every placement on a walkable non-overlapping tile, portal destinations walkable, encounter tables consistent. Run it in CI before every deploy.
