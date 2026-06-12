import type { Trainer } from "./types";

// 20 trainers across the world, scaling in difficulty.
export const TRAINERS: Trainer[] = [
  // ----- Verdant Forest (4) -----
  { id: "tr-sprout-sam", name: "Sam", title: "Sprout Tamer", difficulty: 1, location: "verdant-forest",
    team: [{ speciesId: "mossling", level: 4 }], rewardGold: 120,
    introLine: "I just caught my first creature yesterday! Wanna see?", defeatLine: "Whoa... you're the real deal." },
  { id: "tr-bugcatcher-lila", name: "Lila", title: "Glow Chaser", difficulty: 1, location: "verdant-forest",
    team: [{ speciesId: "glowbug", level: 5 }, { speciesId: "chirpuff", level: 5 }], rewardGold: 150,
    introLine: "My Glowbug shines brighter than your future!", defeatLine: "Dim... everything's gone dim." },
  { id: "tr-ranger-cole", name: "Cole", title: "Forest Ranger", difficulty: 2, location: "verdant-forest",
    team: [{ speciesId: "branchling", level: 7 }, { speciesId: "mossling", level: 8 }], rewardGold: 220,
    introLine: "The forest tests everyone who passes. Today, I'm the test.", defeatLine: "Passed. With distinction." },
  { id: "tr-herbalist-fern", name: "Fern", title: "Herbalist", difficulty: 2, location: "verdant-forest",
    team: [{ speciesId: "sproutling", level: 9 }, { speciesId: "aquafawn", level: 9 }], rewardGold: 260,
    rewardItems: [{ itemId: "small-potion", qty: 2 }],
    introLine: "Loser brews the tea!", defeatLine: "Chamomile or mint? You've earned both." },

  // ----- Crystal Caverns (3) -----
  { id: "tr-miner-brock", name: "Grit", title: "Crystal Miner", difficulty: 2, location: "crystal-caverns",
    team: [{ speciesId: "pebblit", level: 12 }, { speciesId: "pebblit", level: 13 }], rewardGold: 320,
    introLine: "These tunnels are mine! Pun very much intended.", defeatLine: "Dug my own grave there, huh." },
  { id: "tr-spelunker-echo", name: "Echo", title: "Spelunker", difficulty: 2, location: "crystal-caverns",
    team: [{ speciesId: "gloombat", level: 13 }, { speciesId: "emberimp", level: 14 }], rewardGold: 360,
    introLine: "Echo! Echo! ...Sorry, force of habit. Battle?", defeatLine: "Ow! Ow! ...That echoed too." },
  { id: "tr-gemhunter-vera", name: "Vera", title: "Gem Hunter", difficulty: 3, location: "crystal-caverns",
    team: [{ speciesId: "crystalisk", level: 16 }, { speciesId: "boulderon", level: 15 }], rewardGold: 480,
    rewardItems: [{ itemId: "great-orb", qty: 2 }],
    introLine: "I hunt treasures. You look like practice.", defeatLine: "Correction: you ARE the treasure." },

  // ----- Desert Frontier (4) -----
  { id: "tr-duneracer-jax", name: "Jax", title: "Dune Racer", difficulty: 3, location: "desert-frontier",
    team: [{ speciesId: "sandskip", level: 18 }, { speciesId: "sandskip", level: 19 }], rewardGold: 520,
    introLine: "First to flinch loses. My Sandskips never flinch.", defeatLine: "We flinched. We absolutely flinched." },
  { id: "tr-mirage-nadia", name: "Nadia", title: "Mirage Dancer", difficulty: 3, location: "desert-frontier",
    team: [{ speciesId: "cactiling", level: 19 }, { speciesId: "pyrelynx", level: 20 }], rewardGold: 560,
    introLine: "Am I really here? Your creatures are about to find out.", defeatLine: "That defeat felt extremely real." },
  { id: "tr-sunblade-omar", name: "Omar", title: "Sunblade", difficulty: 3, location: "desert-frontier",
    team: [{ speciesId: "scorchadillo", level: 21 }, { speciesId: "duneraptor", level: 22 }], rewardGold: 640,
    rewardItems: [{ itemId: "burn-balm", qty: 2 }],
    introLine: "The desert forged me. What forged you?", defeatLine: "Forged... and folded, apparently." },
  { id: "tr-oasis-keeper-rime", name: "Rime", title: "Oasis Keeper", difficulty: 3, location: "desert-frontier",
    team: [{ speciesId: "marlune", level: 22 }, { speciesId: "saguarrior", level: 23 }], rewardGold: 700,
    introLine: "I guard the only water for miles. I don't lose.", defeatLine: "Drink up. You've earned the shade." },

  // ----- Frozen Ridge (3) -----
  { id: "tr-icewalker-sten", name: "Sten", title: "Icewalker", difficulty: 4, location: "frozen-ridge",
    team: [{ speciesId: "snowpup", level: 26 }, { speciesId: "frostfox", level: 27 }], rewardGold: 800,
    introLine: "Cold feet? You will have. Literally.", defeatLine: "Brrr-illiant battle. I'll see myself out." },
  { id: "tr-auroramage-liv", name: "Liv", title: "Aurora Mage", difficulty: 4, location: "frozen-ridge",
    team: [{ speciesId: "glacielle", level: 29 }, { speciesId: "shiverwing", level: 28 }], rewardGold: 900,
    rewardItems: [{ itemId: "thaw-salve", qty: 2 }],
    introLine: "The lights dance for me. Care to be the music?", defeatLine: "Even the aurora bows tonight." },
  { id: "tr-peakguard-ulf", name: "Ulf", title: "Peak Guard", difficulty: 4, location: "frozen-ridge",
    team: [{ speciesId: "avalanchor", level: 31 }, { speciesId: "boulderon", level: 30 }], rewardGold: 1000,
    introLine: "None pass the ridge unproven!", defeatLine: "Proven. Thoroughly. Pass, friend." },

  // ----- Thunder Plateau (3) -----
  { id: "tr-stormcaller-rai", name: "Rai", title: "Stormcaller", difficulty: 4, location: "thunder-plateau",
    team: [{ speciesId: "voltail", level: 34 }, { speciesId: "voltmoth", level: 33 }], rewardGold: 1150,
    introLine: "I count lightning strikes for fun. Let's add one more.", defeatLine: "Struck down by my own hobby." },
  { id: "tr-skyduelist-wren", name: "Wren", title: "Sky Duelist", difficulty: 4, location: "thunder-plateau",
    team: [{ speciesId: "galehawk", level: 35 }, { speciesId: "emberdrake", level: 36 }], rewardGold: 1300,
    rewardItems: [{ itemId: "nerve-tonic", qty: 2 }],
    introLine: "The sky is my arena. You're standing in it.", defeatLine: "Grounded. By you. Respect." },
  { id: "tr-thunderfist-goro", name: "Goro", title: "Thunderfist", difficulty: 5, location: "thunder-plateau",
    team: [{ speciesId: "voltail", level: 37 }, { speciesId: "scorchadillo", level: 36 }, { speciesId: "fulgurex", level: 38 }], rewardGold: 1600,
    introLine: "My fists echo the storm. Brace yourself!", defeatLine: "The storm... applauds." },

  // ----- Sky Temple / Capital City (3) -----
  { id: "tr-acolyte-sera", name: "Sera", title: "Temple Acolyte", difficulty: 5, location: "sky-temple",
    team: [{ speciesId: "lumigleam", level: 40 }, { speciesId: "solivine", level: 41 }], rewardGold: 1800,
    introLine: "The light tests all who climb. Shine, or step aside.", defeatLine: "You shine. The temple sees it too." },
  { id: "tr-duskblade-kane", name: "Kane", title: "Duskblade", difficulty: 5, location: "capital-city",
    team: [{ speciesId: "duskwraith", level: 44 }, { speciesId: "ashfiend", level: 43 }, { speciesId: "lunivine", level: 44 }], rewardGold: 2200,
    rewardItems: [{ itemId: "ultra-orb", qty: 2 }],
    introLine: "The Capital's shadows keep me employed. You keep me entertained.", defeatLine: "Entertaining AND humbling. Refund." },
  { id: "tr-champion-aria", name: "Aria", title: "Tamer Champion", difficulty: 5, location: "capital-city",
    team: [{ speciesId: "tempestrix", level: 47 }, { speciesId: "leviadon", level: 47 }, { speciesId: "solfang", level: 48 }], rewardGold: 3000,
    rewardItems: [{ itemId: "full-potion", qty: 2 }],
    introLine: "I held the title of Grand Tamer once. Show me why it should be yours.", defeatLine: "There it is. The fire. The title suits you." },
];

export const TRAINER_MAP: Record<string, Trainer> = Object.fromEntries(TRAINERS.map((t) => [t.id, t]));

export function getTrainer(id: string): Trainer {
  const t = TRAINER_MAP[id];
  if (!t) throw new Error(`Unknown trainer: ${id}`);
  return t;
}
