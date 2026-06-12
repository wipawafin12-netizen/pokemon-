import type { AnimationType, ElementType, Skill, SkillTier, StatusEffect } from "./types";

// Compact skill constructors -------------------------------------------------

function dmg(
  id: string,
  name: string,
  element: ElementType,
  tier: SkillTier,
  power: number,
  accuracy: number,
  cooldown: number,
  animation: AnimationType,
  description: string,
  extra: Partial<Skill> = {}
): Skill {
  return { id, name, element, tier, power, accuracy, cooldown, animation, description, category: "damage", ...extra };
}

function status(
  id: string,
  name: string,
  element: ElementType,
  statusEffect: StatusEffect,
  statusChance: number,
  power: number,
  description: string,
  animation: AnimationType = "sparkle"
): Skill {
  return {
    id, name, element, statusEffect, statusChance, power, description, animation,
    tier: "basic", category: "damage", accuracy: 90, cooldown: 1,
  };
}

function heal(
  id: string,
  name: string,
  element: ElementType,
  healPercent: number,
  cooldown: number,
  description: string
): Skill {
  return {
    id, name, element, healPercent, cooldown, description,
    tier: "advanced", category: "heal", power: 0, accuracy: 100, animation: "sparkle",
  };
}

function buff(
  id: string,
  name: string,
  element: ElementType,
  statChanges: Skill["statChanges"],
  cooldown: number,
  description: string
): Skill {
  return {
    id, name, element, statChanges, cooldown, description,
    tier: "basic", category: "buff", power: 0, accuracy: 100, animation: "shield",
  };
}

function debuff(
  id: string,
  name: string,
  element: ElementType,
  statChanges: Skill["statChanges"],
  cooldown: number,
  description: string
): Skill {
  return {
    id, name, element, statChanges, cooldown, description,
    tier: "basic", category: "debuff", power: 0, accuracy: 95, animation: "drain",
  };
}

// ============================================================
// SKILL DATABASE — 112 skills
// ============================================================

