import Phaser from "phaser";
import { GRID, tileToPixel } from "../config/grid";
import { generateMap, type GameMap } from "../systems/PathGenerator";
import { randomSeed } from "../systems/Rng";
import { Economy } from "../systems/Economy";
import { EnemyManager } from "../systems/EnemyManager";
import { ENEMIES } from "../config/enemies";
import type { Vec2 } from "../types";

/**
 * The world scene: owns the play field and the gameplay update loop. Later
 * changes attach entities and systems here. It generates the procedural map and
 * renders the grid, path, and Base/Portal markers.
 */
export class GameScene extends Phaser.Scene {
  map!: GameMap;
  economy!: Economy;
  enemyManager!: EnemyManager;
  private enemyGfx!: Phaser.GameObjects.Graphics;

  constructor() {
    super("Game");
  }

  create(): void {
    this.map = generateMap(randomSeed());
    this.economy = new Economy();

    const groundRoute: Vec2[] = this.map.path.map((t) =>
      tileToPixel(t.col, t.row),
    );
    const airRoute: Vec2[] = [this.map.airRoute.from, this.map.airRoute.to];
    this.enemyManager = new EnemyManager(groundRoute, airRoute, this.economy);

    // Run the HUD as a parallel overlay scene.
    this.scene.launch("HUD");

    this.drawGrid();
    this.drawMap();
    // Enemies are drawn on their own layer, redrawn each frame.
    this.enemyGfx = this.add.graphics();
  }

  /** Advance gameplay systems by elapsed seconds (frame-rate independent). */
  update(_time: number, delta: number): void {
    const dt = delta / 1000;
    this.step(dt);
  }

  /** Step gameplay systems. Towers and waves register here in later changes. */
  private step(dt: number): void {
    this.enemyManager.update(dt);
    this.drawEnemies();
  }

  private drawEnemies(): void {
    const g = this.enemyGfx;
    g.clear();
    for (const enemy of this.enemyManager.getEnemies()) {
      const spec = ENEMIES[enemy.type];
      g.fillStyle(spec.color, 1);
      if (enemy.targetClass === "air") {
        // Planes drawn as triangles to read differently from ground units.
        const r = spec.radius;
        g.fillTriangle(
          enemy.x,
          enemy.y - r,
          enemy.x - r,
          enemy.y + r,
          enemy.x + r,
          enemy.y + r,
        );
      } else {
        g.fillCircle(enemy.x, enemy.y, spec.radius);
      }
      this.drawHealthBar(g, enemy.x, enemy.y - spec.radius - 5, enemy.hp / enemy.maxHp);
    }
  }

  private drawHealthBar(
    g: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    frac: number,
  ): void {
    const w = 20;
    const h = 3;
    g.fillStyle(0x000000, 0.6);
    g.fillRect(x - w / 2, y, w, h);
    g.fillStyle(0x4dff88, 1);
    g.fillRect(x - w / 2, y, w * Phaser.Math.Clamp(frac, 0, 1), h);
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
