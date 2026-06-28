import { GRID } from "../config/grid";
import { TOWERS, type TowerType } from "../config/towers";
import { Tower } from "../entities/Tower";
import { Projectile } from "../entities/Projectile";
import { acquireTarget } from "./TargetingSystem";
import { isBuildable, type GameMap } from "./PathGenerator";
import type { Economy } from "./Economy";
import type { EnemyManager } from "./EnemyManager";
import type { Enemy } from "../entities/Enemy";
import type { TargetClass, TileCoord } from "../types";

/**
 * Enemies struck by a pierce ray from (x, y) along unit direction (ux, uy):
 * eligible by class, in front (projection within [0, range]), and within the
 * perpendicular band. Pure, so it is unit-testable.
 */
export function pierceHits(
  x: number,
  y: number,
  ux: number,
  uy: number,
  range: number,
  band: number,
  targets: readonly TargetClass[],
  enemies: readonly Enemy[],
): Enemy[] {
  const hits: Enemy[] = [];
  for (const e of enemies) {
    if (!e.alive || e.reachedBase) continue;
    if (!targets.includes(e.targetClass)) continue;
    const ex = e.x - x;
    const ey = e.y - y;
    const proj = ex * ux + ey * uy;
    if (proj < 0 || proj > range) continue;
    const perp = Math.abs(ex * uy - ey * ux);
    if (perp <= band) hits.push(e);
  }
  return hits;
}

function tileKey(tile: TileCoord): string {
  return `${tile.col},${tile.row}`;
}

/** A transient sniper beam, drawn for a brief moment after a pierce shot. */
export interface Beam {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  age: number;
  duration: number;
}

const BEAM_DURATION = 0.12;

/** A transient Mortar blast effect, sized to the splash radius. */
export interface Blast {
  x: number;
  y: number;
  radiusPx: number;
  age: number;
  duration: number;
}

const BLAST_DURATION = 0.35;

/**
 * Owns placed towers and live projectiles. Validates placement (buildable tile,
 * not occupied, affordable) and upgrades against the economy, and each frame
 * runs tower targeting/firing and advances projectiles. Framework-agnostic.
 */
export class TowerManager {
  private towers: Tower[] = [];
  private projectiles: Projectile[] = [];
  private beams: Beam[] = [];
  private blasts: Blast[] = [];
  private occupied = new Set<string>();

  constructor(
    private readonly map: GameMap,
    private readonly economy: Economy,
    private readonly enemyManager: EnemyManager,
  ) {}

  /** Whether a tower of this type could be placed on the tile right now. */
  canPlace(type: TowerType, tile: TileCoord): boolean {
    return (
      isBuildable(this.map, tile.col, tile.row) &&
      !this.occupied.has(tileKey(tile)) &&
      this.economy.canAfford(TOWERS[type].cost)
    );
  }

  /** Place a tower, deducting its cost. Returns null if placement is invalid. */
  place(type: TowerType, tile: TileCoord): Tower | null {
    if (!this.canPlace(type, tile)) return null;
    if (!this.economy.spend(TOWERS[type].cost)) return null;
    const tower = new Tower(type, tile);
    this.towers.push(tower);
    this.occupied.add(tileKey(tile));
    return tower;
  }

  /** Upgrade a tower, deducting the tier cost. Returns false if not possible. */
  upgrade(tower: Tower): boolean {
    if (!tower.canUpgrade()) return false;
    const cost = tower.upgradeCost();
    if (!this.economy.canAfford(cost)) return false;
    if (!this.economy.spend(cost)) return false;
    tower.applyUpgrade();
    tower.recordInvestment(cost);
    return true;
  }

  /** Sell a tower: refund half its total investment and free its tile. */
  sell(tower: Tower): number {
    const index = this.towers.indexOf(tower);
    if (index === -1) return 0;
    const refund = tower.sellValue();
    this.economy.earn(refund);
    this.towers.splice(index, 1);
    this.occupied.delete(tileKey(tower.tile));
    return refund;
  }

  /** Tower occupying a tile, if any. */
  towerAt(tile: TileCoord): Tower | undefined {
    return this.towers.find(
      (t) => t.tile.col === tile.col && t.tile.row === tile.row,
    );
  }

  update(dt: number): void {
    const enemies = this.enemyManager.getEnemies();
    for (const tower of this.towers) {
      tower.tickCooldown(dt);
      if (!tower.canFire()) continue;
      const target = acquireTarget(
        tower.x,
        tower.y,
        tower.rangePx,
        tower.targets,
        enemies,
      );
      if (target) {
        this.fire(tower, target, enemies);
        tower.resetCooldown();
      }
    }

    // Advance blasts first so any spawned during this frame's impacts start at age 0.
    for (const b of this.blasts) b.age += dt;
    this.blasts = this.blasts.filter((b) => b.age < b.duration);

    for (const p of this.projectiles) p.update(dt, enemies);
    this.projectiles = this.projectiles.filter((p) => p.alive);

    for (const b of this.beams) b.age += dt;
    this.beams = this.beams.filter((b) => b.age < b.duration);
  }

  private fire(tower: Tower, target: Enemy, enemies: readonly Enemy[]): void {
    switch (tower.attack) {
      case "pierce":
        this.firePierce(tower, target, enemies);
        return;
      case "splash":
        this.projectiles.push(
          new Projectile({
            x: tower.x,
            y: tower.y,
            speedPx: tower.spec.projectileSpeed * GRID.tileSize,
            damage: tower.damage,
            targets: tower.targets,
            impact: { x: target.x, y: target.y },
            splashRadiusPx: tower.splashRadiusPx,
            onImpact: (x, y, r) =>
              this.blasts.push({
                x,
                y,
                radiusPx: r,
                age: 0,
                duration: BLAST_DURATION,
              }),
          }),
        );
        return;
      default:
        this.projectiles.push(
          new Projectile({
            x: tower.x,
            y: tower.y,
            speedPx: tower.spec.projectileSpeed * GRID.tileSize,
            damage: tower.damage,
            targets: tower.targets,
            target,
          }),
        );
    }
  }

  /**
   * Hitscan pierce: a ray from the tower toward the aim target out to range.
   * Every eligible enemy within the pierce band of the ray (and in front, within
   * range) takes full damage immediately. A transient beam is recorded for render.
   */
  private firePierce(
    tower: Tower,
    target: Enemy,
    enemies: readonly Enemy[],
  ): void {
    const dx = target.x - tower.x;
    const dy = target.y - tower.y;
    const len = Math.hypot(dx, dy) || 1;
    const ux = dx / len;
    const uy = dy / len;
    const range = tower.rangePx;

    const hits = pierceHits(
      tower.x,
      tower.y,
      ux,
      uy,
      range,
      tower.pierceWidthPx,
      tower.targets,
      enemies,
    );
    for (const e of hits) e.takeDamage(tower.damage);

    this.beams.push({
      x1: tower.x,
      y1: tower.y,
      x2: tower.x + ux * range,
      y2: tower.y + uy * range,
      age: 0,
      duration: BEAM_DURATION,
    });
  }

  getTowers(): readonly Tower[] {
    return this.towers;
  }

  getProjectiles(): readonly Projectile[] {
    return this.projectiles;
  }

  getBeams(): readonly Beam[] {
    return this.beams;
  }

  getBlasts(): readonly Blast[] {
    return this.blasts;
  }
}
