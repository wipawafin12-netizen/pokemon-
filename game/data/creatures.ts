import type { CreatureSpecies, ElementType, EvolutionBranch, LearnsetEntry, Rarity, Stats } from "./types";

// Compact constructors -------------------------------------------------------

function stats(hp: number, attack: number, defense: number, magic: number, speed: number): Stats {
  return { hp, attack, defense, magic, speed };
}

function learn(...entries: [number, string][]): LearnsetEntry[] {
  return entries.map(([level, skillId]) => ({ level, skillId }));
}

function evoLevel(to: string, level: number): EvolutionBranch {
  return { toSpeciesId: to, method: "level", param: level, label: `Level ${level}` };
}
function evoItem(to: string, itemId: string, label: string): EvolutionBranch {
  return { toSpeciesId: to, method: "item", param: itemId, label };
}
function evoFriend(to: string, threshold: number): EvolutionBranch {
  return { toSpeciesId: to, method: "friendship", param: threshold, label: `Friendship ${threshold}+` };
}
function evoQuest(to: string, questId: string, label: string): EvolutionBranch {
  return { toSpeciesId: to, method: "quest", param: questId, label };
}

const CAPTURE: Record<Rarity, number> = { common: 180, rare: 100, epic: 50, legendary: 15 };
const XP: Record<Rarity, number> = { common: 60, rare: 110, epic: 170, legendary: 280 };

interface SpecDef {
  num: number;
  id: string;
  name: string;
  element: ElementType;
  second?: ElementType;
  rarity: Rarity;
  stage: 1 | 2 | 3;
  stats: Stats;
  learnset: LearnsetEntry[];
  evolutions?: EvolutionBranch[];
  habitat: string;
  desc: string;
}

function sp(d: SpecDef): CreatureSpecies {
  return {
    id: d.id,
    dexNumber: d.num,
    name: d.name,
    description: d.desc,
    element: d.element,
    secondaryElement: d.second,
    rarity: d.rarity,
    stage: d.stage,
    baseStats: d.stats,
    learnset: d.learnset,
    evolutions: d.evolutions ?? [],
    captureRate: CAPTURE[d.rarity],
    baseXp: XP[d.rarity],
    habitat: d.habitat,
  };
}

// ============================================================
// CREATURE DATABASE — 50 original species
// ============================================================

