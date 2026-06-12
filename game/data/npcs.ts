import type { NPC } from "./types";

// 30 NPCs across the eight regions.
export const NPCS: NPC[] = [
  // ---------- Origin Village (6) ----------
  { id: "elder-rowan", name: "Elder Rowan", personality: "Warm, riddling, secretly mischievous", location: "origin-village", sprite: "elder",
    questId: "main-01",
    dialogue: [
      "Ah, the new tamer! The whole village has been whispering about you.",
      "The world beyond our hedges is wide, wild, and full of Eternal Monsters.",
      "Take your partner, walk the Verdant Forest, and come back with a story worth telling.",
    ] },
  { id: "healer-mira", name: "Healer Mira", personality: "Gentle, endlessly patient", location: "origin-village", sprite: "healer", healer: true,
    dialogue: ["Welcome to my clinic, dear. Let me see your creatures...", "There. Rested, mended, and fed. Off you go!"] },
  { id: "merchant-tobb", name: "Merchant Tobb", personality: "Cheerfully greedy", location: "origin-village", sprite: "merchant", shopId: "general-store",
    dialogue: ["Orbs! Potions! Slightly dented but perfectly legal goods!", "A tamer without supplies is just a person taking a dangerous walk."] },
  { id: "kid-pip", name: "Pip", personality: "Hyperactive, dreams of being a champion", location: "origin-village", sprite: "kid",
    dialogue: ["When I grow up I'm gonna catch FIFTY monsters!", "Did you know tall grass is where creatures hide? Everyone knows that!"] },
  { id: "granny-sage", name: "Granny Sage", personality: "Forgetful, kind, surprisingly sharp about monsters", location: "origin-village", sprite: "villager",
    questId: "side-lost-locket",
    dialogue: ["Oh dear, oh dear... I've lost my locket somewhere in the forest.", "My sister gave it to me when we were girls. Would you keep an eye out, dearie?"] },
  { id: "ranger-fenn", name: "Ranger Fenn", personality: "Practical, dry humor", location: "origin-village", sprite: "ranger",
    dialogue: ["Heading into the forest? Watch the tall grass — that's where wild creatures lurk.", "Save often. The world autosaves nothing but regrets."] },

  // ---------- Verdant Forest (4) ----------
  { id: "botanist-ivy", name: "Botanist Ivy", personality: "Obsessive about plants, talks to mushrooms", location: "verdant-forest", sprite: "scholar",
    questId: "side-herb-run",
    dialogue: ["Shh! The moonherbs are listening.", "I need a bundle of herbs from deeper in the forest — my knees, alas, have retired."] },
  { id: "hermit-bole", name: "Hermit Bole", personality: "Grumpy, secretly lonely", location: "verdant-forest", sprite: "elder",
    dialogue: ["Bah. Tamers. Always stomping the moss.", "...The guardian of this forest only respects those who walk gently. Remember that."] },
  { id: "scout-lark", name: "Scout Lark", personality: "Upbeat, terrible at directions", location: "verdant-forest", sprite: "ranger",
    dialogue: ["The Crystal Caverns are east! Or... west? They're somewhere, definitely.", "The forest guardian sleeps in the deep grove. Strong tamers only!"] },
  { id: "kid-nilla", name: "Nilla", personality: "Shy, loves bug-type... er, Glowbugs", location: "verdant-forest", sprite: "kid",
    dialogue: ["The Glowbugs come out at dusk. They like quiet people.", "I named one Blinky. Don't tell him, he gets embarrassed."] },

  // ---------- Crystal Caverns (3) ----------
  { id: "miner-dukk", name: "Miner Dukk", personality: "Booming voice, heart of gold", location: "crystal-caverns", sprite: "guard",
    questId: "side-crystal-count",
    dialogue: ["HELLO! Sorry! CAVES MAKE ME SHOUT!", "Crystal shards litter these tunnels. Bring me a few and I'll make it worth your while!"] },
  { id: "geologist-fay", name: "Geologist Fay", personality: "Precise, in love with rocks", location: "crystal-caverns", sprite: "scholar",
    dialogue: ["These crystals sing at 432 hertz. Perfectly natural. Utterly impossible.", "A Titanstone sleeps in the deepest chamber. Step lightly."] },
  { id: "healer-ondine", name: "Healer Ondine", personality: "Serene, speaks softly", location: "crystal-caverns", sprite: "healer", healer: true,
    dialogue: ["The cavern pools have healing properties. Rest your team a moment.", "There. The crystals hum kindly for you."] },

  // ---------- Desert Frontier (4) ----------
  { id: "caravan-zara", name: "Caravaneer Zara", personality: "Worldly, collects stories like coins", location: "desert-frontier", sprite: "merchant", shopId: "orb-shop",
    dialogue: ["Water first, orbs second, gossip third — the caravan code.", "I've crossed this desert forty times. It still surprises me. So do my prices."] },
  { id: "nomad-resh", name: "Nomad Resh", personality: "Quiet, reads the dunes like scripture", location: "desert-frontier", sprite: "ranger",
    questId: "side-sand-capture",
    dialogue: ["The desert hides its children well.", "Capture three creatures of the sand and I will teach you what the dunes taught me."] },
  { id: "healer-sol", name: "Healer Sol", personality: "Sun-baked optimist", location: "desert-frontier", sprite: "healer", healer: true,
    dialogue: ["Shade, water, and a song — the desert cure for everything.", "Your creatures are restored. Mind the noon sun!"] },
  { id: "kid-dustin", name: "Dustin", personality: "Buries things, forgets where", location: "desert-frontier", sprite: "kid",
    dialogue: ["I buried my favorite rock somewhere here. It's been three years.", "Sandskips skip TWICE as fast at sunset. I counted!"] },

  // ---------- Frozen Ridge (4) ----------
  { id: "guide-yura", name: "Guide Yura", personality: "Stoic, secretly knits tiny creature sweaters", location: "frozen-ridge", sprite: "ranger",
    questId: "side-frozen-rescue",
    dialogue: ["The ridge takes the unprepared. A climber went missing near the east drift.", "Find them, and the mountain will remember your kindness."] },
  { id: "healer-bram", name: "Healer Bram", personality: "Bear-like, gentle giant", location: "frozen-ridge", sprite: "healer", healer: true,
    dialogue: ["Cold toes? Colder creatures? Come by the fire.", "All warmed up. The ridge wind bites, but it never lies."] },
  { id: "skald-edda", name: "Skald Edda", personality: "Dramatic, narrates everything", location: "frozen-ridge", sprite: "elder",
    dialogue: ["AND LO! The tamer ascends the ridge, frost in their lashes, fire in their heart!", "The Avalanchor guardian sleeps atop the pass. Its snores cause avalanches. Truly."] },
  { id: "merchant-frostina", name: "Frostina", personality: "Chipper despite the cold", location: "frozen-ridge", sprite: "merchant", shopId: "evolution-shop",
    dialogue: ["Evolution stones, charms, and gems! Cold to the touch, warm to the destiny!", "A Frost Gem for your fox? An Ember Stone for your imp? Fate is for sale, friend."] },

  // ---------- Thunder Plateau (3) ----------
  { id: "stormwatcher-kaelo", name: "Stormwatcher Kaelo", personality: "Intense, counts seconds between thunderclaps", location: "thunder-plateau", sprite: "scholar",
    questId: "side-storm-study",
    dialogue: ["Every storm has a heartbeat. The plateau's beats in fours.", "Defeat the tamers training here — the storm respects strength shown, not claimed."] },
  { id: "healer-vesna", name: "Healer Vesna", personality: "Crackling with energy, literally", location: "thunder-plateau", sprite: "healer", healer: true,
    dialogue: ["Static cling is my love language. Hand over those tired creatures.", "Recharged! Mind the lightning — it minds you."] },
  { id: "hermit-ohm", name: "Hermit Ohm", personality: "Speaks in proverbs about resistance", location: "thunder-plateau", sprite: "elder",
    dialogue: ["The bolt does not ask permission. Neither does growth.", "Fulgurex tests all who climb the summit. Bring courage, not umbrellas."] },

  // ---------- Sky Temple (3) ----------
  { id: "priestess-alma", name: "Priestess Alma", personality: "Serene, sees more than she says", location: "sky-temple", sprite: "healer", healer: true,
    dialogue: ["The temple was old when the mountains were young.", "Rest, tamer. Even light pauses at dusk."] },
  { id: "keeper-orin", name: "Keeper Orin", personality: "Formal, guards ancient protocol", location: "sky-temple", sprite: "guard",
    questId: "side-light-offering",
    dialogue: ["Luxorath, the First Dawn, slumbers in the apex sanctum.", "Only a tamer who has befriended a creature of light may face the trial."] },
  { id: "pilgrim-suna", name: "Pilgrim Suna", personality: "Wide-eyed, journals everything", location: "sky-temple", sprite: "villager",
    dialogue: ["I walked two thousand steps to get here. Worth every blister.", "They say the temple's light heals grief. I believe it now."] },

  // ---------- Capital City (3) ----------
  { id: "chancellor-vade", name: "Chancellor Vade", personality: "Polished, weary, hiding fear", location: "capital-city", sprite: "guard",
    questId: "main-08",
    dialogue: ["Welcome to the Capital, tamer. I wish the timing were better.", "Something stirs beneath the city. The seal of the First Night weakens.", "If you carry the Temple's feather, then you are the one the dawn chose."] },
  { id: "healer-cordia", name: "Healer Cordia", personality: "Brisk, motherly", location: "capital-city", sprite: "healer", healer: true,
    dialogue: ["Capital Clinic, no waiting, no nonsense.", "Done. Drink water. You look like you fight legends for a living."] },
  { id: "archivist-lumen", name: "Archivist Lumen", personality: "Dusty, delighted by questions", location: "capital-city", sprite: "scholar",
    questId: "side-shadow-pact",
    dialogue: ["The archives mention a pact: a Shadeling, starless ink, and a name freely given.", "Bring me Starless Ink from the underdistrict, and your little shadow may become something... more."] },
];

export const NPC_MAP: Record<string, NPC> = Object.fromEntries(NPCS.map((n) => [n.id, n]));

export function getNpc(id: string): NPC {
  const n = NPC_MAP[id];
  if (!n) throw new Error(`Unknown NPC: ${id}`);
  return n;
}
