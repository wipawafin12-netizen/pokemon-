/**
 * Procedural pixel-art tile & character textures.
 * Phaser 4 removed TextureManager.generate, so everything is drawn on
 * HTMLCanvasElements and registered with textures.addCanvas().
 */
import type Phaser from "phaser";
import type { GameMap } from "../data/types";

export const TILE = 32;

interface ThemePalette {
  ground: string;
  groundAlt: string;
  deco: string;
  solid: string;
  solidDark: string;
  water: string;
  waterDark: string;
  grass: string;
  grassDark: string;
  path: string;
  wall: string;
  roof: string;
}

const PALETTES: Record<GameMap["theme"], ThemePalette> = {
  village: { ground: "#7ec850", groundAlt: "#74bd49", deco: "#e873a8", solid: "#3e8c41", solidDark: "#2a6630", water: "#4aa3e0", waterDark: "#3186c2", grass: "#4ea53b", grassDark: "#3a8a2c", path: "#d9b380", wall: "#c89d6a", roof: "#c0534f" },
  forest: { ground: "#5da244", groundAlt: "#54963d", deco: "#e8d36f", solid: "#2f7034", solidDark: "#1f5224", water: "#3f8fc9", waterDark: "#2d72a6", grass: "#3c8a2e", grassDark: "#2c6e21", path: "#bd9a6c", wall: "#8a6f4d", roof: "#6d8a3a" },
  cave: { ground: "#6b6480", groundAlt: "#615a75", deco: "#8fd6f4", solid: "#3c374d", solidDark: "#292538", water: "#37c1c9", waterDark: "#2596a0", grass: "#7a5fa0", grassDark: "#5f4683", path: "#7d7591", wall: "#4d4763", roof: "#3a3450" },
  desert: { ground: "#e8c97a", groundAlt: "#dfbe6c", deco: "#c97f4e", solid: "#b08a4f", solidDark: "#8a6a39", water: "#43b7e0", waterDark: "#2f97bd", grass: "#c2a857", grassDark: "#a68d44", path: "#d1ad62", wall: "#caa05c", roof: "#a8643c" },
  snow: { ground: "#e9f2f7", groundAlt: "#dde9f2", deco: "#a9d3e8", solid: "#9fb8cc", solidDark: "#7a93a8", water: "#7accE8", waterDark: "#5aa9cc", grass: "#c4dcea", grassDark: "#a3c4d8", path: "#cfd9e2", wall: "#b5c7d6", roof: "#7a93b8" },
  plateau: { ground: "#a8845f", groundAlt: "#9c7a55", deco: "#f4cf3a", solid: "#6d553e", solidDark: "#50402f", water: "#4aa3e0", waterDark: "#3186c2", grass: "#b89a3e", grassDark: "#977e2e", path: "#b8946a", wall: "#85684a", roof: "#5e4a35" },
  temple: { ground: "#e8e2d0", groundAlt: "#ded7c2", deco: "#f4e9b0", solid: "#b8ad8f", solidDark: "#94896c", water: "#8fd6f4", waterDark: "#6cb8da", grass: "#d6cba6", grassDark: "#bcb088", path: "#d8d0b8", wall: "#cfc5a6", roof: "#8aa3c2" },
  city: { ground: "#9aa0ad", groundAlt: "#8f95a3", deco: "#c2b878", solid: "#5c6270", solidDark: "#454a57", water: "#4aa3e0", waterDark: "#3186c2", grass: "#6d7a8c", grassDark: "#56616f", path: "#b0a890", wall: "#8b8fa0", roof: "#6a5a8a" },
};

function makeCanvas(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;
  ctx.imageSmoothingEnabled = false;
  return [c, ctx];
}

function speckle(ctx: CanvasRenderingContext2D, color: string, count: number, seed: number): void {
  ctx.fillStyle = color;
  let s = seed;
  const rnd = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  for (let i = 0; i < count; i++) {
    ctx.fillRect(Math.floor(rnd() * 8) * 4, Math.floor(rnd() * 8) * 4, 4, 4);
  }
}

function tileBase(ctx: CanvasRenderingContext2D, p: ThemePalette, seed: number): void {
  ctx.fillStyle = p.ground;
  ctx.fillRect(0, 0, TILE, TILE);
  speckle(ctx, p.groundAlt, 6, seed);
}

