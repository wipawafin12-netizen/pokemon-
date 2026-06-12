import * as Phaser from "phaser";
import { getMap, isWalkable } from "../data/maps";
import type { GameMap } from "../data/types";
import { getNpc } from "../data/npcs";
import { getTrainer } from "../data/trainers";
import { getBoss } from "../data/bosses";
import { getItem } from "../data/items";
import { useGame } from "../state/gameStore";
import { useBattle } from "../state/battleStore";
import { useUI } from "../state/uiStore";
import { AudioManager } from "../systems/AudioManager";
import { registerCharacterTextures, registerCreatureTexture, registerThemeTiles, TILE, TILE_KEY } from "./textures";
import { creatureSpriteDataUrl } from "./creatureSprite";

type Dir = "up" | "down" | "left" | "right";

const DIR_DELTA: Record<Dir, { dx: number; dy: number }> = {
  up: { dx: 0, dy: -1 },
  down: { dx: 0, dy: 1 },
  left: { dx: -1, dy: 0 },
  right: { dx: 1, dy: 0 },
};

const WALK_MS = 170;
const RUN_MS = 95;

export class WorldScene extends Phaser.Scene {
  private map!: GameMap;
  private player!: Phaser.GameObjects.Image;
  private gridX = 0;
  private gridY = 0;
  private facing: Dir = "down";
  private moving = false;
  private stepFrame: 0 | 1 = 0;
  private keys!: Record<string, Phaser.Input.Keyboard.Key>;
  private npcSprites = new Map<string, Phaser.GameObjects.Image>();
  private trainerSprites = new Map<string, Phaser.GameObjects.Image>();
  private itemSprites = new Map<string, Phaser.GameObjects.Image>();
  private bossSprite: Phaser.GameObjects.Image | null = null;
  private playtimeAcc = 0;

  constructor() {
    super("world");
  }

