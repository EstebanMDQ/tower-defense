import type { Enemy } from "../entities/Enemy";
import type { TargetClass } from "../types";

/**
 * Select the enemy closest to the base (least remaining route distance) among
 * those of the given target class within range of (x, y). Returns null when none
 * are eligible. Ties keep the earlier-encountered enemy (deterministic).
 */
export function acquireTarget(
  x: number,
  y: number,
  rangePx: number,
  targets: TargetClass,
  enemies: readonly Enemy[],
): Enemy | null {
  const rangeSq = rangePx * rangePx;
  let best: Enemy | null = null;
  let bestDist = Infinity;

  for (const e of enemies) {
    if (!e.alive || e.reachedBase) continue;
    if (e.targetClass !== targets) continue;
    const dx = e.x - x;
    const dy = e.y - y;
    if (dx * dx + dy * dy > rangeSq) continue;
    const d = e.distanceToBase();
    if (d < bestDist) {
      bestDist = d;
      best = e;
    }
  }
  return best;
}
