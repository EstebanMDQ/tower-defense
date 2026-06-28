import Phaser from "phaser";

/**
 * Entry scene. Nothing heavy to load yet (everything is drawn procedurally),
 * so it immediately hands off to the game scene.
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super("Boot");
  }

  create(): void {
    this.scene.start("Game");
  }
}
