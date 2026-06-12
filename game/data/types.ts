// ============================================================
// Eternal Monsters — Core Type Definitions (Database Schema)
// ============================================================

export type ElementType =
  | "fire"
  | "water"
  | "nature"
  | "earth"
  | "wind"
  | "electric"
  | "ice"
  | "light"
  | "shadow";

export type Rarity = "common" | "rare" | "epic" | "legendary";

export type StatusEffect = "burn" | "freeze" | "poison" | "sleep" | "stun";

export type SkillCategory = "damage" | "heal" | "buff" | "debuff";

export type SkillTier = "basic" | "advanced" | "ultimate";

export type AnimationType =
  | "slash"
  | "burst"
  | "beam"
  | "wave"
  | "shield"
  | "sparkle"
  | "quake"
  | "storm"
  | "drain"
  | "nova";

export type StatKey = "hp" | "attack" | "defense" | "magic" | "speed";

export interface Stats {
  hp: number;
  attack: number;
  defense: number;
  magic: number;
  speed: number;
}

// ---------- Skills ----------

export interface Skill {
  id: string;
  name: string;
  description: string;
  element: ElementType;
  category: SkillCategory;
  tier: SkillTier;
  power: number; // 0 for pure status skills
  accuracy: number; // 0..100
  cooldown: number; // turns
  animation: AnimationType;
  /** chance (0..100) of inflicting a status effect on the target */
  statusChance?: number;
  statusEffect?: StatusEffect;
  /** stat stage changes applied by buffs/debuffs (positive = self/ally, negative = enemy) */
  statChanges?: Partial<Record<StatKey, number>>;
  /** heal amount as a % of max HP (heal skills) */
  healPercent?: number;
  /** % of damage dealt restored as HP */
  drainPercent?: number;
  /** hits more than once */
  multiHit?: number;
  critBonus?: number; // additional crit chance (base 6.25%)
}

// ---------- Creatures ----------

export type EvolutionMethod = "level" | "item" | "friendship" | "quest";

export interface EvolutionBranch {
  toSpeciesId: string;
  method: EvolutionMethod;
  /** level required / item id / friendship threshold / quest id */
  param: number | string;
  label: string;
}

export interface LearnsetEntry {
  level: number;
  skillId: string;
}

export interface CreatureSpecies {
  id: string;
  dexNumber: number;
  name: string;
  description: string;
  element: ElementType;
  secondaryElement?: ElementType;
  rarity: Rarity;
  /** 1 = base, 2 = middle, 3 = final */
  stage: 1 | 2 | 3;
  baseStats: Stats;
  learnset: LearnsetEntry[];
  evolutions: EvolutionBranch[];
  /** 0..255, higher = easier to capture */
  captureRate: number;
  /** base XP yielded when defeated */
  baseXp: number;
  habitat: string;
}

/** A creature instance owned by the player or encountered in the wild. */
export interface CreatureInstance {
  uid: string;
  speciesId: string;
  nickname?: string;
  level: number;
  xp: number;
  currentHp: number;
  stats: Stats;
  /** up to 4 equipped skill ids */
  skills: string[];
  status: StatusEffect | null;
  friendship: number; // 0..255
  isShiny?: boolean;
}

// ---------- Items ----------

export type ItemCategory = "orb" | "potion" | "evolution" | "quest" | "key";

export interface Item {
  id: string;
  name: string;
  description: string;
  category: ItemCategory;
  price: number; // gold; -1 = not purchasable
  crystalPrice?: number; // crystal shards; only some items
  /** capture multiplier for orbs */
  orbPower?: number;
  /** HP restored (flat) or -1 for full heal */
  healAmount?: number;
  /** cures this status, or "all" */
  cures?: StatusEffect | "all";
  /** revives a fainted creature at this % HP */
  revivePercent?: number;
  sellPrice?: number;
}

// ---------- NPCs / Trainers / Bosses ----------

export interface NPC {
  id: string;
  name: string;
  personality: string;
  location: string; // map id
  dialogue: string[];
  /** quest offered when talked to, if any */
  questId?: string;
  /** opens a shop */
  shopId?: string;
  /** heals the party */
  healer?: boolean;
  sprite: "villager" | "elder" | "scholar" | "merchant" | "guard" | "kid" | "healer" | "ranger";
}

export interface TrainerTeamEntry {
  speciesId: string;
  level: number;
}

export interface Trainer {
  id: string;
  name: string;
  title: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  location: string;
  team: TrainerTeamEntry[];
  rewardGold: number;
  rewardItems?: { itemId: string; qty: number }[];
  introLine: string;
  defeatLine: string;
}

