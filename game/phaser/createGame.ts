import * as Phaser from "phaser";
import { WorldScene } from "./WorldScene";

export function createGame(parent: HTMLElement): Phaser.Game {
  return new Phaser.Game({
    type: Phaser.WEBGL,
    parent,
    backgroundColor: "#10141f",
    pixelArt: true,
    roundPixels: true, // Phaser 4 defaults this to false; pixel art needs it
    scale: {
      mode: Phaser.Scale.RESIZE,
      width: "100%",
      height: "100%",
    },
    scene: [WorldScene],
  });
}
