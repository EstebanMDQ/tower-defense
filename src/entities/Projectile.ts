import type { Enemy } from "./Enemy";
import type { TargetClass, Vec2 } from "../types";

export interface ProjectileOptions {
  x: number;
  y: number;
  speedPx: number;
  damage: number;
  targets: TargetClass;
  /** Homing single-target: follows the enemy; discarded if it is removed. */
  target?: Enemy;
  /** Fixed impact point (Mortar): explodes at this point regardless of target. */
  impact?: Vec2;
  /** Splash radius in pixels; when > 0, damages all eligible enemies in radius. */
  splashRadiusPx?: number;
}

/**
 * A projectile in flight. Two modes:
 * - Homing (single-target): tracks an enemy; if the enemy dies or reaches the
 *   base before impact, the projectile is discarded with no damage.
 * - Point (Mortar splash): travels to a fixed impact point captured at fire time
 *   and damages every eligible enemy within the splash radius - position-based,
 *   so a dying primary target does not cancel it.
 */
export class Projectile {
  x: number;
  y: number;
  alive = true;

  constructor(private readonly opts: ProjectileOptions) {
    this.x = opts.x;
    this.y = opts.y;
  }

  update(dt: number, enemies: readonly Enemy[]): void {
    if (!this.alive) return;

    let dest: Vec2;
    if (this.opts.target) {
      const t = this.opts.target;
      if (!t.alive || t.reachedBase) {
        this.alive = false;
        return;
      }
      dest = { x: t.x, y: t.y };
    } else if (this.opts.impact) {
      dest = this.opts.impact;
    } else {
      this.alive = false;
      return;
    }

    const dx = dest.x - this.x;
    const dy = dest.y - this.y;
    const dist = Math.hypot(dx, dy);
    const move = this.opts.speedPx * dt;
    if (dist <= move) {
      this.x = dest.x;
      this.y = dest.y;
      this.impact(enemies);
      this.alive = false;
    } else {
      this.x += (dx / dist) * move;
      this.y += (dy / dist) * move;
    }
  }

  get color(): number {
    return this.opts.target ? 0xffffff : 0xffb703;
  }

  private impact(enemies: readonly Enemy[]): void {
    const splash = this.opts.splashRadiusPx ?? 0;
    if (splash > 0) {
      const r2 = splash * splash;
      for (const e of enemies) {
        if (!e.alive || e.reachedBase) continue;
        if (e.targetClass !== this.opts.targets) continue;
        const dx = e.x - this.x;
        const dy = e.y - this.y;
        if (dx * dx + dy * dy <= r2) e.takeDamage(this.opts.damage);
      }
    } else if (this.opts.target) {
      this.opts.target.takeDamage(this.opts.damage);
    }
  }
}
