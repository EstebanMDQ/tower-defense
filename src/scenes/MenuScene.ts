import Phaser from "phaser";
import { DESIGN_WIDTH, TOTAL_HEIGHT } from "../config/grid";

/** Title screen. Tap (or press space) to start a run. */
export class MenuScene extends Phaser.Scene {
  constructor() {
    super("Menu");
  }

  create(): void {
    const cx = DESIGN_WIDTH / 2;
    const cy = TOTAL_HEIGHT / 2;

    this.add
      .text(cx, cy - 60, "TOWER\nDEFENSE", {
        fontFamily: "monospace",
        fontSize: "44px",
        color: "#ffffff",
        align: "center",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    this.add
      .text(cx, cy + 60, "tap to start", {
        fontFamily: "monospace",
        fontSize: "18px",
        color: "#8ecae6",
      })
      .setOrigin(0.5);

    const start = () => this.scene.start("Game");
    this.input.once("pointerdown", start);
    this.input.keyboard?.once("keydown-SPACE", start);
  }
}