  create(): void {
    const save = useGame.getState().save;
    if (!save) return;
    this.map = getMap(save.mapId);
    this.gridX = save.pos.x;
    this.gridY = save.pos.y;
    this.facing = save.facing;
    this.moving = false;

    registerThemeTiles(this, this.map.theme);
    registerCharacterTextures(this);
    this.drawTiles();
    this.spawnEntities();

    this.player = this.add
      .image(this.px(this.gridX), this.py(this.gridY), `player-${this.facing}-0`)
      .setDepth(10);

    const cam = this.cameras.main;
    cam.setBounds(0, 0, this.map.grid[0].length * TILE, this.map.grid.length * TILE);
    cam.startFollow(this.player, true, 0.18, 0.18);
    cam.setZoom(this.bestZoom());
    cam.roundPixels = true;

    // Physical key codes — layout-independent (works on non-Latin keyboards).
    const kb = this.input.keyboard!;
    this.keys = {
      up: kb.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
      down: kb.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN),
      left: kb.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
      right: kb.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
      w: kb.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      s: kb.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      a: kb.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      d: kb.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      interact: kb.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
      interact2: kb.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER),
      interact3: kb.addKey(Phaser.Input.Keyboard.KeyCodes.Z),
      run: kb.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT),
    };

    AudioManager.playMusic(this.map.musicKey as Parameters<typeof AudioManager.playMusic>[0]);
    this.scale.on("resize", () => this.cameras.main.setZoom(this.bestZoom()));
  }

  private bestZoom(): number {
    const w = this.scale.width;
    return w < 480 ? 1.4 : w < 900 ? 1.8 : 2.2;
  }

  private px(x: number): number {
    return x * TILE + TILE / 2;
  }
  private py(y: number): number {
    return y * TILE + TILE / 2;
  }

  private drawTiles(): void {
    for (let y = 0; y < this.map.grid.length; y++) {
      for (let x = 0; x < this.map.grid[y].length; x++) {
        const code = this.map.grid[y][x];
        const kind = TILE_KEY[code] ?? "ground";
        // ground layer under partially-transparent tiles
        if (kind === "solid" && (this.map.theme === "forest" || this.map.theme === "village")) {
          this.add.image(this.px(x), this.py(y), `tile-${this.map.theme}-ground`).setDepth(0);
        }
        this.add.image(this.px(x), this.py(y), `tile-${this.map.theme}-${kind}`).setDepth(kind === "solid" ? 5 : 1);
      }
    }
  }

  private spawnEntities(): void {
    const game = useGame.getState();

    for (const placement of this.map.npcs) {
      const npc = getNpc(placement.npcId);
      const sprite = this.add.image(this.px(placement.x), this.py(placement.y), `npc-${npc.sprite}`).setDepth(9);
      this.npcSprites.set(placement.npcId, sprite);
    }

    for (const placement of this.map.trainers) {
      const defeated = game.save?.defeatedTrainers.includes(placement.trainerId);
      const sprite = this.add
        .image(this.px(placement.x), this.py(placement.y), "npc-rival")
        .setDepth(9)
        .setAlpha(defeated ? 0.6 : 1);
      this.trainerSprites.set(placement.trainerId, sprite);
    }

    for (const item of this.map.items) {
      if (game.hasFlag(item.flag)) continue;
      const sprite = this.add.image(this.px(item.x), this.py(item.y), "item-orb").setDepth(8);
      this.tweens.add({ targets: sprite, y: sprite.y - 4, duration: 700, yoyo: true, repeat: -1, ease: "sine.inout" });
      this.itemSprites.set(item.flag, sprite);
    }

    if (this.map.bossId && this.map.bossPos && !game.hasFlag(getBoss(this.map.bossId).flag)) {
      const boss = getBoss(this.map.bossId);
      const aura = this.add.image(this.px(this.map.bossPos.x), this.py(this.map.bossPos.y), "boss-aura").setDepth(7);
      this.tweens.add({ targets: aura, alpha: 0.4, scale: 1.2, duration: 900, yoyo: true, repeat: -1 });
      const key = registerCreatureTexture(this, boss.speciesId, creatureSpriteDataUrl(boss.speciesId, 48));
      // texture may register async; draw once available
      this.time.delayedCall(60, () => {
        if (this.textures.exists(key) && !this.bossSprite) {
          this.bossSprite = this.add
            .image(this.px(this.map.bossPos!.x), this.py(this.map.bossPos!.y), key)
            .setDepth(9)
            .setScale(1.1);
        }
      });
    }
  }

  // ---------------------------------------------------------------

  update(_: number, deltaMs: number): void {
    // playtime tick
    this.playtimeAcc += deltaMs;
    if (this.playtimeAcc >= 1000) {
      useGame.getState().tickPlaytime(Math.floor(this.playtimeAcc / 1000));
      this.playtimeAcc %= 1000;
    }

    const ui = useUI.getState();
    const inputLocked = ui.screen !== "world" || !!ui.dialogue || !!ui.shopId;
    if (inputLocked) {
      if (ui.touchInteract && ui.dialogue) {
        ui.clearInteract();
        ui.advanceDialogue();
      }
      return;
    }

    // interact
    const interactPressed =
      Phaser.Input.Keyboard.JustDown(this.keys.interact) ||
      Phaser.Input.Keyboard.JustDown(this.keys.interact2) ||
      Phaser.Input.Keyboard.JustDown(this.keys.interact3) ||
      ui.touchInteract;
    if (ui.touchInteract) ui.clearInteract();
    if (interactPressed && !this.moving) {
      this.tryInteract();
      return;
    }

    if (this.moving) return;

    let dir: Dir | null = null;
    const touch = ui.touchDir;
    if (this.keys.up.isDown || this.keys.w.isDown || touch.up) dir = "up";
    else if (this.keys.down.isDown || this.keys.s.isDown || touch.down) dir = "down";
    else if (this.keys.left.isDown || this.keys.a.isDown || touch.left) dir = "left";
    else if (this.keys.right.isDown || this.keys.d.isDown || touch.right) dir = "right";
    if (!dir) return;

    const running = this.keys.run.isDown || ui.touchRun;
    this.face(dir);
    const { dx, dy } = DIR_DELTA[dir];
    const nx = this.gridX + dx;
    const ny = this.gridY + dy;
    if (!isWalkable(this.map, nx, ny) || this.entityAt(nx, ny)) return;

    this.moving = true;
    this.stepFrame = this.stepFrame === 0 ? 1 : 0;
    this.player.setTexture(`player-${dir}-${this.stepFrame}`);
    this.tweens.add({
      targets: this.player,
      x: this.px(nx),
      y: this.py(ny),
      duration: running ? RUN_MS : WALK_MS,
      onComplete: () => {
        this.gridX = nx;
        this.gridY = ny;
        this.moving = false;
        this.player.setTexture(`player-${dir}-0`);
        useGame.getState().setPosition(this.map.id, nx, ny, this.facing);
        this.onStep(nx, ny);
      },
    });
  }

  private face(dir: Dir): void {
    if (this.facing !== dir) {
      this.facing = dir;
      this.player.setTexture(`player-${dir}-0`);
    }
  }

  private entityAt(x: number, y: number): boolean {
    if (this.map.npcs.some((n) => n.x === x && n.y === y)) return true;
    if (this.map.trainers.some((t) => t.x === x && t.y === y)) return true;
    if (this.map.bossPos && this.bossActive() && this.map.bossPos.x === x && this.map.bossPos.y === y) return true;
    return false;
  }

  private bossActive(): boolean {
    return !!this.map.bossId && !useGame.getState().hasFlag(getBoss(this.map.bossId).flag);
  }

  // ---------------------------------------------------------------

  private onStep(x: number, y: number): void {
    const game = useGame.getState();
    const ui = useUI.getState();

    // item pickup
    const item = this.map.items.find((i) => i.x === x && i.y === y && !game.hasFlag(i.flag));
    if (item) {
      game.setFlag(item.flag);
      game.addItem(item.itemId, item.qty);
      AudioManager.playSfx("item");
      ui.toast(`Found ${getItem(item.itemId).name} ×${item.qty}!`, "success");
      const sprite = this.itemSprites.get(item.flag);
      if (sprite) {
        this.tweens.add({ targets: sprite, alpha: 0, y: sprite.y - 14, duration: 300, onComplete: () => sprite.destroy() });
        this.itemSprites.delete(item.flag);
      }
    }

    // portals
    const portal = this.map.portals.find((p) => p.x === x && p.y === y);
    if (portal) {
      if (portal.requiresFlag && !game.hasFlag(portal.requiresFlag)) {
        if (portal.lockedMessage) ui.openDialogue({ speaker: "—", lines: [portal.lockedMessage] });
        return;
      }
      game.travelTo(portal.toMap, portal.toX, portal.toY);
      this.scene.restart();
      return;
    }

    // wild encounters in tall grass
    if (this.map.grid[y][x] === "*" && this.map.encounters.length > 0) {
      if (Math.random() < this.map.encounterRate) {
        const total = this.map.encounters.reduce((s, e) => s + e.weight, 0);
        let roll = Math.random() * total;
        const entry =
          this.map.encounters.find((e) => {
            roll -= e.weight;
            return roll <= 0;
          }) ?? this.map.encounters[0];
        const level = entry.minLevel + Math.floor(Math.random() * (entry.maxLevel - entry.minLevel + 1));
        useBattle.getState().startWild(entry.speciesId, level);
      }
    }
  }

  // ---------------------------------------------------------------

  private tryInteract(): void {
    const { dx, dy } = DIR_DELTA[this.facing];
    const tx = this.gridX + dx;
    const ty = this.gridY + dy;
    const game = useGame.getState();
    const ui = useUI.getState();

    // NPC
    const npcPlacement = this.map.npcs.find((n) => n.x === tx && n.y === ty);
    if (npcPlacement) {
      const npc = getNpc(npcPlacement.npcId);
      AudioManager.playSfx("click");
      ui.openDialogue({ speaker: npc.name, lines: npc.dialogue, npcId: npc.id });
      game.recordQuestEvent({ kind: "talk", npcId: npc.id });
      // post-dialogue effects fire immediately; the dialogue box narrates them
      if (npc.healer) {
        game.healParty();
        AudioManager.playSfx("heal");
      }
      if (npc.questId) {
        game.acceptQuest(npc.questId);
      }
      if (npc.shopId) {
        // shop opens when dialogue closes — flag it via dialogue npcId; DialogueBox handles it
      }
      return;
    }

    // Trainer
    const trainerPlacement = this.map.trainers.find((t) => t.x === tx && t.y === ty);
    if (trainerPlacement) {
      const trainer = getTrainer(trainerPlacement.trainerId);
      if (game.save?.defeatedTrainers.includes(trainer.id)) {
        ui.openDialogue({ speaker: trainer.name, lines: [trainer.defeatLine] });
      } else {
        useBattle.getState().startTrainer(trainer.id);
      }
      return;
    }

    // Boss
    if (this.map.bossPos && this.map.bossId && this.bossActive() && this.map.bossPos.x === tx && this.map.bossPos.y === ty) {
      useBattle.getState().startBoss(this.map.bossId);
      return;
    }

    // Door in front (locked doors give flavor)
    const portal = this.map.portals.find((p) => p.x === tx && p.y === ty);
    if (portal?.requiresFlag && !game.hasFlag(portal.requiresFlag) && portal.lockedMessage) {
      ui.openDialogue({ speaker: "—", lines: [portal.lockedMessage] });
    }
  }
}
