import { GRID } from "../config/grid";
import { TOWERS, type TowerType } from "../config/towers";
import { Tower } from "../entities/Tower";
import { Projectile } from "../entities/Projectile";
import { acquireTarget } from "./TargetingSystem";
import { isBuildable, type GameMap } from "./PathGenerator";
import type { Economy } from "./Economy";
import type { EnemyManager } from "./EnemyManager";
import type { Enemy } from "../entities/Enemy";
import type { TileCoord } from "../types";

function tileKey(tile: TileCoord): string {
  return `${tile.col},${tile.row}`;
}

/**
 * Owns placed towers and live projectiles. Validates placement (buildable tile,
 * not occupied, affordable) and upgrades against the economy, and each frame
 * runs tower targeting/firing and advances projectiles. Framework-agnostic.
 */
export class TowerManager {
  private towers: Tower[] = [];
  private projectiles: Projectile[] = [];
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
        this.fire(tower, target);
        tower.resetCooldown();
      }
    }

    for (const p of this.projectiles) p.update(dt, enemies);
    this.projectiles = this.projectiles.filter((p) => p.alive);
  }

  private fire(tower: Tower, target: Enemy): void {
    const speedPx = tower.spec.projectileSpeed * GRID.tileSize;
    if (tower.splashRadiusPx > 0) {
      this.projectiles.push(
        new Projectile({
          x: tower.x,
          y: tower.y,
          speedPx,
          damage: tower.damage,
          targets: tower.targets,
          impact: { x: target.x, y: target.y },
          splashRadiusPx: tower.splashRadiusPx,
        }),
      );
    } else {
      this.projectiles.push(
        new Projectile({
          x: tower.x,
          y: tower.y,
          speedPx,
          damage: tower.damage,
          targets: tower.targets,
          target,
        }),
      );
    }
  }

  getTowers(): readonly Tower[] {
    return this.towers;
  }

  getProjectiles(): readonly Projectile[] {
    return this.projectiles;
  }
}
