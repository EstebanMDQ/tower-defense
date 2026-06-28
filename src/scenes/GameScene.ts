import Phaser from "phaser";
import { GRID, tileToPixel, pixelToTile } from "../config/grid";
import { generateMap, type GameMap } from "../systems/PathGenerator";
import { randomSeed } from "../systems/Rng";
import { Economy } from "../systems/Economy";
import { EnemyManager } from "../systems/EnemyManager";
import { TowerManager } from "../systems/TowerManager";
import { WaveManager } from "../systems/WaveManager";
import { ENEMIES } from "../config/enemies";
import { TOWERS, type TowerType } from "../config/towers";
import type { TileCoord, Vec2 } from "../types";

/**
 * The world scene: owns the play field, entities, and the gameplay update loop.
 * Generates the procedural map and runs enemies and towers each frame. Basic
 * build interaction lives here; the formal build palette is added by the
 * game-ui-and-states change.
 */
export class GameScene extends Phaser.Scene {
  map!: GameMap;
  economy!: Economy;
  enemyManager!: EnemyManager;
  towerManager!: TowerManager;
  waveManager!: WaveManager;

  selectedTowerType: TowerType = "machineGun";

  private dynamicGfx!: Phaser.GameObjects.Graphics;
  private hoverTile: TileCoord | null = null;

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
    this.towerManager = new TowerManager(
      this.map,
      this.economy,
      this.enemyManager,
    );
    this.waveManager = new WaveManager(this.enemyManager, this.economy);

    this.scene.launch("HUD");

    this.drawStatic();
    this.dynamicGfx = this.add.graphics();
    this.setupInput();
  }

  update(_time: number, delta: number): void {
    this.step(delta / 1000);
  }

  private step(dt: number): void {
    this.waveManager.update(dt);
    this.enemyManager.update(dt);
    this.towerManager.update(dt);
    this.drawDynamic();
  }

  // --- Input -----------------------------------------------------------------

  private setupInput(): void {
    this.input.on("pointermove", (p: Phaser.Input.Pointer) => {
      this.hoverTile = pixelToTile(p.worldX, p.worldY);
    });
    this.input.on("pointerdown", (p: Phaser.Input.Pointer) => {
      this.handleTap(pixelToTile(p.worldX, p.worldY));
    });
    const kb = this.input.keyboard;
    kb?.on("keydown-ONE", () => (this.selectedTowerType = "machineGun"));
    kb?.on("keydown-TWO", () => (this.selectedTowerType = "mortar"));
    kb?.on("keydown-THREE", () => (this.selectedTowerType = "missiles"));
    kb?.on("keydown-SPACE", () => this.waveManager.startWave());
  }

  /** Tap an existing tower to upgrade it, or a buildable tile to place. */
  private handleTap(tile: TileCoord): void {
    const existing = this.towerManager.towerAt(tile);
    if (existing) {
      this.towerManager.upgrade(existing);
      return;
    }
    this.towerManager.place(this.selectedTowerType, tile);
  }

  // --- Rendering -------------------------------------------------------------

  private drawStatic(): void {
    const g = this.add.graphics();
    // Grid.
    g.lineStyle(1, 0x21384d, 1);
    for (let c = 0; c <= GRID.cols; c++) {
      const x = c * GRID.tileSize;
      g.lineBetween(x, 0, x, GRID.rows * GRID.tileSize);
    }
    for (let r = 0; r <= GRID.rows; r++) {
      const y = r * GRID.tileSize;
      g.lineBetween(0, y, GRID.cols * GRID.tileSize, y);
    }

    // Path tiles + centerline.
    const half = GRID.tileSize / 2;
    g.fillStyle(0x394b59, 1);
    for (const t of this.map.path) {
      const p = tileToPixel(t.col, t.row);
      g.fillRect(p.x - half, p.y - half, GRID.tileSize, GRID.tileSize);
    }
    g.lineStyle(4, 0x5a7186, 1);
    g.beginPath();
    this.map.path.forEach((t, i) => {
      const p = tileToPixel(t.col, t.row);
      if (i === 0) g.moveTo(p.x, p.y);
      else g.lineTo(p.x, p.y);
    });
    g.strokePath();

    // Portal and Base.
    const portal = tileToPixel(this.map.portal.col, this.map.portal.row);
    const base = tileToPixel(this.map.base.col, this.map.base.row);
    const r = half - 4;
    g.fillStyle(0xc44dff, 1);
    g.fillCircle(portal.x, portal.y, r);
    g.fillStyle(0x4dff88, 1);
    g.fillRect(base.x - r, base.y - r, r * 2, r * 2);
  }

  private drawDynamic(): void {
    const g = this.dynamicGfx;
    g.clear();
    this.drawTowers(g);
    this.drawRangePreview(g);
    this.drawProjectiles(g);
    this.drawEnemies(g);
  }

  private drawTowers(g: Phaser.GameObjects.Graphics): void {
    const s = GRID.tileSize / 2 - 5;
    for (const tower of this.towerManager.getTowers()) {
      g.fillStyle(TOWERS[tower.type].color, 1);
      g.fillRect(tower.x - s, tower.y - s, s * 2, s * 2);
      // Level pips.
      g.fillStyle(0xffffff, 1);
      for (let i = 0; i < tower.level; i++) {
        g.fillCircle(tower.x - s + 4 + i * 6, tower.y + s - 4, 2);
      }
    }
  }

  private drawRangePreview(g: Phaser.GameObjects.Graphics): void {
    if (!this.hoverTile) return;
    const tile = this.hoverTile;
    if (!this.towerManager.canPlace(this.selectedTowerType, tile)) return;
    const p = tileToPixel(tile.col, tile.row);
    const rangePx = TOWERS[this.selectedTowerType].range * GRID.tileSize;
    g.lineStyle(1, 0xffffff, 0.4);
    g.strokeCircle(p.x, p.y, rangePx);
    g.fillStyle(TOWERS[this.selectedTowerType].color, 0.3);
    const s = GRID.tileSize / 2 - 5;
    g.fillRect(p.x - s, p.y - s, s * 2, s * 2);
  }

  private drawProjectiles(g: Phaser.GameObjects.Graphics): void {
    for (const p of this.towerManager.getProjectiles()) {
      g.fillStyle(p.color, 1);
      g.fillCircle(p.x, p.y, 3);
    }
  }

  private drawEnemies(g: Phaser.GameObjects.Graphics): void {
    for (const enemy of this.enemyManager.getEnemies()) {
      const spec = ENEMIES[enemy.type];
      g.fillStyle(spec.color, 1);
      if (enemy.targetClass === "air") {
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
      this.drawHealthBar(
        g,
        enemy.x,
        enemy.y - spec.radius - 5,
        enemy.hp / enemy.maxHp,
      );
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
}
