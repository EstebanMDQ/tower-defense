## Why

Right now an enemy that is killed simply vanishes - there's no feedback for the
kill. Adding a short explosion when an enemy dies makes combat feel responsive, and
giving each enemy type its own explosion makes the four units read distinctly at a
glance (a soldier popping looks different from a tank blowing up). Purely visual; no
gameplay change.

## What Changes

- When an enemy is **killed** (its health reaches zero), spawn a short explosion
  effect at its position.
- Each enemy type has a **distinct explosion** (different color, size, particle
  count, and spread): Soldier a small puff, Buggy a quick burst, Tank a large
  forceful blast, Plane an airy burst with falling debris.
- Explosions are tracked and advanced over time, then removed when they finish.
- Enemies that reach the base (leak) do **not** explode - only kills do.
- This does not change rewards, lives, or any other gameplay.

## Capabilities

### Modified Capabilities
- `enemies`: add a per-type death explosion effect shown when an enemy is killed
  (presentation only; death/reward/removal behavior is unchanged).

## Impact

- New `src/config/explosions.ts` (per-type explosion parameters),
  `src/systems/EnemyManager.ts` (spawn + advance particle effects on death),
  `src/scenes/GameScene.ts` (render the particles).
- Depends on the existing `enemies` death handling; reuses the enemy type and
  position at the moment of death.
- Integration: three open changes touch `GameScene.drawEnemies` and the `enemies`
  spec (this, `directional-enemy-shapes`, `procedural-enemy-variants`). This change
  is additive - a new `getParticles()` draw loop in `drawDynamic`, not edits to the
  enemy-shape body, and an `## ADDED` spec requirement - so it layers cleanly
  regardless of merge order.
