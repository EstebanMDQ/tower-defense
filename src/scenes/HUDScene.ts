import Phaser from "phaser";

/**
 * Overlay scene for player-facing UI (money, lives, wave, build palette). Runs
 * in parallel with the game scene on its own camera. Populated by the
 * game-ui-and-states change; for now it shows a title placeholder.
 */
export class HUDScene extends Phaser.Scene {
  constructor() {
    super("HUD");
  }

  create(): void {
    this.add.text(8, 8, "Tower Defense", {
      fontFamily: "monospace",
      fontSize: "14px",
      color: "#ffffff",
    });
  }
}
