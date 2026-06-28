import Phaser from "phaser";
import { GRID, BASE_ROW, PORTAL_ROW, tileToPixel } from "../config/grid";

/**
 * The world scene: owns the play field and the gameplay update loop. Later
 * changes attach the map, entities, and systems here. For now it draws the grid
 * and the Base/Portal markers to prove rendering and the coordinate system work.
 */
export class GameScene extends Phaser.Scene {
  constructor() {
    super("Game");
  }

  create(): void {
    // Run the HUD as a parallel overlay scene.
    this.scene.launch("HUD");
    this.drawGrid();
    this.drawLandmarks();
  }

  /** Advance gameplay systems by elapsed seconds (frame-rate independent). */
  update(_time: number, delta: number): void {
    const dt = delta / 1000;
    this.step(dt);
  }

  /** Entry point for stepping gameplay systems. Systems (waves, enemies, towers)
   *  are registered here in later changes. */
  private step(_dt: number): void {
    // No systems yet.
  }

  private drawGrid(): void {
    const g = this.add.graphics();
    g.lineStyle(1, 0x21384d, 1);
    for (let c = 0; c <= GRID.cols; c++) {
      const x = c * GRID.tileSize;
      g.lineBetween(x, 0, x, GRID.rows * GRID.tileSize);
    }
    for (let r = 0; r <= GRID.rows; r++) {
      const y = r * GRID.tileSize;
      g.lineBetween(0, y, GRID.cols * GRID.tileSize, y);
    }
  }

  private drawLandmarks(): void {
    const mid = Math.floor(GRID.cols / 2);
    const portal = tileToPixel(mid, PORTAL_ROW);
    const base = tileToPixel(mid, BASE_ROW);
    const half = GRID.tileSize / 2 - 4;

    const g = this.add.graphics();
    // Portal (enemy spawn) - magenta.
    g.fillStyle(0xc44dff, 1);
    g.fillCircle(portal.x, portal.y, half);
    // Base (defender goal) - green.
    g.fillStyle(0x4dff88, 1);
    g.fillRect(base.x - half, base.y - half, half * 2, half * 2);
  }
}
