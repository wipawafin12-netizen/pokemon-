import type { Shop } from "./types";

export const SHOPS: Shop[] = [
  {
    id: "general-store",
    name: "Tobb's General Store",
    stock: [
      "basic-orb", "great-orb",
      "small-potion", "large-potion",
      "antidote", "thaw-salve", "burn-balm", "wake-chime", "nerve-tonic",
    ],
  },
  {
    id: "orb-shop",
    name: "Zara's Caravan Orbs",
    stock: ["basic-orb", "great-orb", "ultra-orb", "panacea", "revive-ember", "large-potion", "full-potion"],
    crystalStock: ["mythic-orb"],
  },
  {
    id: "evolution-shop",
    name: "Frostina's Destiny Emporium",
    stock: ["large-potion", "panacea", "revive-ember"],
    crystalStock: ["ember-stone", "sun-charm", "moon-charm", "frost-gem", "mythic-orb"],
  },
];

export const SHOP_MAP: Record<string, Shop> = Object.fromEntries(SHOPS.map((s) => [s.id, s]));
