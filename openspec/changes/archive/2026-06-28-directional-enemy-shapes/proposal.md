## Why

Enemies are currently drawn as static, unrotated shapes (circles for ground, a
fixed triangle for planes). They don't convey motion or read as actual units - a
plane's triangle doesn't point where it's going, and a tank looks the same whether
it's heading straight or around a corner. Orienting each shape to its direction of
travel, while keeping the simple procedural shapes, makes the units feel alive and
readable without any art assets.

## What Changes

- Give each enemy a **facing direction** derived from its movement, and rotate its
  drawn shape to point that way.
- Rotation **eases toward the heading** at a per-type turn rate, so units visibly
  turn through corners instead of snapping. Tanks turn slowly (a clear pivot on
  path turns); planes and lighter units turn quickly.
- Keep basic shapes but make them more unit-like and oriented:
  - **Plane** - triangle with its nose vertex pointing forward along the heading.
  - **Tank** - rectangle hull (with a short turret line) that rotates toward the
    heading, visibly pivoting on turns.
  - **Buggy** - small rectangle oriented to the heading (a fast vehicle).
  - **Soldier** - small circle with a short direction nub indicating facing.
- Purely visual: movement, speed, HP, rewards, and targeting are unchanged.

## Capabilities

### Modified Capabilities
- `enemies`: enemies are oriented to their direction of travel and rotate smoothly
  toward it at a per-type turn rate; the per-type shapes are drawn rotated to the
  facing (presentation; no movement or combat change).

## Impact

- `src/config/enemies.ts` (add a per-type `turnRate`), `src/entities/Enemy.ts`
  (track and ease a facing `angle`), `src/scenes/GameScene.ts` (draw each type's
  shape rotated to the facing).
- Depends on the existing `enemies` movement; reuses the per-segment movement
  direction already computed during `update`.
- Integration: three open changes touch `GameScene.drawEnemies` and the `enemies`
  spec (this, `enemy-death-explosions`, `procedural-enemy-variants`). This change
  defines the oriented per-type shapes; `procedural-enemy-variants` colors exactly
  those shapes. Whichever lands later merges the `drawEnemies` rewrite; cleanest
  order is this change first.
