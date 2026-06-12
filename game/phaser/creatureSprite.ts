/**
 * Deterministic procedural creature sprites.
 *
 * Every species gets a unique, symmetric pixel-art sprite generated from a
 * seeded RNG over its id — the game is fully playable with zero shipped art.
 * If a real asset exists at /assets/creatures/<speciesId>.png it is preferred
 * by the <CreatureSprite> component (Higgsfield pipeline drop-in point).
 */

import { getSpecies } from "../data/creatures";
import { ELEMENT_COLOR } from "../data/typeChart";

function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shade(hex: string, factor: number): string {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.min(255, Math.max(0, Math.round(((n >> 16) & 255) * factor)));
  const g = Math.min(255, Math.max(0, Math.round(((n >> 8) & 255) * factor)));
  const b = Math.min(255, Math.max(0, Math.round((n & 255) * factor)));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

const cache = new Map<string, string>();

/** Returns a data-URL PNG for the species' generated sprite. */
export function creatureSpriteDataUrl(speciesId: string, size = 96, shiny = false): string {
  const key = `${speciesId}:${size}:${shiny ? 1 : 0}`;
  const hit = cache.get(key);
  if (hit) return hit;
  if (typeof document === "undefined") return "";

  const species = getSpecies(speciesId);
  const rng = mulberry32(hashString(speciesId));
  const GRID = 12; // half-width 6, mirrored
  const HALF = GRID / 2;

  const primary = ELEMENT_COLOR[species.element];
  const secondary = species.secondaryElement ? ELEMENT_COLOR[species.secondaryElement] : shade(primary, 1.35);
  const base = shiny ? shade(secondary, 1.15) : primary;
  const accent = shiny ? shade(primary, 0.9) : secondary;
  const dark = shade(base, 0.55);

  // Body mask: random blob biased toward the center, mirrored.
  const mask: number[][] = [];
  for (let y = 0; y < GRID; y++) {
    mask.push(new Array(HALF).fill(0));
    for (let x = 0; x < HALF; x++) {
      const cx = (x + 0.5) / HALF; // 0 center-edge → 1 middle
      const cy = Math.abs((y + 0.5) / GRID - 0.5) * 2;
      const dist = Math.sqrt((1 - cx) * (1 - cx) * 0.8 + cy * cy);
      const p = 0.95 - dist * 0.85 + (rng() - 0.5) * 0.5;
      if (p > 0.35) mask[y][x] = rng() > 0.25 ? 1 : 2; // 1 base, 2 accent
    }
  }
  // Guarantee a core
  for (let y = 4; y < 8; y++) for (let x = HALF - 3; x < HALF; x++) mask[y][x] = mask[y][x] || 1;
  // Stage 2/3 creatures get horns/spikes on top
  if (species.stage >= 2) {
    mask[1][HALF - 2 - Math.floor(rng() * 2)] = 2;
    if (species.stage === 3) mask[0][HALF - 1] = 2;
  }

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingEnabled = false;
  const cell = size / (GRID + 2);

  const put = (gx: number, gy: number, color: string) => {
    ctx.fillStyle = color;
    ctx.fillRect((gx + 1) * cell, (gy + 1) * cell, cell + 0.5, cell + 0.5);
  };

  const at = (x: number, y: number): number => {
    if (y < 0 || y >= GRID || x < 0 || x >= GRID) return 0;
    const hx = x < HALF ? x : GRID - 1 - x;
    return mask[y][hx];
  };

  for (let y = 0; y < GRID; y++) {
    for (let x = 0; x < GRID; x++) {
      const v = at(x, y);
      if (!v) continue;
      // outline if an empty neighbour
      const edge = !at(x - 1, y) || !at(x + 1, y) || !at(x, y - 1) || !at(x, y + 1);
      put(x, y, edge ? dark : v === 1 ? base : accent);
    }
  }

  // Eyes: symmetric pair on the upper body.
  const eyeY = 3 + Math.floor(rng() * 3);
  const eyeX = 1 + Math.floor(rng() * 2);
  if (at(HALF - 1 - eyeX, eyeY)) {
    put(HALF - 1 - eyeX, eyeY, "#ffffff");
    put(HALF + eyeX, eyeY, "#ffffff");
    ctx.fillStyle = "#1a1a2e";
    const px = (g: number) => (g + 1) * cell;
    ctx.fillRect(px(HALF - 1 - eyeX) + cell * 0.3, px(eyeY) + cell * 0.3, cell * 0.5, cell * 0.5);
    ctx.fillRect(px(HALF + eyeX) + cell * 0.3, px(eyeY) + cell * 0.3, cell * 0.5, cell * 0.5);
  }

  const url = canvas.toDataURL("image/png");
  cache.set(key, url);
  return url;
}
