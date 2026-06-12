import type { Quest } from "./types";

export const QUESTS: Quest[] = [
  // ============ STORY QUESTS (8) ============
  {
    id: "main-01", type: "story", order: 1, name: "First Steps",
    description: "Elder Rowan believes you are ready for the tamer's road. Walk the Verdant Forest and prove it.",
    giverNpcId: "elder-rowan",
    objectives: [
      { kind: "reach", mapId: "verdant-forest", label: "Enter the Verdant Forest" },
      { kind: "capture", count: 1, label: "Capture any wild creature" },
    ],
    rewardGold: 300, rewardItems: [{ itemId: "basic-orb", qty: 5 }], rewardXp: 100,
  },
  {
    id: "main-02", type: "story", order: 2, name: "The Verdant Trial",
    description: "The Bramble Warden Vael guards the forest's deep grove. Earn its amulet to open the way east.",
    requires: "main-01",
    objectives: [{ kind: "defeat_boss", bossId: "boss-verdant", label: "Defeat Vael, the Bramble Warden" }],
    rewardGold: 500, rewardCrystals: 5, rewardXp: 250,
  },
  {
    id: "main-03", type: "story", order: 3, name: "Heart of Crystal",
    description: "The Crystal Caverns sing a warning. Korr, the Mountain's Heart, stirs in the deepest chamber.",
    requires: "main-02",
    objectives: [
      { kind: "reach", mapId: "crystal-caverns", label: "Enter the Crystal Caverns" },
      { kind: "defeat_boss", bossId: "boss-cavern", label: "Defeat Korr, the Mountain's Heart" },
    ],
    rewardGold: 800, rewardCrystals: 10, rewardXp: 400,
  },
  {
    id: "main-04", type: "story", order: 4, name: "Across the Sands",
    description: "Beyond the caverns lies the Desert Frontier — and Sirocco, the gale that has never lost a race.",
    requires: "main-03",
    objectives: [
      { kind: "reach", mapId: "desert-frontier", label: "Reach the Desert Frontier" },
      { kind: "defeat_boss", bossId: "boss-desert", label: "Defeat Sirocco, the Endless Gale" },
    ],
    rewardGold: 1200, rewardCrystals: 15, rewardXp: 600,
  },
  {
    id: "main-05", type: "story", order: 5, name: "The Sleeping Avalanche",
    description: "The Frozen Ridge bars the northern road. Wake Boreas gently — or not at all.",
    requires: "main-04",
    objectives: [
      { kind: "reach", mapId: "frozen-ridge", label: "Climb the Frozen Ridge" },
      { kind: "defeat_boss", bossId: "boss-frozen", label: "Defeat Boreas, the Sleeping Avalanche" },
    ],
    rewardGold: 1600, rewardCrystals: 20, rewardXp: 800,
  },
  {
    id: "main-06", type: "story", order: 6, name: "Stormheart",
    description: "The Thunder Plateau's eternal storm has a heart, and it judges all challengers at lightning speed.",
    requires: "main-05",
    objectives: [
      { kind: "reach", mapId: "thunder-plateau", label: "Ascend the Thunder Plateau" },
      { kind: "defeat_boss", bossId: "boss-thunder", label: "Defeat Voltaras, the Stormheart" },
    ],
    rewardGold: 2200, rewardCrystals: 25, rewardXp: 1000,
  },
  {
    id: "main-07", type: "story", order: 7, name: "Trial of the First Dawn",
    description: "Atop the Sky Temple, Luxorath measures every soul. Be bright enough to face what waits below the Capital.",
    requires: "main-06",
    objectives: [
      { kind: "reach", mapId: "sky-temple", label: "Enter the Sky Temple" },
      { kind: "defeat_boss", bossId: "boss-sky", label: "Pass the trial of Luxorath" },
    ],
    rewardGold: 3000, rewardCrystals: 35, rewardXp: 1400,
  },
  {
    id: "main-08", type: "story", order: 8, name: "The First Night",
    description: "The seal beneath Capital City is failing. Defeat the Last Seal's guardian, then face the First Night itself — and become the Grand Tamer.",
    requires: "main-07", giverNpcId: "chancellor-vade",
    objectives: [
      { kind: "defeat_boss", bossId: "boss-gate", label: "Defeat Nocten, the Last Seal" },
      { kind: "defeat_boss", bossId: "boss-final", label: "Defeat Umbrageist, the First Night" },
    ],
    rewardGold: 10000, rewardCrystals: 100, rewardXp: 3000,
  },

  // ============ SIDE QUESTS (8) ============
  {
    id: "side-lost-locket", type: "side", name: "Granny's Locket",
    description: "Granny Sage lost her sister's locket somewhere in the Verdant Forest. Find it and bring it home.",
    giverNpcId: "granny-sage",
    objectives: [
      { kind: "collect", itemId: "lost-locket", count: 1, label: "Find the Lost Locket in the forest" },
      { kind: "talk", npcId: "granny-sage", label: "Return the locket to Granny Sage" },
    ],
    rewardGold: 400, rewardItems: [{ itemId: "great-orb", qty: 2 }], rewardXp: 150,
  },
  {
    id: "side-herb-run", type: "side", name: "The Moonherb Run",
    description: "Botanist Ivy needs a bundle of moonherbs from deep in the forest. Her knees have retired; your legs have not.",
    giverNpcId: "botanist-ivy",
    objectives: [
      { kind: "collect", itemId: "herb-bundle", count: 1, label: "Gather the herb bundle" },
      { kind: "talk", npcId: "botanist-ivy", label: "Deliver the herbs to Ivy" },
    ],
    rewardGold: 350, rewardItems: [{ itemId: "small-potion", qty: 3 }], rewardXp: 120,
  },
  {
    id: "side-crystal-count", type: "side", name: "Shards for Dukk",
    description: "Miner Dukk pays well for tamers who clear out the cavern's rowdier residents. LOUDLY.",
    giverNpcId: "miner-dukk",
    objectives: [{ kind: "win_battles", count: 5, label: "Win 5 battles in the wild or against tamers" }],
    rewardGold: 600, rewardCrystals: 8, rewardXp: 200,
  },
  {
    id: "side-sand-capture", type: "side", name: "Children of the Sand",
    description: "Nomad Resh will share the desert's secrets with a tamer who captures three creatures of the earth.",
    giverNpcId: "nomad-resh",
    objectives: [{ kind: "capture", element: "earth", count: 3, label: "Capture 3 Earth-element creatures" }],
    rewardGold: 800, rewardItems: [{ itemId: "ultra-orb", qty: 2 }], rewardXp: 300,
  },
  {
    id: "side-frozen-rescue", type: "side", name: "The Missing Climber",
    description: "A climber vanished near the east drift of the Frozen Ridge. Guide Yura fears the worst; prove her wrong.",
    giverNpcId: "guide-yura",
    objectives: [
      { kind: "reach", mapId: "frozen-ridge", label: "Search the Frozen Ridge east drift" },
      { kind: "win_battles", count: 3, label: "Drive off 3 aggressive wild creatures" },
      { kind: "talk", npcId: "guide-yura", label: "Report back to Guide Yura" },
    ],
    rewardGold: 900, rewardItems: [{ itemId: "thaw-salve", qty: 3 }], rewardXp: 350,
  },
  {
    id: "side-storm-study", type: "side", name: "The Storm's Heartbeat",
    description: "Stormwatcher Kaelo insists the plateau's storm respects only demonstrated strength. Demonstrate some.",
    giverNpcId: "stormwatcher-kaelo",
    objectives: [
      { kind: "defeat_trainer", trainerId: "tr-stormcaller-rai", label: "Defeat Stormcaller Rai" },
      { kind: "defeat_trainer", trainerId: "tr-skyduelist-wren", label: "Defeat Sky Duelist Wren" },
    ],
    rewardGold: 1400, rewardCrystals: 15, rewardXp: 500,
  },
  {
    id: "side-light-offering", type: "side", name: "An Offering of Light",
    description: "Keeper Orin will open the apex sanctum only to a tamer who has befriended a creature of light.",
    giverNpcId: "keeper-orin",
    objectives: [{ kind: "capture", element: "light", count: 1, label: "Capture a Light-element creature" }],
    rewardGold: 1000, rewardItems: [{ itemId: "full-potion", qty: 1 }], rewardXp: 400,
  },
  {
    id: "side-shadow-pact", type: "side", name: "The Shadow Pact",
    description: "The archives speak of a pact: a Shadeling, Starless Ink, and a name freely given. Archivist Lumen is dying to see it performed.",
    giverNpcId: "archivist-lumen",
    objectives: [
      { kind: "collect", itemId: "starless-ink", count: 1, label: "Obtain Starless Ink" },
      { kind: "talk", npcId: "archivist-lumen", label: "Perform the pact with Archivist Lumen" },
    ],
    rewardGold: 1500, rewardCrystals: 20, rewardXp: 600,
  },

  // ============ DAILY QUESTS (3) ============
  {
    id: "daily-battles", type: "daily", name: "Daily: Sparring Rounds",
    description: "Win 3 battles today. Champions are built one round at a time.",
    objectives: [{ kind: "win_battles", count: 3, label: "Win 3 battles" }],
    rewardGold: 300, rewardCrystals: 3, rewardXp: 150,
  },
  {
    id: "daily-capture", type: "daily", name: "Daily: New Friends",
    description: "Capture a wild creature today. The collection grows.",
    objectives: [{ kind: "capture", count: 1, label: "Capture 1 wild creature" }],
    rewardGold: 250, rewardCrystals: 3, rewardXp: 120,
  },
  {
    id: "daily-explorer", type: "daily", name: "Daily: Wanderlust",
    description: "Defeat 2 wild creatures today. The wilds keep you sharp.",
    objectives: [{ kind: "win_battles", count: 2, label: "Win 2 battles" }],
    rewardGold: 200, rewardCrystals: 2, rewardXp: 100,
  },
];

export const QUEST_MAP: Record<string, Quest> = Object.fromEntries(QUESTS.map((q) => [q.id, q]));

export function getQuest(id: string): Quest {
  const q = QUEST_MAP[id];
  if (!q) throw new Error(`Unknown quest: ${id}`);
  return q;
}