export const SKILLS: Skill[] = [
  // ---------------- FIRE (12) ----------------
  dmg("ember-flick", "Ember Flick", "fire", "basic", 40, 100, 0, "burst", "A quick flick of hot embers."),
  dmg("flame-lash", "Flame Lash", "fire", "basic", 45, 95, 0, "slash", "A whip of living flame."),
  status("scorch", "Scorch", "fire", "burn", 40, 30, "Sears the foe, often leaving a burn."),
  dmg("blaze-claw", "Blaze Claw", "fire", "advanced", 65, 95, 1, "slash", "Claws wreathed in roaring fire.", { critBonus: 10 }),
  dmg("inferno-surge", "Inferno Surge", "fire", "advanced", 75, 90, 2, "wave", "A rolling tide of flame.", { statusChance: 20, statusEffect: "burn" }),
  dmg("magma-burst", "Magma Burst", "fire", "advanced", 70, 90, 2, "burst", "Molten rock erupts beneath the foe."),
  dmg("pyre-nova", "Pyre Nova", "fire", "ultimate", 110, 85, 3, "nova", "A detonation of pure heat.", { statusChance: 35, statusEffect: "burn" }),
  dmg("sunfall-comet", "Sunfall Comet", "fire", "ultimate", 120, 75, 4, "beam", "Calls down a blazing comet."),
  buff("cinder-veil", "Cinder Veil", "fire", { attack: 1, speed: 1 }, 3, "Wraps the body in stoking embers, raising Attack and Speed."),
  debuff("heat-sap", "Heat Sap", "fire", { defense: -1 }, 2, "Withering heat softens the foe's Defense."),
  heal("phoenix-warmth", "Phoenix Warmth", "fire", 35, 3, "Rejuvenating warmth restores HP."),
  dmg("twin-flare", "Twin Flare", "fire", "advanced", 35, 90, 1, "burst", "Strikes twice with paired fireballs.", { multiHit: 2 }),

  // ---------------- WATER (12) ----------------
  dmg("splash-jab", "Splash Jab", "water", "basic", 40, 100, 0, "burst", "A sharp jab of pressurized water."),
  dmg("tide-whip", "Tide Whip", "water", "basic", 45, 95, 0, "slash", "Lashes with a ribbon of seawater."),
  dmg("bubble-barrage", "Bubble Barrage", "water", "basic", 25, 95, 0, "burst", "A volley of bursting bubbles.", { multiHit: 2 }),
  dmg("riptide", "Riptide", "water", "advanced", 70, 90, 1, "wave", "Drags the foe through a churning current."),
  dmg("pressure-jet", "Pressure Jet", "water", "advanced", 65, 95, 1, "beam", "A laser-thin jet of water.", { critBonus: 10 }),
  dmg("deluge", "Deluge", "water", "advanced", 75, 90, 2, "wave", "A crushing wall of rain."),
  dmg("abyss-maw", "Abyss Maw", "water", "ultimate", 110, 85, 3, "nova", "The deep itself opens to swallow the foe."),
  dmg("tsunami-call", "Tsunami Call", "water", "ultimate", 120, 75, 4, "wave", "Summons a towering tsunami."),
  heal("soothing-spring", "Soothing Spring", "water", 40, 3, "Healing spring water mends wounds."),
  buff("mist-cloak", "Mist Cloak", "water", { defense: 1, speed: 1 }, 3, "A concealing mist raises Defense and Speed."),
  debuff("soak", "Soak", "water", { attack: -1 }, 2, "Drenches the foe, dampening its Attack."),
  heal("renewing-rain", "Renewing Rain", "water", 30, 2, "A gentle rain that restores HP."),

  // ---------------- NATURE (12) ----------------
  dmg("leaf-dart", "Leaf Dart", "nature", "basic", 40, 100, 0, "slash", "Fires razor-edged leaves."),
  dmg("vine-snap", "Vine Snap", "nature", "basic", 45, 95, 0, "slash", "A stinging snap of a hardened vine."),
  status("spore-cloud", "Spore Cloud", "nature", "sleep", 45, 20, "Drowsy spores that may put the foe to sleep."),
  status("toxin-thorn", "Toxin Thorn", "nature", "poison", 50, 25, "A venom-tipped thorn that often poisons."),
  dmg("petal-storm", "Petal Storm", "nature", "advanced", 70, 90, 1, "storm", "A whirlwind of cutting petals."),
  dmg("root-crush", "Root Crush", "nature", "advanced", 75, 85, 2, "quake", "Roots erupt and constrict the foe."),
  dmg("verdant-drain", "Verdant Drain", "nature", "advanced", 60, 95, 2, "drain", "Drains life force to heal the user.", { drainPercent: 50 }),
  dmg("bloom-requiem", "Bloom Requiem", "nature", "ultimate", 110, 85, 3, "nova", "An overwhelming bloom of wild growth."),
  dmg("world-tree-wrath", "World Tree's Wrath", "nature", "ultimate", 120, 75, 4, "quake", "Channels the anger of the ancient forest."),
  heal("photosynth", "Photosynthesis", "nature", 45, 3, "Converts light into restorative energy."),
  buff("bark-armor", "Bark Armor", "nature", { defense: 2 }, 3, "Hardened bark sharply raises Defense."),
  debuff("pollen-daze", "Pollen Daze", "nature", { magic: -1, speed: -1 }, 3, "Dizzying pollen lowers Magic and Speed."),

  // ---------------- EARTH (12) ----------------
  dmg("pebble-toss", "Pebble Toss", "earth", "basic", 40, 100, 0, "burst", "Hurls a fistful of sharp stones."),
  dmg("mud-slap", "Mud Slap", "earth", "basic", 40, 100, 0, "burst", "A face-full of clinging mud.", { statChanges: undefined }),
  dmg("stone-edge", "Stone Edge", "earth", "advanced", 70, 85, 1, "slash", "Impales with jagged stone pillars.", { critBonus: 15 }),
  dmg("dune-crush", "Dune Crush", "earth", "advanced", 70, 90, 1, "quake", "Buries the foe under shifting sand."),
  dmg("fault-line", "Fault Line", "earth", "advanced", 75, 90, 2, "quake", "Splits the ground beneath the foe."),
  status("sand-blind", "Sand Blind", "earth", "stun", 35, 25, "A blinding sandstorm that may stun.", "storm"),
  dmg("tectonic-roar", "Tectonic Roar", "earth", "ultimate", 110, 85, 3, "quake", "A roar that shakes the world's bones."),
  dmg("meteor-fist", "Meteor Fist", "earth", "ultimate", 120, 75, 4, "burst", "A falling-star punch of compressed rock."),
  buff("granite-guard", "Granite Guard", "earth", { defense: 2 }, 3, "Encases the body in granite, sharply raising Defense."),
  debuff("quicksand", "Quicksand", "earth", { speed: -2 }, 3, "Traps the foe's feet, sharply lowering Speed."),
  heal("geo-mend", "Geo Mend", "earth", 35, 3, "Draws restorative energy from the land."),
  dmg("boulder-roll", "Boulder Roll", "earth", "basic", 50, 90, 1, "quake", "Rolls a massive boulder over the foe."),

  // ---------------- WIND (12) ----------------
  dmg("gust-blade", "Gust Blade", "wind", "basic", 40, 100, 0, "slash", "A crescent blade of cutting air."),
  dmg("zephyr-jab", "Zephyr Jab", "wind", "basic", 35, 100, 0, "burst", "An impossibly fast strike of wind.", { critBonus: 5 }),
  dmg("air-ripper", "Air Ripper", "wind", "advanced", 65, 95, 1, "slash", "Tears the air itself into blades.", { critBonus: 10 }),
  dmg("cyclone-spin", "Cyclone Spin", "wind", "advanced", 70, 90, 2, "storm", "Spins into a foe-flinging cyclone."),
  dmg("jetstream", "Jetstream", "wind", "advanced", 60, 100, 1, "beam", "A high-altitude wind crashes down."),
  dmg("tempest-howl", "Tempest Howl", "wind", "ultimate", 110, 85, 3, "storm", "A howling tempest levels everything."),
  dmg("sky-sever", "Sky Sever", "wind", "ultimate", 120, 75, 4, "slash", "A single cut said to split the sky."),
  buff("tailwind", "Tailwind", "wind", { speed: 2 }, 3, "A trailing wind sharply raises Speed."),
  buff("updraft", "Updraft", "wind", { magic: 1, speed: 1 }, 3, "Rising air lifts Magic and Speed."),
  debuff("downdraft", "Downdraft", "wind", { speed: -1, attack: -1 }, 3, "A crushing downdraft slows and weakens the foe."),
  heal("second-wind", "Second Wind", "wind", 30, 2, "A refreshing breeze restores stamina."),
  status("dizzy-gale", "Dizzy Gale", "wind", "stun", 35, 25, "A disorienting gale that may stun.", "storm"),

  // ---------------- ELECTRIC (12) ----------------
  dmg("spark-snap", "Spark Snap", "electric", "basic", 40, 100, 0, "burst", "A snapping arc of static."),
  status("jolt", "Jolt", "electric", "stun", 40, 30, "A numbing jolt that may stun.", "burst"),
  dmg("volt-fang", "Volt Fang", "electric", "advanced", 65, 95, 1, "slash", "Fangs charged with crackling current.", { statusChance: 15, statusEffect: "stun" }),
  dmg("arc-lance", "Arc Lance", "electric", "advanced", 70, 90, 1, "beam", "A spear of forked lightning."),
  dmg("static-field", "Static Field", "electric", "advanced", 60, 100, 2, "nova", "Charges the field, shocking the foe.", { statusChance: 20, statusEffect: "stun" }),
  dmg("gigavolt-crash", "Gigavolt Crash", "electric", "ultimate", 110, 85, 3, "beam", "A meteoric bolt of mega-voltage.", { statusChance: 25, statusEffect: "stun" }),
  dmg("storm-caller", "Storm Caller", "electric", "ultimate", 120, 75, 4, "storm", "Calls the full fury of a thunderstorm."),
  buff("overcharge", "Overcharge", "electric", { attack: 1, magic: 1 }, 3, "Overloads the body, raising Attack and Magic."),
  buff("capacitor", "Capacitor", "electric", { magic: 2 }, 3, "Stores charge, sharply raising Magic."),
  debuff("short-circuit", "Short Circuit", "electric", { magic: -2 }, 3, "Scrambles the foe's energy, sharply lowering Magic."),
  heal("recharge", "Recharge", "electric", 35, 3, "Converts stored current into vitality."),
  dmg("chain-lightning", "Chain Lightning", "electric", "advanced", 30, 90, 2, "beam", "Lightning that arcs again and again.", { multiHit: 3 }),

  // ---------------- ICE (12) ----------------
  dmg("frost-shard", "Frost Shard", "ice", "basic", 40, 100, 0, "burst", "Fires a dagger of ice."),
  status("chill-touch", "Chill Touch", "ice", "freeze", 35, 30, "A freezing touch that may encase the foe in ice."),
  dmg("icicle-spear", "Icicle Spear", "ice", "advanced", 70, 90, 1, "beam", "Launches a massive icicle.", { critBonus: 10 }),
  dmg("hail-volley", "Hail Volley", "ice", "advanced", 30, 90, 1, "storm", "A pelting volley of hailstones.", { multiHit: 2 }),
  dmg("glacier-press", "Glacier Press", "ice", "advanced", 75, 85, 2, "quake", "Drops a glacier's weight on the foe."),
  dmg("absolute-zero", "Absolute Zero", "ice", "ultimate", 110, 85, 3, "nova", "Strips all warmth from the world.", { statusChance: 30, statusEffect: "freeze" }),
  dmg("aurora-lance", "Aurora Lance", "ice", "ultimate", 120, 75, 4, "beam", "A lance of frozen aurora light."),
  buff("frost-armor", "Frost Armor", "ice", { defense: 1, magic: 1 }, 3, "Armor of clear ice raises Defense and Magic."),
  debuff("frostbite", "Frostbite", "ice", { attack: -1, speed: -1 }, 3, "Creeping cold lowers Attack and Speed."),
  heal("glacial-mend", "Glacial Mend", "ice", 35, 3, "Pristine ice crystals knit wounds closed."),
  dmg("snowblind-rush", "Snowblind Rush", "ice", "basic", 45, 95, 0, "slash", "A charging strike through driving snow."),
  dmg("permafrost", "Permafrost", "ice", "advanced", 65, 90, 2, "wave", "Freezes the ground in a spreading wave.", { statusChance: 20, statusEffect: "freeze" }),

  // ---------------- LIGHT (12) ----------------
  dmg("glimmer-bolt", "Glimmer Bolt", "light", "basic", 40, 100, 0, "beam", "A dart of condensed light."),
  dmg("radiant-palm", "Radiant Palm", "light", "basic", 45, 95, 0, "burst", "A palm strike that flashes like dawn."),
  dmg("prism-ray", "Prism Ray", "light", "advanced", 70, 90, 1, "beam", "A refracted ray of seven colors."),
  dmg("halo-burst", "Halo Burst", "light", "advanced", 70, 90, 2, "nova", "A ring of holy light detonates."),
  dmg("judgment-flare", "Judgment Flare", "light", "ultimate", 110, 85, 3, "nova", "Light that judges all it touches."),
  dmg("dawnbreaker", "Dawnbreaker", "light", "ultimate", 120, 75, 4, "beam", "The first light of dawn, weaponized."),
  heal("blessing", "Blessing", "light", 50, 3, "A sacred blessing greatly restores HP."),
  heal("guiding-glow", "Guiding Glow", "light", 30, 2, "A soft glow that mends small wounds."),
  buff("aegis-light", "Aegis Light", "light", { defense: 1, magic: 1 }, 3, "A shining aegis raises Defense and Magic."),
  buff("solar-charge", "Solar Charge", "light", { attack: 1, magic: 1 }, 3, "Stored sunlight raises Attack and Magic."),
  debuff("dazzle", "Dazzle", "light", { attack: -1, magic: -1 }, 3, "A blinding flash lowers Attack and Magic."),
  status("searing-ray", "Searing Ray", "light", "burn", 35, 30, "Concentrated light that may burn.", "beam"),

  // ---------------- SHADOW (12) ----------------
  dmg("gloom-claw", "Gloom Claw", "shadow", "basic", 40, 100, 0, "slash", "Claws of solidified darkness."),
  dmg("night-bite", "Night Bite", "shadow", "basic", 45, 95, 0, "slash", "A bite from out of the dark."),
  status("dread-whisper", "Dread Whisper", "shadow", "sleep", 40, 20, "A whisper of dread that lulls foes to sleep.", "drain"),
  dmg("umbral-spike", "Umbral Spike", "shadow", "advanced", 70, 90, 1, "burst", "Spikes of shadow erupt from below."),
  dmg("soul-siphon", "Soul Siphon", "shadow", "advanced", 60, 95, 2, "drain", "Siphons the foe's essence to heal.", { drainPercent: 50 }),
  dmg("phantom-rend", "Phantom Rend", "shadow", "advanced", 65, 95, 1, "slash", "A rending strike from a phantom limb.", { critBonus: 10 }),
  dmg("void-collapse", "Void Collapse", "shadow", "ultimate", 110, 85, 3, "nova", "Collapses a pocket of void onto the foe."),
  dmg("eclipse-reign", "Eclipse Reign", "shadow", "ultimate", 120, 75, 4, "nova", "The reign of total eclipse."),
  buff("shade-step", "Shade Step", "shadow", { speed: 1, attack: 1 }, 3, "Melts into shadow, raising Speed and Attack."),
  debuff("curse-mark", "Curse Mark", "shadow", { defense: -1, magic: -1 }, 3, "A cursed sigil lowers Defense and Magic."),
  heal("dark-communion", "Dark Communion", "shadow", 35, 3, "Communes with the dark to restore HP."),
  status("venom-shade", "Venom Shade", "shadow", "poison", 45, 25, "A toxic shade that often poisons.", "drain"),

  // ---------------- NEUTRAL-LEANING UTILITY (4, typed but universal) ----------------
  dmg("star-strike", "Star Strike", "light", "advanced", 60, 100, 1, "sparkle", "A reliable strike of starlight that never misses easily."),
  buff("battle-cry", "Battle Cry", "fire", { attack: 2 }, 3, "A rousing cry sharply raises Attack."),
  buff("iron-will", "Iron Will", "earth", { defense: 1, attack: 1 }, 3, "Unbending resolve raises Attack and Defense."),
  debuff("intimidate", "Intimidate", "shadow", { attack: -2 }, 3, "A terrifying glare sharply lowers the foe's Attack."),
];

export const SKILL_MAP: Record<string, Skill> = Object.fromEntries(SKILLS.map((s) => [s.id, s]));

export function getSkill(id: string): Skill {
  const s = SKILL_MAP[id];
  if (!s) throw new Error(`Unknown skill: ${id}`);
  return s;
}
