import { GRID, tileToPixel } from "../config/grid";
import { TOWERS, type TowerSpec, type TowerType } from "../config/towers";
import { UPGRADE_TIERS, MAX_LEVEL } from "../config/upgrades";
import type { TargetClass, TileCoord } from "../types";

/**
 * A placed tower. Framework-agnostic so combat is testable. Effective stats are
 * derived from the base spec multiplied by the current upgrade tier; firing is
 * gated by a cooldown so the first shot on acquiring a target is immediate.
 */
export class Tower {
  readonly type: TowerType;
  readonly tile: TileCoord;
  readonly x: number;
  readonly y: number;
  readonly targets: TargetClass;
  /** 1..MAX_LEVEL. */
  level = 1;

  private cooldown = 0;

  constructor(type: TowerType, tile: TileCoord) {
    this.type = type;
    this.tile = tile;
    this.targets = TOWERS[type].targets;
    const p = tileToPixel(tile.col, tile.row);
    this.x = p.x;
    this.y = p.y;
  }

  get spec(): TowerSpec {
    return TOWERS[this.type];
  }

  private get tier() {
    return UPGRADE_TIERS[this.level - 1];
  }

  get damage(): number {
    return this.spec.damage * this.tier.damageMul;
  }

  /** Range in tiles. */
  get range(): number {
    return this.spec.range * this.tier.rangeMul;
  }

  get rangePx(): number {
    return this.range * GRID.tileSize;
  }

  get fireRate(): number {
    return this.spec.fireRate * this.tier.fireRateMul;
  }

  get splashRadiusPx(): number {
    return (this.spec.splashRadius ?? 0) * GRID.tileSize;
  }

  canUpgrade(): boolean {
    return this.level < MAX_LEVEL;
  }

  /** Cost to reach the next tier, or 0 if already maxed. */
  upgradeCost(): number {
    if (!this.canUpgrade()) return 0;
    return Math.round(this.spec.cost * UPGRADE_TIERS[this.level].costRatio);
  }

  applyUpgrade(): void {
    if (this.canUpgrade()) this.level++;
  }

  tickCooldown(dt: number): void {
    if (this.cooldown > 0) this.cooldown -= dt;
  }

  canFire(): boolean {
    return this.cooldown <= 0;
  }

  /** Reset the cooldown to one firing interval after a shot. */
  resetCooldown(): void {
    this.cooldown = 1 / this.fireRate;
  }
}
