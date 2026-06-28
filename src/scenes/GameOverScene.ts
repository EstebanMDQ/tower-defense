import Phaser from "phaser";
import { DESIGN_WIDTH, TOTAL_HEIGHT } from "../config/grid";

interface GameOverData {
  wave: number;
}

/** End-of-run screen: shows the wave reached and restarts on tap. */
export class GameOverScene extends Phaser.Scene {
  constructor() {
    super("GameOver");
  }

  create(data: GameOverData): void {
    const cx = DESIGN_WIDTH / 2;
    const cy = TOTAL_HEIGHT / 2;

    this.add.rectangle(cx, cy, DESIGN_WIDTH, TOTAL_HEIGHT, 0x000000, 0.6);

    this.add
      .text(cx, cy - 70, "GAME OVER", {
        fontFamily: "monospace",
        fontSize: "40px",
        color: "#ef476f",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    this.add
      .text(cx, cy, `Reached wave ${data.wave ?? 0}`, {
        fontFamily: "monospace",
        fontSize: "20px",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    this.add
      .text(cx, cy + 70, "tap to restart", {
        fontFamily: "monospace",
        fontSize: "18px",
        color: "#8ecae6",
      })
      .setOrigin(0.5);

    const restart = () => this.scene.start("Game");
    this.input.once("pointerdown", restart);
    this.input.keyboard?.once("keydown-SPACE", restart);
  }
}
