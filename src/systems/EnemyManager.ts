import { Enemy } from "../entities/Enemy";
import type { EnemyType } from "../config/enemies";
import type { Economy } from "./Economy";
import type { Vec2 } from "../types";

/**
 * Owns the live set of enemies. Spawns them on the correct route (ground enemies
 * on the path, planes on the air route), advances them, and resolves outcomes:
 * a death grants its reward, a base arrival applies its lives cost. Both remove
 * the enemy. Framework-agnostic so it can be unit-tested.
 */
export class EnemyManager {
  private enemies: Enemy[] = [];

  constructor(
    private readonly groundRoute: Vec2[],
    private readonly airRoute: Vec2[],
    private readonly economy: Economy,
  ) {}

  spawn(type: EnemyType, hpScale = 1): Enemy {
    const route = type === "plane" ? this.airRoute : this.groundRoute;
    const enemy = new Enemy(type, route, hpScale);
    this.enemies.push(enemy);
    return enemy;
  }

  /** Advance all enemies and resolve deaths and base arrivals. */
  update(dt: number): void {
    for (const enemy of this.enemies) {
      enemy.update(dt);
      if (!enemy.alive) {
        this.economy.earn(enemy.reward);
      } else if (enemy.reachedBase) {
        this.economy.loseLives(enemy.livesCost);
      }
    }
    this.enemies = this.enemies.filter((e) => e.alive && !e.reachedBase);
  }

  getEnemies(): readonly Enemy[] {
    return this.enemies;
  }

  /** True when no enemies remain on the field. */
  isEmpty(): boolean {
    return this.enemies.length === 0;
  }
}