/** Registers all tile textures for one theme. Idempotent. */
export function registerThemeTiles(scene: Phaser.Scene, theme: GameMap["theme"]): void {
  const p = PALETTES[theme];
  const reg = (key: string, draw: (ctx: CanvasRenderingContext2D) => void) => {
    const full = `tile-${theme}-${key}`;
    if (scene.textures.exists(full)) return;
    const [canvas, ctx] = makeCanvas(TILE, TILE);
    draw(ctx);
    scene.textures.addCanvas(full, canvas);
  };

  reg("ground", (ctx) => tileBase(ctx, p, 7));
  reg("deco", (ctx) => {
    tileBase(ctx, p, 13);
    ctx.fillStyle = p.deco;
    ctx.fillRect(8, 8, 4, 4);
    ctx.fillRect(20, 16, 4, 4);
    ctx.fillRect(12, 22, 4, 4);
  });
  reg("path", (ctx) => {
    ctx.fillStyle = p.path;
    ctx.fillRect(0, 0, TILE, TILE);
    speckle(ctx, p.groundAlt, 4, 31);
  });
  reg("grass", (ctx) => {
    ctx.fillStyle = p.grass;
    ctx.fillRect(0, 0, TILE, TILE);
    ctx.fillStyle = p.grassDark;
    for (let i = 0; i < 4; i++) {
      const x = 3 + i * 8;
      ctx.fillRect(x, 8, 3, 18);
      ctx.fillRect(x + 3, 4, 3, 22);
    }
  });
  reg("water", (ctx) => {
    ctx.fillStyle = p.water;
    ctx.fillRect(0, 0, TILE, TILE);
    ctx.fillStyle = p.waterDark;
    ctx.fillRect(2, 8, 10, 3);
    ctx.fillRect(16, 18, 12, 3);
    ctx.fillRect(6, 26, 8, 3);
  });
  reg("solid", (ctx) => {
    tileBase(ctx, p, 19);
    if (theme === "forest" || theme === "village") {
      // tree
      ctx.fillStyle = "#7a5230";
      ctx.fillRect(13, 20, 6, 10);
      ctx.fillStyle = p.solid;
      ctx.beginPath();
      ctx.arc(16, 13, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = p.solidDark;
      ctx.beginPath();
      ctx.arc(20, 16, 6, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // rock / wall block
      ctx.fillStyle = p.solid;
      ctx.fillRect(2, 4, 28, 26);
      ctx.fillStyle = p.solidDark;
      ctx.fillRect(2, 22, 28, 8);
      ctx.fillRect(16, 4, 4, 18);
    }
  });
  reg("ledge", (ctx) => {
    ctx.fillStyle = p.solid;
    ctx.fillRect(0, 0, TILE, TILE);
    ctx.fillStyle = "#ffffff44";
    ctx.fillRect(0, 0, TILE, 6);
    ctx.fillStyle = p.solidDark;
    ctx.fillRect(0, 24, TILE, 8);
  });
  reg("building", (ctx) => {
    ctx.fillStyle = p.wall;
    ctx.fillRect(0, 10, TILE, 22);
    ctx.fillStyle = p.roof;
    ctx.fillRect(0, 0, TILE, 12);
    ctx.fillStyle = "#00000022";
    ctx.fillRect(0, 10, TILE, 3);
    ctx.fillStyle = "#ffffff55";
    ctx.fillRect(6, 18, 8, 8); // window
  });
  reg("door", (ctx) => {
    ctx.fillStyle = p.wall;
    ctx.fillRect(0, 0, TILE, TILE);
    ctx.fillStyle = "#6d4a2f";
    ctx.fillRect(8, 6, 16, 26);
    ctx.fillStyle = "#f4cf3a";
    ctx.fillRect(19, 18, 3, 3);
  });
  reg("bridge", (ctx) => {
    ctx.fillStyle = p.water;
    ctx.fillRect(0, 0, TILE, TILE);
    ctx.fillStyle = "#9a7548";
    ctx.fillRect(0, 2, TILE, 28);
    ctx.fillStyle = "#7a5a35";
    for (let i = 0; i < 4; i++) ctx.fillRect(0, 4 + i * 7, TILE, 2);
  });
}

export const TILE_KEY: Record<string, string> = {
  ".": "ground",
  ",": "deco",
  "#": "solid",
  "~": "water",
  "*": "grass",
  "=": "path",
  B: "building",
  D: "door",
  "-": "bridge",
  "^": "ledge",
};

// ---------------------------------------------------------------
// Characters
// ---------------------------------------------------------------

const NPC_COLORS: Record<string, { body: string; head: string }> = {
  villager: { body: "#52b95b", head: "#f4cfa0" },
  elder: { body: "#8d93a3", head: "#e8d8c2" },
  scholar: { body: "#3a8df4", head: "#f4cfa0" },
  merchant: { body: "#f4cf3a", head: "#e0b083" },
  guard: { body: "#c0534f", head: "#f4cfa0" },
  kid: { body: "#f49f3a", head: "#f4cfa0" },
  healer: { body: "#f4a8c8", head: "#f4cfa0" },
  ranger: { body: "#3a7045", head: "#d8a878" },
  player: { body: "#4a6cf4", head: "#f4cfa0" },
  rival: { body: "#a04ac8", head: "#f4cfa0" },
};

function drawPerson(
  ctx: CanvasRenderingContext2D,
  colors: { body: string; head: string },
  facing: "down" | "up" | "left" | "right",
  step: 0 | 1
): void {
  const { body, head } = colors;
  // legs
  ctx.fillStyle = "#3a3450";
  if (step === 0) {
    ctx.fillRect(10, 24, 5, 7);
    ctx.fillRect(17, 24, 5, 7);
  } else {
    ctx.fillRect(9, 23, 5, 8);
    ctx.fillRect(18, 25, 5, 6);
  }
  // body
  ctx.fillStyle = body;
  ctx.fillRect(8, 14, 16, 11);
  // arms
  ctx.fillRect(5, 15, 4, 8);
  ctx.fillRect(23, 15, 4, 8);
  // head
  ctx.fillStyle = head;
  ctx.fillRect(9, 3, 14, 12);
  // hair
  ctx.fillStyle = "#4a3424";
  ctx.fillRect(9, 3, 14, 4);
  // face by direction
  ctx.fillStyle = "#1a1a2e";
  if (facing === "down") {
    ctx.fillRect(12, 9, 2, 3);
    ctx.fillRect(18, 9, 2, 3);
  } else if (facing === "left") {
    ctx.fillRect(10, 9, 2, 3);
  } else if (facing === "right") {
    ctx.fillRect(20, 9, 2, 3);
  } else {
    ctx.fillStyle = "#4a3424";
    ctx.fillRect(9, 3, 14, 9);
  }
}

export function registerCharacterTextures(scene: Phaser.Scene): void {
  const dirs = ["down", "up", "left", "right"] as const;
  // player walk frames
  for (const d of dirs) {
    for (const f of [0, 1] as const) {
      const key = `player-${d}-${f}`;
      if (scene.textures.exists(key)) continue;
      const [canvas, ctx] = makeCanvas(TILE, TILE);
      drawPerson(ctx, NPC_COLORS.player, d, f);
      scene.textures.addCanvas(key, canvas);
    }
  }
  // npc statics
  for (const [kind, colors] of Object.entries(NPC_COLORS)) {
    const key = `npc-${kind}`;
    if (scene.textures.exists(key)) continue;
    const [canvas, ctx] = makeCanvas(TILE, TILE);
    drawPerson(ctx, colors, "down", 0);
    scene.textures.addCanvas(key, canvas);
  }
  // item sparkle
  if (!scene.textures.exists("item-orb")) {
    const [canvas, ctx] = makeCanvas(TILE, TILE);
    ctx.fillStyle = "#f4cf3a";
    ctx.beginPath();
    ctx.arc(16, 18, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff8d0";
    ctx.fillRect(12, 13, 4, 4);
    scene.textures.addCanvas("item-orb", canvas);
  }
  // boss aura marker
  if (!scene.textures.exists("boss-aura")) {
    const [canvas, ctx] = makeCanvas(TILE * 2, TILE * 2);
    const grad = ctx.createRadialGradient(32, 32, 6, 32, 32, 30);
    grad.addColorStop(0, "#c84aff88");
    grad.addColorStop(1, "#c84aff00");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);
    scene.textures.addCanvas("boss-aura", canvas);
  }
}

/** Adds a creature texture generated from the species sprite data-URL. */
export function registerCreatureTexture(scene: Phaser.Scene, speciesId: string, dataUrl: string): string {
  const key = `creature-${speciesId}`;
  if (!scene.textures.exists(key)) {
    const img = new Image();
    img.src = dataUrl;
    // data URLs decode synchronously enough for same-frame use after onload;
    // register via addImage when ready.
    img.onload = () => {
      if (!scene.textures.exists(key)) scene.textures.addImage(key, img);
    };
  }
  return key;
}
