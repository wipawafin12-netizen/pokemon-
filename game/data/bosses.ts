import type { Boss } from "./types";

// 8 Boss Guardians — one per region.
export const BOSSES: Boss[] = [
  {
    id: "boss-verdant", name: "Vael", title: "the Bramble Warden", location: "verdant-forest",
    speciesId: "thornhide", level: 14,
    description: "An ancient Thornhide whose briar-fortress back has never been breached. It judges tamers by how gently they walk.",
    mechanics: [
      { name: "Briar Bulwark", hook: "shield_every_3", description: "Every third turn, living briars harden its Defense." },
      { name: "Warden's Resolve", hook: "last_stand", description: "Survives the first lethal blow with 1 HP, refusing to fall." },
    ],
    rewardGold: 800, rewardCrystals: 10,
    rewardItems: [{ itemId: "forest-amulet", qty: 1 }, { itemId: "great-orb", qty: 3 }],
    flag: "boss-verdant",
  },
  {
    id: "boss-cavern", name: "Korr", title: "the Mountain's Heart", location: "crystal-caverns",
    speciesId: "titanstone", level: 20,
    description: "The oldest Titanstone, grown into the cavern itself. The crystals on its back are the cave's beating heart.",
    mechanics: [
      { name: "Crystal Carapace", hook: "shield_every_3", description: "Crystal plates regrow every third turn, raising Defense." },
      { name: "Echoing Counter", hook: "reflect", description: "Returns 20% of all damage taken as crystalline shrapnel." },
    ],
    rewardGold: 1200, rewardCrystals: 15,
    rewardItems: [{ itemId: "cavern-lantern", qty: 1 }, { itemId: "ember-stone", qty: 1 }],
    flag: "boss-cavern",
  },
  {
    id: "boss-desert", name: "Sirocco", title: "the Endless Gale", location: "desert-frontier",
    speciesId: "duneraptor", level: 26,
    description: "A Duneraptor so fast that the desert's sandstorms are merely its wake. It has never finished second.",
    mechanics: [
      { name: "Tailwind Surge", hook: "speed_ramp", description: "Its Speed rises every turn as the gale builds." },
      { name: "Twin Talon", hook: "double_strike", description: "Strikes twice per turn while above 70% HP." },
    ],
    rewardGold: 1700, rewardCrystals: 20,
    rewardItems: [{ itemId: "desert-compass", qty: 1 }, { itemId: "ultra-orb", qty: 2 }],
    flag: "boss-desert",
  },
  {
    id: "boss-frozen", name: "Boreas", title: "the Sleeping Avalanche", location: "frozen-ridge",
    speciesId: "avalanchor", level: 32,
    description: "An Avalanchor as old as the ridge itself. Climbers pray it stays asleep; you are about to wake it.",
    mechanics: [
      { name: "Permafrost Aura", hook: "status_aura", description: "Each turn, creeping cold may freeze the challenger." },
      { name: "Glacial Recovery", hook: "heal_once", description: "Once, below 30% HP, it buries itself in snow and heals 40%." },
    ],
    rewardGold: 2300, rewardCrystals: 25,
    rewardItems: [{ itemId: "ridge-horn", qty: 1 }, { itemId: "frost-gem", qty: 1 }],
    flag: "boss-frozen",
  },
  {
    id: "boss-thunder", name: "Voltaras", title: "the Stormheart", location: "thunder-plateau",
    speciesId: "fulgurex", level: 38,
    description: "The plateau's eternal storm given will. Its judgment arrives at the speed of lightning — and so does its disappointment.",
    mechanics: [
      { name: "Static Dominion", hook: "status_aura", description: "Each turn, ambient voltage may stun the challenger." },
      { name: "Storm's Fury", hook: "enrage_below_half", description: "Below half HP, its Attack surges fiercely." },
    ],
    rewardGold: 3000, rewardCrystals: 30,
    rewardItems: [{ itemId: "storm-sigil", qty: 1 }, { itemId: "mythic-orb", qty: 1 }],
    flag: "boss-thunder",
  },
  {
    id: "boss-sky", name: "Luxorath", title: "the First Dawn", location: "sky-temple",
    speciesId: "luxorath", level: 44,
    description: "The living memory of the world's first sunrise. Its trial is not malice but measure: are you bright enough to face the dark below?",
    mechanics: [
      { name: "Dawn's Mercy", hook: "heal_once", description: "Once, below 30% HP, the first light restores 40% of its HP." },
      { name: "Radiant Rebuke", hook: "reflect", description: "Returns 20% of damage taken as searing light." },
    ],
    rewardGold: 4000, rewardCrystals: 40,
    rewardItems: [{ itemId: "temple-feather", qty: 1 }, { itemId: "full-potion", qty: 2 }],
    flag: "boss-sky",
  },
  {
    id: "boss-gate", name: "Nocten", title: "the Last Seal", location: "capital-city",
    speciesId: "duskwraith", level: 47,
    description: "The Duskwraith marshal who has guarded the seal beneath the Capital for a century. It hopes, every night, that no one comes.",
    mechanics: [
      { name: "Twin Shadow", hook: "double_strike", description: "Strikes twice per turn while above 70% HP." },
      { name: "Whispered Dread", hook: "status_aura", description: "Each turn, dread whispers may lull the challenger to sleep." },
    ],
    rewardGold: 5000, rewardCrystals: 50,
    rewardItems: [{ itemId: "starless-ink", qty: 1 }, { itemId: "mythic-orb", qty: 1 }],
    flag: "boss-gate",
  },
  {
    id: "boss-final", name: "Umbrageist", title: "the First Night", location: "capital-city",
    speciesId: "umbrageist", level: 50,
    description: "Before the first dawn, there was only it. It does not want revenge — it wants to be everything again. Stop it, Grand Tamer.",
    mechanics: [
      { name: "Eclipse Aura", hook: "status_aura", description: "Each turn, the deepening dark may inflict sleep." },
      { name: "Night's Wrath", hook: "enrage_below_half", description: "Below half HP, its Attack surges fiercely." },
      { name: "Eternal Dusk", hook: "last_stand", description: "Survives the first lethal blow with 1 HP — night does not end easily." },
    ],
    rewardGold: 10000, rewardCrystals: 100,
    rewardItems: [{ itemId: "mythic-orb", qty: 3 }],
    flag: "boss-final",
  },
];

export const BOSS_MAP: Record<string, Boss> = Object.fromEntries(BOSSES.map((b) => [b.id, b]));

export function getBoss(id: string): Boss {
  const b = BOSS_MAP[id];
  if (!b) throw new Error(`Unknown boss: ${id}`);
  return b;
}
