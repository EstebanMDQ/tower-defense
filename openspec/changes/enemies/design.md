## Context

Builds on `map-generation` (path waypoints, straight air route, Base/Portal) and
`economy` (reward on death, lives cost on arrival). Stats come from the GDD enemy
table.

## Goals / Non-Goals

**Goals:**
- One `Enemy` entity driven by a per-type stat config.
- Two movement behaviors selected by type: path-follow (ground) and straight-fly
  (air).
- Clean hooks for damage, death reward, and base-arrival lives cost.

**Non-Goals:**
- Spawning, wave composition, or HP scaling logic (owned by `waves-and-progression`;
  this change only accepts an HP multiplier as input).
- Tower targeting/damage application (owned by `towers-and-combat`; enemies just
  expose `takeDamage` and a target class).

## Decisions

- **Data-driven stats.** `src/config/enemies.ts` holds a typed table keyed by enemy
  type (Soldier, Buggy, Tank, Plane) with HP, speed (tiles/s), reward, lives cost,
  and target class (`ground` | `air`). Gameplay reads from this table.
- **Movement strategy by type.** Ground enemies advance along the path waypoint
  list, moving at `speed` tiles/second toward the next waypoint; on reaching the
  last waypoint (Base) they trigger arrival. Air enemies interpolate along the
  straight Portal->Base segment at their speed.
- **HP scaling is injected.** At spawn the enemy's base HP is multiplied by a
  wave-supplied factor. The enemy stores max and current HP for health-bar display
  later.
- **Death vs arrival are distinct outcomes.** Death (HP <= 0) grants the reward via
  Economy and removes the enemy. Arrival (reached Base) applies the lives cost via
  Economy and removes the enemy without a reward.
- **Target class drives tower eligibility.** Each enemy exposes `targetClass` so
  the targeting system can include/exclude it (planes = air, others = ground).
- **Rendering:** colored circles (or simple shapes) per type; a small health bar
  can be added when towers deal damage.

## Risks / Trade-offs

- Path-following needs careful handling at waypoint transitions to avoid overshoot
  at high speed (Buggy is fast); clamp movement to the remaining segment length per
  frame.
- Speeds are in tiles/second and must be converted through the bootstrap tile/pixel
  helper at render time - keep movement math in tile space.
