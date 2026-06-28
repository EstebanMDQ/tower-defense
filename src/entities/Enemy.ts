import { GRID } from "../config/grid";
import { ENEMIES, type EnemyType } from "../config/enemies";
import type { TargetClass, Vec2 } from "../types";

/**
 * A single enemy. Framework-agnostic (no Phaser) so movement and combat are
 * testable. Moves along a route of pixel-space waypoints at its configured speed;
 * ground enemies receive the path waypoints, planes receive the straight air
 * route. Rendering is handled by the scene from this entity's public state.
 */
export class Enemy {
  readonly type: EnemyType;
  readonly targetClass: TargetClass;
  readonly maxHp: number;
  readonly reward: number;
  readonly livesCost: number;

  hp: number;
  x: number;
  y: number;
  alive = true;
  reachedBase = false;

  private readonly speedPx: number;
  private readonly waypoints: Vec2[];
  private wpIndex = 1;

  /**
   * @param waypoints ordered pixel-space points; the enemy starts at index 0 and
   *   advances toward the last (the base).
   * @param hpScale per-wave HP multiplier applied to the base HP at spawn.
   */
  constructor(type: EnemyType, waypoints: Vec2[], hpScale = 1) {
    const spec = ENEMIES[type];
    this.type = type;
    this.targetClass = spec.targetClass;
    this.maxHp = spec.hp * hpScale;
    this.hp = this.maxHp;
    this.reward = spec.reward;
    this.livesCost = spec.livesCost;
    this.speedPx = spec.speed * GRID.tileSize;
    this.waypoints = waypoints;
    this.x = waypoints[0].x;
    this.y = waypoints[0].y;
  }

  /** Advance along the route by elapsed seconds, clamped per segment. */
  update(dt: number): void {
    if (!this.alive || this.reachedBase) return;
    let remaining = this.speedPx * dt;
    while (remaining > 0 && this.wpIndex < this.waypoints.length) {
      const target = this.waypoints[this.wpIndex];
      const dx = target.x - this.x;
      const dy = target.y - this.y;
      const dist = Math.hypot(dx, dy);
      if (dist <= remaining) {
        this.x = target.x;
        this.y = target.y;
        remaining -= dist;
        this.wpIndex++;
      } else {
        this.x += (dx / dist) * remaining;
        this.y += (dy / dist) * remaining;
        remaining = 0;
      }
    }
    if (this.wpIndex >= this.waypoints.length) {
      this.reachedBase = true;
    }
  }

  takeDamage(amount: number): void {
    if (!this.alive) return;
    this.hp -= amount;
    if (this.hp <= 0) {
      this.hp = 0;
      this.alive = false;
    }
  }

  /** Remaining route distance to the base (smaller = closer to the base). */
  distanceToBase(): number {
    if (this.wpIndex >= this.waypoints.length) return 0;
    let d = Math.hypot(
      this.waypoints[this.wpIndex].x - this.x,
      this.waypoints[this.wpIndex].y - this.y,
    );
    for (let i = this.wpIndex; i < this.waypoints.length - 1; i++) {
      d += Math.hypot(
        this.waypoints[i + 1].x - this.waypoints[i].x,
        this.waypoints[i + 1].y - this.waypoints[i].y,
      );
    }
    return d;
  }
}
