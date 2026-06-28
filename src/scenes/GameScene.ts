import Phaser from "phaser";
import { GRID, tileToPixel } from "../config/grid";
import { generateMap, type GameMap } from "../systems/PathGenerator";
import { randomSeed } from "../systems/Rng";

/**
 * The world scene: owns the play field and the gameplay update loop. Later
 * changes attach entities and systems here. It generates the procedural map and
 * renders the grid, path, and Base/Portal markers.
 */
export class GameScene extends Phaser.Scene {
  map!: GameMap;

  constructor() {
    super("Game");
  }

  create(): void {
    this.map = generateMap(randomSeed());

    // Run the HUD as a parallel overlay scene.
    this.scene.launch("HUD");

    this.drawGrid();
    this.drawMap();
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

  private drawMap(): void {
    const g = this.add.graphics();
    const half = GRID.tileSize / 2;

    // Path tiles.
    g.fillStyle(0x394b59, 1);
    for (const t of this.map.path) {
      const p = tileToPixel(t.col, t.row);
      g.fillRect(p.x - half, p.y - half, GRID.tileSize, GRID.tileSize);
    }

    // Path centerline.
    g.lineStyle(4, 0x5a7186, 1);
    g.beginPath();
    this.map.path.forEach((t, i) => {
      const p = tileToPixel(t.col, t.row);
      if (i === 0) g.moveTo(p.x, p.y);
      else g.lineTo(p.x, p.y);
    });
    g.strokePath();

    // Portal (enemy spawn) and Base (defender goal).
    const portal = tileToPixel(this.map.portal.col, this.map.portal.row);
    const base = tileToPixel(this.map.base.col, this.map.base.row);
    const r = half - 4;
    g.fillStyle(0xc44dff, 1);
    g.fillCircle(portal.x, portal.y, r);
    g.fillStyle(0x4dff88, 1);
    g.fillRect(base.x - r, base.y - r, r * 2, r * 2);
  }
}
