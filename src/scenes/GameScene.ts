import Phaser from "phaser";
import { GRID, tileToPixel, pixelToTile, inBounds } from "../config/grid";
import {
  generateMap,
  sampleGroundRoute,
  type GameMap,
} from "../systems/PathGenerator";
import { randomSeed } from "../systems/Rng";
import { Economy } from "../systems/Economy";
import { EnemyManager } from "../systems/EnemyManager";
import { TowerManager } from "../systems/TowerManager";
import { WaveManager } from "../systems/WaveManager";
import { ENEMIES } from "../config/enemies";
import { LEVELS } from "../config/levels";
import { TOWERS, type TowerType } from "../config/towers";
import type { Tower } from "../entities/Tower";
import type { TileCoord, Vec2 } from "../types";
import { audio, music, type SfxName } from "../audio";

const FIRE_SFX: Record<TowerType, SfxName> = {
  machineGun: "mgShot",
  mortar: "mortarShot",
  missiles: "missileShot",
  sniper: "sniperShot",
};

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
  /** Tower the player tapped, shown in the HUD upgrade panel. */
  selectedTower: Tower | null = null;
  /** Gameplay speed controls (used by the HUD). */
  paused = false;
  speedFactor = 1;

  private staticGfx!: Phaser.GameObjects.Graphics;
  private dynamicGfx!: Phaser.GameObjects.Graphics;
  private hoverTile: TileCoord | null = null;

  constructor() {
    super("Game");
  }

  create(): void {
    this.map = generateMap(randomSeed());
    this.economy = new Economy();

    const airRoute: Vec2[] = [this.map.airRoute.from, this.map.airRoute.to];
    this.enemyManager = new EnemyManager(
      () => sampleGroundRoute(this.map),
      airRoute,
      this.economy,
    );
    this.towerManager = new TowerManager(
      this.map,
      this.economy,
      this.enemyManager,
    );
    this.waveManager = new WaveManager(this.enemyManager, this.economy);

    // Reset transient state (important on restart).
    this.selectedTower = null;
    this.paused = false;
    this.speedFactor = 1;

    // Sound triggers (engine is a no-op until resumed / when muted).
    this.towerManager.onFire = (type) => audio.play(FIRE_SFX[type]);
    this.enemyManager.onKill = () => audio.play("explosion");
    this.enemyManager.onLeak = () => audio.play("leak");
    this.waveManager.onPhaseChanged((phase) => {
      if (phase === "active") audio.play("waveStart");
    });
    this.waveManager.onLevelComplete((next) => this.advanceLevel(next));

    this.economy.onGameOver(() => {
      audio.play("gameOver");
      music.stop();
      this.scene.stop("HUD");
      this.scene.start("GameOver", { wave: this.waveManager.getWave() });
    });

    this.scene.launch("HUD");

    this.staticGfx = this.add.graphics();
    this.drawStatic();
    this.dynamicGfx = this.add.graphics();
    this.setupInput();

    music.start(); // looping placeholder song (silent until composed)
  }

  /**
   * Advance to a new level (during the build phase after wave 10): salvage a
   * percentage of the level's spend, generate a new branching map, wipe towers,
   * reset lives, and reset the carryover spend tracker. Difficulty continues via
   * the wave manager's global wave index.
   */
  private advanceLevel(level: number): void {
    const carry = Math.floor(LEVELS.carryoverPct * this.economy.getSpentThisLevel());

    this.map = generateMap(randomSeed(), level);
    const airRoute: Vec2[] = [this.map.airRoute.from, this.map.airRoute.to];
    this.enemyManager.setRoutes(() => sampleGroundRoute(this.map), airRoute);
    this.enemyManager.clear();
    this.towerManager.setMap(this.map);
    this.towerManager.clearAll();

    this.economy.refillLives();
    this.economy.setMoney(carry);
    this.economy.resetSpend();

    this.selectedTower = null;
    this.drawStatic(); // redraw the new map
  }

  update(_time: number, delta: number): void {
    const dt = this.paused ? 0 : (delta / 1000) * this.speedFactor;
    this.step(dt);
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
    kb?.on("keydown-FOUR", () => (this.selectedTowerType = "sniper"));
    kb?.on("keydown-SPACE", () => this.waveManager.startWave());
    kb?.on("keydown-M", () => audio.setMuted(!audio.isMuted()));
  }

  /** Tap an existing tower to select it (HUD shows upgrade), or a buildable
   *  tile to place the currently selected tower type. Taps in the HUD bar map
   *  to out-of-bounds tiles and are ignored here. */
  private handleTap(tile: TileCoord): void {
    // Ignore taps outside the play field (e.g. the HUD bar handles its own).
    if (!inBounds(tile.col, tile.row)) return;
    const existing = this.towerManager.towerAt(tile);
    if (existing) {
      this.selectedTower = existing;
      return;
    }
    this.selectedTower = null;
    if (this.towerManager.place(this.selectedTowerType, tile)) {
      audio.play("place");
    }
  }

  // --- Rendering -------------------------------------------------------------

  private drawStatic(): void {
    const g = this.staticGfx;
    g.clear();
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

    // Lane tiles (all branches) + edges so forks are visible.
    const half = GRID.tileSize / 2;
    g.fillStyle(0x394b59, 1);
    for (const k of this.map.pathKeys) {
      const [c, r] = k.split(",").map(Number);
      const p = tileToPixel(c, r);
      g.fillRect(p.x - half, p.y - half, GRID.tileSize, GRID.tileSize);
    }
    g.lineStyle(4, 0x5a7186, 1);
    for (const [from, to] of this.map.edges) {
      const a = tileToPixel(from.col, from.row);
      const b = tileToPixel(to.col, to.row);
      g.lineBetween(a.x, a.y, b.x, b.y);
    }

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
    this.drawBlasts(g);
    this.drawBeams(g);
    this.drawProjectiles(g);
    this.drawEnemies(g);
    this.drawParticles(g);
  }

  private drawTowers(g: Phaser.GameObjects.Graphics): void {
    const s = GRID.tileSize / 2 - 5;
    for (const tower of this.towerManager.getTowers()) {
      if (tower === this.selectedTower) {
        g.lineStyle(2, 0xffffff, 0.5);
        g.strokeCircle(tower.x, tower.y, tower.rangePx);
      }
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

  private drawBlasts(g: Phaser.GameObjects.Graphics): void {
    for (const b of this.towerManager.getBlasts()) {
      const t = Phaser.Math.Clamp(b.age / b.duration, 0, 1);
      const alpha = 1 - t;
      const radius = b.radiusPx * (0.2 + 0.8 * t);
      // Soft flash early, expanding ring throughout.
      g.fillStyle(0xffb703, alpha * 0.35);
      g.fillCircle(b.x, b.y, radius);
      g.lineStyle(2, 0xfb8500, alpha);
      g.strokeCircle(b.x, b.y, radius);
    }
  }

  private drawBeams(g: Phaser.GameObjects.Graphics): void {
    for (const b of this.towerManager.getBeams()) {
      const alpha = Phaser.Math.Clamp(1 - b.age / b.duration, 0, 1);
      g.lineStyle(3, 0xff7bef, alpha);
      g.lineBetween(b.x1, b.y1, b.x2, b.y2);
    }
  }

  private drawEnemies(g: Phaser.GameObjects.Graphics): void {
    for (const enemy of this.enemyManager.getEnemies()) {
      const spec = ENEMIES[enemy.type];
      const r = spec.radius;
      const cos = Math.cos(enemy.angle);
      const sin = Math.sin(enemy.angle);
      // Local frame: forward = +x. Rotate by the facing angle around the center.
      const rot = (lx: number, ly: number) => ({
        x: enemy.x + lx * cos - ly * sin,
        y: enemy.y + lx * sin + ly * cos,
      });

      const v = enemy.variant;
      const bodyColor = v?.bodyColor ?? spec.color;
      const accent = v?.accentColor ?? 0xffffff;

      // Body shape (polygon for vehicles/planes, circle for the soldier).
      let points: { x: number; y: number }[] | null = null;
      switch (enemy.type) {
        case "plane":
          points = [rot(r, 0), rot(-0.7 * r, -0.8 * r), rot(-0.7 * r, 0.8 * r)];
          break;
        case "tank":
          points = [
            rot(r, -0.7 * r),
            rot(r, 0.7 * r),
            rot(-r, 0.7 * r),
            rot(-r, -0.7 * r),
          ];
          break;
        case "buggy":
          points = [
            rot(r, -0.6 * r),
            rot(r, 0.6 * r),
            rot(-r, 0.6 * r),
            rot(-r, -0.6 * r),
          ];
          break;
        default:
          points = null;
      }

      g.fillStyle(bodyColor, 1);
      if (points) g.fillPoints(points, true);
      else g.fillCircle(enemy.x, enemy.y, r);

      if (v?.outline) {
        g.lineStyle(1.5, accent, 1);
        if (points) g.strokePoints(points, true);
        else g.strokeCircle(enemy.x, enemy.y, r);
      }

      // Type-specific accent: tank turret / soldier facing nub.
      if (enemy.type === "tank" || enemy.type === "soldier") {
        const a0 = rot(0, 0);
        const a1 = rot((enemy.type === "tank" ? 0.95 : 1) * r, 0);
        g.lineStyle(enemy.type === "tank" ? 3 : 2, accent, 1);
        g.lineBetween(a0.x, a0.y, a1.x, a1.y);
      }

      // Small accent stripes along the forward axis.
      if (v && v.stripes > 0) {
        g.fillStyle(accent, 1);
        for (let i = 0; i < v.stripes; i++) {
          const p = rot(-0.3 * r + i * 0.3 * r, 0);
          g.fillCircle(p.x, p.y, 1.5);
        }
      }

      this.drawHealthBar(g, enemy.x, enemy.y - r - 5, enemy.hp / enemy.maxHp);
    }
  }

  private drawParticles(g: Phaser.GameObjects.Graphics): void {
    for (const p of this.enemyManager.getParticles()) {
      const alpha = Phaser.Math.Clamp(1 - p.age / p.life, 0, 1);
      g.fillStyle(p.color, alpha);
      if (p.shape === "square") {
        g.fillRect(p.x - p.size, p.y - p.size, p.size * 2, p.size * 2);
      } else {
        g.fillCircle(p.x, p.y, p.size);
      }
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
