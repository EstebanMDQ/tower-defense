import { GRID } from "../config/grid";
import { ENEMIES, type EnemyType } from "../config/enemies";
import type { EnemyVariant } from "../systems/EnemyVariant";
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
  /** Facing angle in radians: atan2(dy, dx), 0 = +x, increasing clockwise (y down). */
  angle: number;
  /** Per-wave appearance; undefined falls back to the type's base color. */
  variant?: EnemyVariant;

  private readonly speedPx: number;
  private readonly turnRate: number;
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
    this.turnRate = spec.turnRate;
    this.waypoints = waypoints;
    this.x = waypoints[0].x;
    this.y = waypoints[0].y;
    // Initial facing toward the first target (fallback 0 if degenerate).
    const first = waypoints[1] ?? waypoints[0];
    const dx0 = first.x - this.x;
    const dy0 = first.y - this.y;
    this.angle = dx0 === 0 && dy0 === 0 ? 0 : Math.atan2(dy0, dx0);
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
    this.updateFacing(dt);
  }

  /** Ease the facing angle toward the heading of the current target. */
  private updateFacing(dt: number): void {
    if (this.wpIndex >= this.waypoints.length) return;
    const target = this.waypoints[this.wpIndex];
    const dx = target.x - this.x;
    const dy = target.y - this.y;
    if (Math.hypot(dx, dy) < 1e-6) return; // essentially at target - keep facing
    const desired = Math.atan2(dy, dx);
    // Shortest signed angular delta in [-pi, pi].
    let delta = Math.atan2(
      Math.sin(desired - this.angle),
      Math.cos(desired - this.angle),
    );
    const maxStep = this.turnRate * dt;
    if (delta > maxStep) delta = maxStep;
    else if (delta < -maxStep) delta = -maxStep;
    this.angle = Math.atan2(
      Math.sin(this.angle + delta),
      Math.cos(this.angle + delta),
    );
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
