import Phaser from "phaser";

/**
 * End-of-run screen. Wired up by the game-ui-and-states change (shows wave
 * reached and a restart option). Defined here so the scene list is complete.
 */
export class GameOverScene extends Phaser.Scene {
  constructor() {
    super("GameOver");
  }

  create(): void {
    // Populated by the game-ui-and-states change.
  }
}
