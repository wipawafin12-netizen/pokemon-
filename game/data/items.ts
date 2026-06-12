import type { Item } from "./types";

export const ITEMS: Item[] = [
  // ---------- Capture Orbs ----------
  { id: "basic-orb", name: "Basic Orb", category: "orb", price: 150, orbPower: 1.0, sellPrice: 60,
    description: "A hand-thrown capture orb woven from tamer's resin. Reliable, if unremarkable." },
  { id: "great-orb", name: "Great Orb", category: "orb", price: 500, orbPower: 1.6, sellPrice: 200,
    description: "A reinforced orb with a gravity core. Noticeably better at holding strong creatures." },
  { id: "ultra-orb", name: "Ultra Orb", category: "orb", price: 1100, orbPower: 2.2, sellPrice: 450,
    description: "A masterwork orb laced with crystal shard filament. Few creatures escape its pull." },
  { id: "mythic-orb", name: "Mythic Orb", category: "orb", price: -1, crystalPrice: 50, orbPower: 3.5, sellPrice: 1500,
    description: "Forged from a guardian's blessing. Even legends hesitate inside it." },

  // ---------- Potions ----------
  { id: "small-potion", name: "Small Potion", category: "potion", price: 120, healAmount: 40, sellPrice: 50,
    description: "A vial of verdant tonic. Restores 40 HP." },
  { id: "large-potion", name: "Large Potion", category: "potion", price: 450, healAmount: 120, sellPrice: 180,
    description: "A flask of concentrated tonic. Restores 120 HP." },
  { id: "full-potion", name: "Full Potion", category: "potion", price: 1500, healAmount: -1, sellPrice: 600,
    description: "Distilled springwater from the Sky Temple. Fully restores HP." },
  { id: "antidote", name: "Antidote", category: "potion", price: 100, cures: "poison", sellPrice: 40,
    description: "Bitter herbs that neutralize any poison." },
  { id: "thaw-salve", name: "Thaw Salve", category: "potion", price: 100, cures: "freeze", sellPrice: 40,
    description: "A warming salve that melts magical ice." },
  { id: "burn-balm", name: "Burn Balm", category: "potion", price: 100, cures: "burn", sellPrice: 40,
    description: "Cooling aloe balm that soothes burns instantly." },
  { id: "wake-chime", name: "Wake Chime", category: "potion", price: 100, cures: "sleep", sellPrice: 40,
    description: "A tiny silver chime. One ring banishes enchanted sleep." },
  { id: "nerve-tonic", name: "Nerve Tonic", category: "potion", price: 100, cures: "stun", sellPrice: 40,
    description: "A zesty tonic that steadies stunned nerves." },
  { id: "panacea", name: "Panacea", category: "potion", price: 600, cures: "all", sellPrice: 240,
    description: "A golden elixir that cures every status ailment." },
  { id: "revive-ember", name: "Revive Ember", category: "potion", price: 900, revivePercent: 50, sellPrice: 360,
    description: "A phoenix-warm ember that rekindles a fainted creature at half strength." },

  // ---------- Evolution Items ----------
  { id: "ember-stone", name: "Ember Stone", category: "evolution", price: -1, crystalPrice: 30, sellPrice: 800,
    description: "A stone with a heartbeat of fire. Emberimp covet it above all things." },
  { id: "sun-charm", name: "Sun Charm", category: "evolution", price: -1, crystalPrice: 30, sellPrice: 800,
    description: "A charm holding one captured noon. Offers a Branchling the sun's path." },
  { id: "moon-charm", name: "Moon Charm", category: "evolution", price: -1, crystalPrice: 30, sellPrice: 800,
    description: "A charm holding one captured midnight. Offers a Branchling the moon's path." },
  { id: "frost-gem", name: "Frost Gem", category: "evolution", price: -1, crystalPrice: 30, sellPrice: 800,
    description: "A gem of never-melting ice. Frostfox who gaze into it see the aurora." },

  // ---------- Quest / Key Items ----------
  { id: "forest-amulet", name: "Forest Amulet", category: "quest", price: -1,
    description: "Proof of the Verdant Guardian's trust. Opens the way to the Crystal Caverns." },
  { id: "cavern-lantern", name: "Cavern Lantern", category: "quest", price: -1,
    description: "An ever-burning miner's lantern. Its light calms cave dwellers." },
  { id: "desert-compass", name: "Desert Compass", category: "quest", price: -1,
    description: "A compass that points to water instead of north." },
  { id: "ridge-horn", name: "Ridge Horn", category: "quest", price: -1,
    description: "A carved horn whose call quiets blizzards. Opens the pass to Thunder Plateau." },
  { id: "storm-sigil", name: "Storm Sigil", category: "quest", price: -1,
    description: "A sigil crackling with tame lightning. Grants passage to the Sky Temple lift." },
  { id: "temple-feather", name: "Temple Feather", category: "quest", price: -1,
    description: "A feather of pure radiance from the Sky Temple. The Capital's gates honor it." },
  { id: "lost-locket", name: "Lost Locket", category: "quest", price: -1,
    description: "A tarnished locket. Inside, a faded portrait of two smiling children." },
  { id: "herb-bundle", name: "Herb Bundle", category: "quest", price: -1,
    description: "A neatly tied bundle of medicinal moonherbs." },
  { id: "starless-ink", name: "Starless Ink", category: "quest", price: -1,
    description: "Ink that drinks light. Required for a certain shadowy pact." },
];

export const ITEM_MAP: Record<string, Item> = Object.fromEntries(ITEMS.map((i) => [i.id, i]));

export function getItem(id: string): Item {
  const item = ITEM_MAP[id];
  if (!item) throw new Error(`Unknown item: ${id}`);
  return item;
}