export interface BossMechanic {
  name: string;
  description: string;
  /** engine hook key, interpreted by the battle engine */
  hook:
    | "enrage_below_half" // attack +35% under 50% HP
    | "shield_every_3" // gains defense buff every 3 turns
    | "heal_once" // heals 40% once below 30%
    | "status_aura" // 30% chance to inflict its element status each turn
    | "speed_ramp" // speed rises each turn
    | "reflect" // returns 20% of damage taken
    | "double_strike" // attacks twice when above 70% HP
    | "last_stand"; // survives the first lethal hit at 1 HP
}

export interface Boss {
  id: string;
  name: string;
  title: string;
  location: string;
  speciesId: string;
  level: number;
  description: string;
  mechanics: BossMechanic[];
  rewardGold: number;
  rewardCrystals: number;
  rewardItems: { itemId: string; qty: number }[];
  /** flag set when defeated */
  flag: string;
}

// ---------- Quests ----------

export type QuestType = "story" | "side" | "daily";

export type QuestObjective =
  | { kind: "talk"; npcId: string; label: string }
  | { kind: "defeat_trainer"; trainerId: string; label: string }
  | { kind: "defeat_boss"; bossId: string; label: string }
  | { kind: "capture"; element?: ElementType; count: number; label: string }
  | { kind: "collect"; itemId: string; count: number; label: string }
  | { kind: "reach"; mapId: string; label: string }
  | { kind: "win_battles"; count: number; label: string };

export interface Quest {
  id: string;
  type: QuestType;
  name: string;
  description: string;
  giverNpcId?: string;
  objectives: QuestObjective[];
  rewardGold: number;
  rewardCrystals?: number;
  rewardItems?: { itemId: string; qty: number }[];
  rewardXp?: number;
  /** quest that must be completed first */
  requires?: string;
  /** story order index for main quests */
  order?: number;
}

// ---------- Maps ----------

export type TileCode =
  | "." // walkable ground
  | "," // decorative ground (flowers / crystals / pebbles)
  | "#" // solid (tree / wall / rock)
  | "~" // water (solid)
  | "*" // tall grass — wild encounters
  | "=" // path
  | "B" // building (solid)
  | "D" // door (portal trigger placed separately)
  | "-" // bridge
  | "^"; // ledge decoration (solid)

export interface MapPortal {
  x: number;
  y: number;
  toMap: string;
  toX: number;
  toY: number;
  label?: string;
  /** flag required to pass */
  requiresFlag?: string;
  lockedMessage?: string;
}

export interface MapItemPickup {
  x: number;
  y: number;
  itemId: string;
  qty: number;
  /** unique flag so it can only be collected once */
  flag: string;
}

export interface EncounterEntry {
  speciesId: string;
  weight: number;
  minLevel: number;
  maxLevel: number;
}

export interface NPCPlacement {
  npcId: string;
  x: number;
  y: number;
}

export interface TrainerPlacement {
  trainerId: string;
  x: number;
  y: number;
}

export interface GameMap {
  id: string;
  name: string;
  /** ASCII tile rows, all the same width */
  grid: string[];
  /** ambient palette key for the tile renderer */
  theme: "village" | "forest" | "cave" | "desert" | "snow" | "plateau" | "temple" | "city";
  encounterRate: number; // chance per step in tall grass (0..1)
  encounters: EncounterEntry[];
  portals: MapPortal[];
  npcs: NPCPlacement[];
  trainers: TrainerPlacement[];
  items: MapItemPickup[];
  bossId?: string;
  bossPos?: { x: number; y: number };
  musicKey: string;
}

// ---------- Shops ----------

export interface Shop {
  id: string;
  name: string;
  /** item ids for sale (gold prices from item db) */
  stock: string[];
  /** items sold for crystal shards */
  crystalStock?: string[];
}

// ---------- Save Data ----------

export interface QuestProgress {
  questId: string;
  /** progress per objective index */
  progress: number[];
  completed: boolean;
  claimed: boolean;
  /** for dailies: day stamp when last completed */
  dayStamp?: string;
}

export interface PlayerSave {
  version: number;
  slot: number;
  playerName: string;
  createdAt: number;
  updatedAt: number;
  playTimeSec: number;
  gold: number;
  crystals: number;
  mapId: string;
  pos: { x: number; y: number };
  facing: "up" | "down" | "left" | "right";
  party: CreatureInstance[]; // up to 6
  storage: CreatureInstance[];
  inventory: Record<string, number>;
  quests: QuestProgress[];
  /** species ids seen / captured */
  dexSeen: string[];
  dexCaught: string[];
  flags: Record<string, boolean>;
  defeatedTrainers: string[];
  badges: string[]; // boss flags earned
}

export interface GameSettings {
  musicVolume: number;
  sfxVolume: number;
  textSpeed: "slow" | "normal" | "fast";
  darkMode: boolean;
  reducedMotion: boolean;
  touchControls: "auto" | "on" | "off";
}
