## Context

`EnemyManager.update` already resolves outcomes each frame: an enemy with
`alive === false` is a kill (grants reward), one with `reachedBase === true` is a
leak (costs lives). Both are then filtered out of the list. This is the exact point
to spawn a death explosion - on the kill branch only. The manager is
framework-agnostic and runs every frame, so it can own the effect state; the scene
renders it.

## Goals / Non-Goals

**Goals:**
- A distinct, short explosion per enemy type at the kill location.
- Spawn only on kills, never on base arrival.
- Keep effect logic Phaser-free and unit-testable; no change to gameplay.

**Non-Goals:**
- Sprite/texture particles or sound (procedural shapes only).
- Sharing a particle system with the Mortar blast effect (kept independent so the
  changes apply in any order; a later refactor could unify them).
- Physics-accurate debris.

## Decisions

- **Per-type config in `src/config/explosions.ts`.** For each `EnemyType`: particle
  count, color palette, base speed (px/s), particle size (px), lifetime (s), gravity
  (px/s^2), and shape (`circle` | `square`). Concrete first-pass values (tunable):
  - Soldier - count 6, yellow, speed 60, size 2, life 0.35, gravity 120, circle.
  - Buggy - count 8, red/pink, speed 90, size 2, life 0.4, gravity 120, circle.
  - Tank - count 16, green/orange, speed 110, size 3, life 0.7, gravity 80, square
    (heavy debris chunks; biggest blast).
  - Plane - count 10, blue/white, speed 80, size 2, life 0.5, gravity 200 (strong
    downward fall), circle.
- **Particle model (plain data).** `Particle { x, y, vx, vy, color, size, age, life }`
  - the same field shape intended for the Mortar blast effect, so a future shared
    `EffectsManager` is a move, not a rewrite. A death spawns exactly `count`
    particles (deterministic count) at the enemy position with outward velocities
    (angle varied by index, magnitude around `speed`); only the velocity spread uses
    `Math.random`, so the particle count is testable.
- **EnemyManager owns the particles.** Each frame, **advance existing particles
  first** (`x += vx*dt`, `y += vy*dt`, `vy += gravity*dt`, `age += dt`; remove those
  past their life), **then** resolve outcomes and, on the kill branch, push the
  type's burst at the enemy position with `age = 0`. This ordering means a just-spawned
  burst sits exactly at the kill point when read after `update`, so a position
  assertion is exact. Expose `getParticles()`.
- **Kill-vs-leak precedence.** The existing `if (!alive) {...} else if (reachedBase)`
  means an enemy that is killed the same frame it would reach the base takes the kill
  branch (reward, explosion) - consistent with the spec's "reaches the base instead
  of being killed."
- **Rendering in GameScene.** Draw each particle on the dynamic graphics layer as a
  small filled circle (or square for Tank debris) with alpha fading over
  `age / life`. No new managed scene objects.

## Risks / Trade-offs

- A wave wipe can spawn many particles at once; they're plain data with short lives
  and are cheap to advance/draw at this scale. If needed, cap particles-per-death
  (already small) or total particles.
- Putting particles in `EnemyManager` slightly broadens its role (movement + combat
  + death FX). Acceptable for v1; a dedicated effects system can absorb both this
  and the Mortar blast later.
