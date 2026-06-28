import { Enemy } from "../entities/Enemy";
import type { EnemyType } from "../config/enemies";
import { EXPLOSIONS } from "../config/explosions";
import { makeEnemyVariant, type EnemyVariant } from "./EnemyVariant";
import type { Economy } from "./Economy";
import type { Vec2 } from "../types";

/** A death-explosion particle (plain data; advanced each frame). */
export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  gravity: number;
  color: number;
  size: number;
  shape: "circle" | "square";
  age: number;
  life: number;
}

/**
 * Owns the live set of enemies. Spawns them on the correct route (ground enemies
 * on the path, planes on the air route), advances them, and resolves outcomes:
 * a death grants its reward, a base arrival applies its lives cost. Both remove
 * the enemy. Framework-agnostic so it can be unit-tested.
 */
export class EnemyManager {
  private enemies: Enemy[] = [];
  private particles: Particle[] = [];
  private variantCache = new Map<string, EnemyVariant>();

  /** Optional hooks fired on a kill / on a base arrival (for sound). */
  onKill?: (type: EnemyType) => void;
  onLeak?: () => void;

  constructor(
    private readonly groundRoute: Vec2[],
    private readonly airRoute: Vec2[],
    private readonly economy: Economy,
  ) {}

  /** Spawn an enemy. When `wave` is given, it carries that wave's appearance variant. */
  spawn(type: EnemyType, hpScale = 1, wave?: number): Enemy {
    const route = type === "plane" ? this.airRoute : this.groundRoute;
    const enemy = new Enemy(type, route, hpScale);
    if (wave !== undefined) enemy.variant = this.variantFor(type, wave);
    this.enemies.push(enemy);
    return enemy;
  }

  private variantFor(type: EnemyType, wave: number): EnemyVariant {
    const key = `${type},${wave}`;
    let v = this.variantCache.get(key);
    if (!v) {
      v = makeEnemyVariant(type, wave);
      this.variantCache.set(key, v);
    }
    return v;
  }

  /** Advance all enemies and resolve deaths and base arrivals. */
  update(dt: number): void {
    // Advance existing particles first, so a burst spawned this frame starts at age 0.
    for (const p of this.particles) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += p.gravity * dt;
      p.age += dt;
    }
    this.particles = this.particles.filter((p) => p.age < p.life);

    for (const enemy of this.enemies) {
      enemy.update(dt);
      if (!enemy.alive) {
        this.economy.earn(enemy.reward);
        this.spawnExplosion(enemy);
        this.onKill?.(enemy.type);
      } else if (enemy.reachedBase) {
        this.economy.loseLives(enemy.livesCost);
        this.onLeak?.();
      }
    }
    this.enemies = this.enemies.filter((e) => e.alive && !e.reachedBase);
  }

  /** Spawn the type's death-explosion burst at the enemy's position. */
  private spawnExplosion(enemy: Enemy): void {
    const spec = EXPLOSIONS[enemy.type];
    for (let i = 0; i < spec.count; i++) {
      const angle = (i / spec.count) * Math.PI * 2 + Math.random() * 0.6;
      const mag = spec.speed * (0.5 + Math.random() * 0.5);
      this.particles.push({
        x: enemy.x,
        y: enemy.y,
        vx: Math.cos(angle) * mag,
        vy: Math.sin(angle) * mag,
        gravity: spec.gravity,
        color: spec.colors[i % spec.colors.length],
        size: spec.size,
        shape: spec.shape,
        age: 0,
        life: spec.life,
      });
    }
  }

  getParticles(): readonly Particle[] {
    return this.particles;
  }

  getEnemies(): readonly Enemy[] {
    return this.enemies;
  }

  /** True when no enemies remain on the field. */
  isEmpty(): boolean {
    return this.enemies.length === 0;
  }
}