export const CREATURES: CreatureSpecies[] = [
  // ----- Starter: Nature line -----
  sp({ num: 1, id: "sproutling", name: "Sproutling", element: "nature", rarity: "common", stage: 1,
    stats: stats(62, 55, 58, 64, 61), habitat: "Origin Village",
    desc: "A cheerful seed-sprite that sleeps buried to its chin in warm soil. Its leaf quivers when rain is coming.",
    learnset: learn([1, "leaf-dart"], [5, "vine-snap"], [9, "spore-cloud"], [14, "photosynth"], [20, "petal-storm"]),
    evolutions: [evoLevel("florabeast", 16)] }),
  sp({ num: 2, id: "florabeast", name: "Florabeast", element: "nature", rarity: "rare", stage: 2,
    stats: stats(82, 72, 76, 84, 76), habitat: "Verdant Forest",
    desc: "Its petals open only in battle. The pollen it scatters makes opponents drowsy and dreamful.",
    learnset: learn([1, "leaf-dart"], [16, "petal-storm"], [22, "bark-armor"], [28, "verdant-drain"], [34, "root-crush"]),
    evolutions: [evoLevel("elderbloom", 32)] }),
  sp({ num: 3, id: "elderbloom", name: "Elderbloom", element: "nature", second: "light", rarity: "epic", stage: 3,
    stats: stats(104, 88, 95, 112, 86), habitat: "Sky Temple gardens",
    desc: "A walking garden centuries old. Wounded creatures that rest beneath its canopy wake fully healed.",
    learnset: learn([1, "petal-storm"], [32, "blessing"], [38, "bloom-requiem"], [46, "world-tree-wrath"]) }),

  // ----- Starter: Fire line -----
  sp({ num: 4, id: "cindercub", name: "Cindercub", element: "fire", rarity: "common", stage: 1,
    stats: stats(58, 66, 52, 60, 64), habitat: "Origin Village",
    desc: "A soot-furred cub that sneezes sparks when excited. It hoards warm pebbles in its cheeks.",
    learnset: learn([1, "ember-flick"], [5, "flame-lash"], [9, "scorch"], [14, "cinder-veil"], [20, "blaze-claw"]),
    evolutions: [evoLevel("pyrelynx", 16)] }),
  sp({ num: 5, id: "pyrelynx", name: "Pyrelynx", element: "fire", rarity: "rare", stage: 2,
    stats: stats(76, 88, 68, 78, 86), habitat: "Desert Frontier",
    desc: "Its whiskers read heat the way eyes read light. It stalks prey through total darkness by warmth alone.",
    learnset: learn([1, "flame-lash"], [16, "blaze-claw"], [22, "twin-flare"], [28, "inferno-surge"], [34, "heat-sap"]),
    evolutions: [evoLevel("solfang", 32)] }),
  sp({ num: 6, id: "solfang", name: "Solfang", element: "fire", rarity: "epic", stage: 3,
    stats: stats(95, 115, 84, 100, 96), habitat: "Thunder Plateau",
    desc: "Legends say its fangs are shards of a fallen sun. Its roar turns night to noon for a single heartbeat.",
    learnset: learn([1, "blaze-claw"], [32, "magma-burst"], [38, "pyre-nova"], [46, "sunfall-comet"]) }),

  // ----- Starter: Water line -----
  sp({ num: 7, id: "dripple", name: "Dripple", element: "water", rarity: "common", stage: 1,
    stats: stats(64, 56, 60, 62, 58), habitat: "Origin Village",
    desc: "A droplet-shaped spirit that polishes river stones for fun. It cries when ponds dry up — refilling them.",
    learnset: learn([1, "splash-jab"], [5, "bubble-barrage"], [9, "soak"], [14, "renewing-rain"], [20, "riptide"]),
    evolutions: [evoLevel("marlune", 16)] }),
  sp({ num: 8, id: "marlune", name: "Marlune", element: "water", rarity: "rare", stage: 2,
    stats: stats(86, 70, 80, 84, 70), habitat: "Crystal Caverns pools",
    desc: "Its crescent fin glows with moonlight it drank as a Dripple. Tides shift subtly wherever it swims.",
    learnset: learn([1, "splash-jab"], [16, "riptide"], [22, "mist-cloak"], [28, "pressure-jet"], [34, "deluge"]),
    evolutions: [evoLevel("leviadon", 32)] }),
  sp({ num: 9, id: "leviadon", name: "Leviadon", element: "water", second: "earth", rarity: "epic", stage: 3,
    stats: stats(118, 92, 102, 96, 72), habitat: "Deep lakes",
    desc: "A gentle titan whose shell hosts whole reefs. When it surfaces, fishermen swear the horizon bends.",
    learnset: learn([1, "riptide"], [32, "deluge"], [38, "abyss-maw"], [46, "tsunami-call"]) }),

  // ----- Wind bird line -----
  sp({ num: 10, id: "chirpuff", name: "Chirpuff", element: "wind", rarity: "common", stage: 1,
    stats: stats(54, 54, 48, 56, 74), habitat: "Verdant Forest canopy",
    desc: "A palm-sized puffball that rides breezes it whistles into being. It naps inside its own tiny whirlwind.",
    learnset: learn([1, "gust-blade"], [6, "zephyr-jab"], [11, "tailwind"], [17, "air-ripper"]),
    evolutions: [evoLevel("galehawk", 18)] }),
  sp({ num: 11, id: "galehawk", name: "Galehawk", element: "wind", rarity: "rare", stage: 2,
    stats: stats(72, 80, 64, 74, 100), habitat: "Open skies",
    desc: "It folds its wings and falls like a javelin. Listeners on the ground hear the sky tear.",
    learnset: learn([1, "gust-blade"], [18, "air-ripper"], [24, "jetstream"], [30, "cyclone-spin"]),
    evolutions: [evoLevel("tempestrix", 36)] }),
  sp({ num: 12, id: "tempestrix", name: "Tempestrix", element: "wind", second: "electric", rarity: "epic", stage: 3,
    stats: stats(88, 96, 78, 102, 118), habitat: "Thunder Plateau",
    desc: "Storm queen of the high plateau. Lightning courses harmlessly through her feathers — then not so harmlessly through her foes.",
    learnset: learn([1, "air-ripper"], [36, "tempest-howl"], [42, "storm-caller"], [48, "sky-sever"]) }),

  // ----- Forest commons -----
  sp({ num: 13, id: "mossling", name: "Mossling", element: "nature", rarity: "common", stage: 1,
    stats: stats(66, 52, 66, 50, 46), habitat: "Verdant Forest floor",
    desc: "Indistinguishable from a mossy stone until it yawns. Hikers apologize to rocks out of habit.",
    learnset: learn([1, "vine-snap"], [7, "bark-armor"], [13, "toxin-thorn"], [19, "root-crush"]),
    evolutions: [evoLevel("thornhide", 20)] }),
  sp({ num: 14, id: "thornhide", name: "Thornhide", element: "nature", second: "earth", rarity: "rare", stage: 2,
    stats: stats(92, 78, 96, 60, 50), habitat: "Verdant Forest deep groves",
    desc: "Its back is a fortress of living briars. Forest folk leave offerings of rainwater at its sleeping spots.",
    learnset: learn([1, "vine-snap"], [20, "root-crush"], [26, "granite-guard"], [33, "verdant-drain"]) }),
  sp({ num: 15, id: "glowbug", name: "Glowbug", element: "electric", rarity: "common", stage: 1,
    stats: stats(50, 48, 46, 66, 70), habitat: "Verdant Forest at night",
    desc: "Its abdomen stores static from rubbing against flower petals. Swarms light the forest like festival lanterns.",
    learnset: learn([1, "spark-snap"], [7, "jolt"], [13, "capacitor"], [19, "volt-fang"]),
    evolutions: [evoLevel("voltmoth", 21)] }),
  sp({ num: 16, id: "voltmoth", name: "Voltmoth", element: "electric", rarity: "rare", stage: 2,
    stats: stats(70, 64, 62, 100, 94), habitat: "Thunder Plateau",
    desc: "Its wing scales are natural capacitors. A resting Voltmoth can power a village mill for a day.",
    learnset: learn([1, "jolt"], [21, "volt-fang"], [27, "static-field"], [34, "chain-lightning"]) }),

  // ----- Cave line -----
  sp({ num: 17, id: "pebblit", name: "Pebblit", element: "earth", rarity: "common", stage: 1,
    stats: stats(60, 62, 72, 44, 40), habitat: "Crystal Caverns",
    desc: "A round stone-child that tumbles instead of walking. It collects shiny crystals it can never carry home.",
    learnset: learn([1, "pebble-toss"], [7, "mud-slap"], [13, "granite-guard"], [19, "boulder-roll"]),
    evolutions: [evoLevel("boulderon", 22)] }),
  sp({ num: 18, id: "boulderon", name: "Boulderon", element: "earth", rarity: "rare", stage: 2,
    stats: stats(84, 86, 100, 52, 44), habitat: "Crystal Caverns depths",
    desc: "It naps for years at a time, waking only when miners' songs annoy it. Avalanches follow its tantrums.",
    learnset: learn([1, "boulder-roll"], [22, "stone-edge"], [28, "quicksand"], [35, "fault-line"]),
    evolutions: [evoLevel("titanstone", 38)] }),
  sp({ num: 19, id: "titanstone", name: "Titanstone", element: "earth", rarity: "epic", stage: 3,
    stats: stats(112, 108, 124, 60, 42), habitat: "Mountain hearts",
    desc: "Mountains are said to be Titanstones that never woke up. The crystals on its back chart the constellations of its birth-night.",
    learnset: learn([1, "stone-edge"], [38, "fault-line"], [44, "tectonic-roar"], [50, "meteor-fist"]) }),

  // ----- Fire imp line (item evolution) -----
  sp({ num: 20, id: "emberimp", name: "Emberimp", element: "fire", rarity: "common", stage: 1,
    stats: stats(52, 64, 46, 64, 62), habitat: "Crystal Caverns vents",
    desc: "A mischievous wisp that steals candle flames. Blacksmiths bribe it with coal to keep their forges hot.",
    learnset: learn([1, "ember-flick"], [8, "scorch"], [15, "heat-sap"], [22, "twin-flare"]),
    evolutions: [evoItem("ashfiend", "ember-stone", "Use Ember Stone")] }),
  sp({ num: 21, id: "ashfiend", name: "Ashfiend", element: "fire", second: "shadow", rarity: "rare", stage: 2,
    stats: stats(74, 92, 60, 92, 80), habitat: "Burnt hollows",
    desc: "Born when an Emberimp swallows a dying fire whole. It grieves for every flame it has ever extinguished.",
    learnset: learn([1, "scorch"], [24, "umbral-spike"], [30, "inferno-surge"], [37, "soul-siphon"]) }),

  // ----- Water fawn line (friendship) -----
  sp({ num: 22, id: "aquafawn", name: "Aquafawn", element: "water", rarity: "common", stage: 1,
    stats: stats(58, 50, 54, 66, 68), habitat: "Forest streams",
    desc: "A shy fawn with hooves of sea-glass. It only drinks from pools that reflect the whole sky.",
    learnset: learn([1, "splash-jab"], [8, "renewing-rain"], [15, "mist-cloak"], [22, "pressure-jet"]),
    evolutions: [evoFriend("mistelk", 160)] }),
  sp({ num: 23, id: "mistelk", name: "Mistelk", element: "water", second: "wind", rarity: "rare", stage: 2,
    stats: stats(80, 66, 72, 96, 88), habitat: "Foggy clearings",
    desc: "Its antlers comb fog out of the morning air. It appears only to tamers its younger self learned to trust.",
    learnset: learn([1, "pressure-jet"], [25, "second-wind"], [31, "deluge"], [38, "cyclone-spin"]) }),

  // ----- Branch evolution line -----
  sp({ num: 24, id: "branchling", name: "Branchling", element: "nature", rarity: "common", stage: 1,
    stats: stats(56, 58, 56, 58, 56), habitat: "Verdant Forest edge",
    desc: "A twig-spirit torn between sun and moon. The charm it is given decides which voice it follows.",
    learnset: learn([1, "leaf-dart"], [8, "vine-snap"], [15, "pollen-daze"], [22, "petal-storm"]),
    evolutions: [
      evoItem("solivine", "sun-charm", "Use Sun Charm"),
      evoItem("lunivine", "moon-charm", "Use Moon Charm"),
    ] }),
  sp({ num: 25, id: "solivine", name: "Solivine", element: "nature", second: "light", rarity: "rare", stage: 2,
    stats: stats(78, 74, 70, 94, 78), habitat: "Sunlit groves",
    desc: "Chose the sun. Its blossoms track daylight even through stone, and its nectar cures melancholy.",
    learnset: learn([1, "petal-storm"], [24, "guiding-glow"], [30, "prism-ray"], [37, "bloom-requiem"]) }),
  sp({ num: 26, id: "lunivine", name: "Lunivine", element: "nature", second: "shadow", rarity: "rare", stage: 2,
    stats: stats(78, 88, 70, 80, 78), habitat: "Moonlit groves",
    desc: "Chose the moon. It blooms only at night, and its petals remember every dream dreamt beneath them.",
    learnset: learn([1, "petal-storm"], [24, "dread-whisper"], [30, "umbral-spike"], [37, "soul-siphon"]) }),

  // ----- Desert -----
  sp({ num: 27, id: "sandskip", name: "Sandskip", element: "earth", rarity: "common", stage: 1,
    stats: stats(54, 60, 52, 48, 78), habitat: "Desert Frontier dunes",
    desc: "It skips across dunes like a stone across water. Caravans follow its tracks to find firm sand.",
    learnset: learn([1, "mud-slap"], [9, "sand-blind"], [16, "dune-crush"], [23, "quicksand"]),
    evolutions: [evoLevel("duneraptor", 24)] }),
  sp({ num: 28, id: "duneraptor", name: "Duneraptor", element: "earth", second: "wind", rarity: "rare", stage: 2,
    stats: stats(76, 94, 68, 60, 104), habitat: "Desert Frontier wastes",
    desc: "It surfs dune-faces on splayed talons at terrifying speed. Sandstorms are sometimes just one Duneraptor showing off.",
    learnset: learn([1, "dune-crush"], [24, "air-ripper"], [31, "stone-edge"], [38, "cyclone-spin"]) }),
  sp({ num: 29, id: "scorchadillo", name: "Scorchadillo", element: "fire", second: "earth", rarity: "rare", stage: 2,
    stats: stats(88, 82, 92, 58, 56), habitat: "Desert Frontier badlands",
    desc: "Its shell plates clack open to vent furnace heat. It rolls through campfires to recharge, scattering embers.",
    learnset: learn([1, "boulder-roll"], [20, "magma-burst"], [27, "granite-guard"], [34, "fault-line"]) }),
  sp({ num: 30, id: "cactiling", name: "Cactiling", element: "nature", second: "earth", rarity: "common", stage: 1,
    stats: stats(62, 58, 64, 56, 40), habitat: "Desert Frontier oases",
    desc: "A waddling cactus that hugs first and apologizes later. Its flower blooms once a year — wishes made then come true, allegedly.",
    learnset: learn([1, "toxin-thorn"], [9, "vine-snap"], [16, "bark-armor"], [23, "root-crush"]),
    evolutions: [evoLevel("saguarrior", 26)] }),
  sp({ num: 31, id: "saguarrior", name: "Saguarrior", element: "nature", second: "earth", rarity: "rare", stage: 2,
    stats: stats(90, 90, 88, 62, 46), habitat: "Desert Frontier badlands",
    desc: "A towering cactus knight that duels sandstorms for sport. Each arm-scar marks a storm it outlasted.",
    learnset: learn([1, "root-crush"], [26, "stone-edge"], [33, "iron-will"], [40, "world-tree-wrath"]) }),

  // ----- Frozen Ridge -----
  sp({ num: 32, id: "frostfox", name: "Frostfox", element: "ice", rarity: "common", stage: 1,
    stats: stats(56, 58, 50, 68, 72), habitat: "Frozen Ridge",
    desc: "Its nine tail-tips trace frost patterns on windows at night. It considers this high art.",
    learnset: learn([1, "frost-shard"], [9, "chill-touch"], [16, "frostbite"], [23, "icicle-spear"]),
    evolutions: [evoItem("glacielle", "frost-gem", "Use Frost Gem")] }),
  sp({ num: 33, id: "glacielle", name: "Glacielle", element: "ice", second: "light", rarity: "rare", stage: 2,
    stats: stats(76, 70, 70, 106, 88), habitat: "Frozen Ridge aurora fields",
    desc: "A fox of living aurora. Where it walks, snow falls upward for a moment, as if the sky missed it.",
    learnset: learn([1, "icicle-spear"], [26, "frost-armor"], [32, "aurora-lance"], [39, "blessing"]) }),
  sp({ num: 34, id: "snowpup", name: "Snowpup", element: "ice", rarity: "common", stage: 1,
    stats: stats(64, 62, 58, 48, 58), habitat: "Frozen Ridge slopes",
    desc: "It headbutts snowdrifts to hear the crunch. Mountain rescuers train them to find buried travelers.",
    learnset: learn([1, "snowblind-rush"], [9, "chill-touch"], [16, "hail-volley"], [23, "glacial-mend"]),
    evolutions: [evoLevel("avalanchor", 25)] }),
  sp({ num: 35, id: "avalanchor", name: "Avalanchor", element: "ice", second: "earth", rarity: "rare", stage: 2,
    stats: stats(96, 92, 94, 56, 52), habitat: "Frozen Ridge peaks",
    desc: "Its paws fall with the weight of avalanches. It sleeps standing up, mistaken for a snow-capped crag.",
    learnset: learn([1, "snowblind-rush"], [25, "glacier-press"], [32, "granite-guard"], [39, "permafrost"]) }),
  sp({ num: 36, id: "shiverwing", name: "Shiverwing", element: "ice", second: "wind", rarity: "rare", stage: 2,
    stats: stats(72, 68, 64, 92, 96), habitat: "Frozen Ridge skies",
    desc: "A crystalline butterfly whose wingbeats sound like wind chimes. Blizzards part politely around it.",
    learnset: learn([1, "frost-shard"], [22, "hail-volley"], [29, "dizzy-gale"], [36, "absolute-zero"]) }),

  // ----- Electric line -----
  sp({ num: 37, id: "sparkit", name: "Sparkit", element: "electric", rarity: "common", stage: 1,
    stats: stats(52, 60, 46, 62, 76), habitat: "Thunder Plateau foothills",
    desc: "A static-furred kit that shocks everything it loves. Its hugs are warned about in three provinces.",
    learnset: learn([1, "spark-snap"], [8, "jolt"], [15, "overcharge"], [22, "volt-fang"]),
    evolutions: [evoLevel("voltail", 20)] }),
  sp({ num: 38, id: "voltail", name: "Voltail", element: "electric", rarity: "rare", stage: 2,
    stats: stats(70, 84, 60, 86, 98), habitat: "Thunder Plateau",
    desc: "Its twin tails complete a circuit when crossed. The resulting thunderclap is its battle-greeting.",
    learnset: learn([1, "volt-fang"], [20, "arc-lance"], [27, "short-circuit"], [34, "chain-lightning"]),
    evolutions: [evoLevel("fulgurex", 36)] }),
  sp({ num: 39, id: "fulgurex", name: "Fulgurex", element: "electric", rarity: "epic", stage: 3,
    stats: stats(86, 104, 76, 112, 110), habitat: "Thunder Plateau summit",
    desc: "The plateau's eternal storm is its heartbeat made weather. It judges challengers by the speed of their resolve.",
    learnset: learn([1, "arc-lance"], [36, "static-field"], [42, "gigavolt-crash"], [48, "storm-caller"]) }),

  // ----- Shadow cave dwellers -----
  sp({ num: 40, id: "gloombat", name: "Gloombat", element: "shadow", rarity: "common", stage: 1,
    stats: stats(50, 56, 44, 60, 80), habitat: "Crystal Caverns shadows",
    desc: "It drinks darkness the way moths drink nectar. Lantern-light makes it sneeze adorable puffs of gloom.",
    learnset: learn([1, "gloom-claw"], [8, "dread-whisper"], [15, "shade-step"], [22, "night-bite"]),
    evolutions: [evoLevel("duskwraith", 24)] }),
  sp({ num: 41, id: "duskwraith", name: "Duskwraith", element: "shadow", rarity: "rare", stage: 2,
    stats: stats(70, 88, 58, 94, 100), habitat: "Capital City underdistrict",
    desc: "A cloak with nobody inside — or so it lets you believe. It collects forgotten names and whispers them back kindly.",
    learnset: learn([1, "night-bite"], [24, "umbral-spike"], [31, "curse-mark"], [38, "phantom-rend"]) }),
  sp({ num: 42, id: "crystalisk", name: "Crystalisk", element: "earth", second: "light", rarity: "rare", stage: 2,
    stats: stats(82, 76, 98, 84, 48), habitat: "Crystal Caverns heart",
    desc: "A serpent of living prism-quartz. Songs sung near it come back harmonized, a half-step brighter.",
    learnset: learn([1, "pebble-toss"], [20, "prism-ray"], [27, "granite-guard"], [34, "halo-burst"]) }),

  // ----- Light line (friendship) -----
  sp({ num: 43, id: "lumigleam", name: "Lumigleam", element: "light", rarity: "rare", stage: 1,
    stats: stats(60, 54, 58, 88, 76), habitat: "Sky Temple approach",
    desc: "A wisp of dawnlight that follows kind travelers. It dims when its tamer tells a lie.",
    learnset: learn([1, "glimmer-bolt"], [12, "guiding-glow"], [19, "dazzle"], [26, "prism-ray"]),
    evolutions: [evoFriend("seraphlume", 180)] }),
  sp({ num: 44, id: "seraphlume", name: "Seraphlume", element: "light", rarity: "epic", stage: 2,
    stats: stats(84, 70, 80, 120, 94), habitat: "Sky Temple sanctum",
    desc: "Trust given shape and wings. Its six feathers of pure radiance each carry one memory of being loved.",
    learnset: learn([1, "prism-ray"], [30, "blessing"], [37, "judgment-flare"], [45, "dawnbreaker"]) }),

  // ----- Shadow quest line -----
  sp({ num: 45, id: "shadeling", name: "Shadeling", element: "shadow", rarity: "common", stage: 1,
    stats: stats(54, 62, 50, 64, 66), habitat: "Anywhere lights gutter",
    desc: "A scrap of someone's lost shadow, looking for a new someone. It copies its tamer's gestures half a beat late.",
    learnset: learn([1, "gloom-claw"], [9, "venom-shade"], [16, "intimidate"], [23, "umbral-spike"]),
    evolutions: [evoQuest("nyxfiend", "side-shadow-pact", "Complete 'The Shadow Pact'")] }),
  sp({ num: 46, id: "nyxfiend", name: "Nyxfiend", element: "shadow", rarity: "epic", stage: 2,
    stats: stats(82, 106, 70, 102, 92), habitat: "Bound to its tamer",
    desc: "A Shadeling that signed its name in starless ink. Its loyalty is absolute; its grin, unsettling.",
    learnset: learn([1, "umbral-spike"], [30, "phantom-rend"], [37, "soul-siphon"], [44, "void-collapse"]) }),

  // ----- Late-game epics -----
  sp({ num: 47, id: "prismaw", name: "Prismaw", element: "light", second: "ice", rarity: "epic", stage: 3,
    stats: stats(94, 86, 92, 108, 80), habitat: "Sky Temple spires",
    desc: "Its jaws refract light into solid blades. It eats nothing but winter sunrises, and is always slightly hungry.",
    learnset: learn([1, "prism-ray"], [34, "icicle-spear"], [40, "aurora-lance"], [46, "judgment-flare"]) }),
  sp({ num: 48, id: "emberdrake", name: "Emberdrake", element: "fire", second: "wind", rarity: "epic", stage: 3,
    stats: stats(92, 110, 82, 96, 100), habitat: "Thunder Plateau thermals",
    desc: "A young drake that rides storm-thermals to drink lightning. Its molted scales are prized forge-coals.",
    learnset: learn([1, "blaze-claw"], [34, "jetstream"], [40, "pyre-nova"], [46, "tempest-howl"]) }),

  // ----- Legendaries -----
  sp({ num: 49, id: "luxorath", name: "Luxorath", element: "light", rarity: "legendary", stage: 3,
    stats: stats(110, 100, 104, 134, 108), habitat: "Sky Temple apex",
    desc: "The First Dawn given form. It has watched every sunrise since the world began, and remembers each one fondly.",
    learnset: learn([1, "halo-burst"], [40, "searing-ray"], [45, "judgment-flare"], [50, "dawnbreaker"]) }),
  sp({ num: 50, id: "umbrageist", name: "Umbrageist", element: "shadow", rarity: "legendary", stage: 3,
    stats: stats(110, 124, 96, 120, 106), habitat: "Beneath Capital City",
    desc: "The world's first night, sealed beneath the capital. It does not hate the light — it simply remembers being everything.",
    learnset: learn([1, "phantom-rend"], [40, "curse-mark"], [45, "void-collapse"], [50, "eclipse-reign"]) }),

  // ----- AR-exclusive (#51) — appears only through the AR lens -----
  sp({ num: 51, id: "embercub", name: "Embercub", element: "fire", rarity: "rare", stage: 1,
    stats: stats(70, 78, 62, 80, 88), habitat: "Found only through the AR lens",
    desc: "A brave, playful fire-fox that flickers between worlds. Only tamers who look through the AR lens can see its flame-shaped tail dance in the real one.",
    learnset: learn([1, "ember-flick"], [8, "scorch"], [15, "cinder-veil"], [22, "twin-flare"], [30, "inferno-surge"]) }),
];

export const SPECIES_MAP: Record<string, CreatureSpecies> = Object.fromEntries(
  CREATURES.map((c) => [c.id, c])
);

export function getSpecies(id: string): CreatureSpecies {
  const s = SPECIES_MAP[id];
  if (!s) throw new Error(`Unknown species: ${id}`);
  return s;
}
