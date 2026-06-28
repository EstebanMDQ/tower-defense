## Why

The Mortar deals splash damage within a 1.0-tile radius, but nothing on screen
shows that area. Players can't see how big the blast is, where it landed, or
confirm that it hit a cluster. A short blast animation at the impact point makes
the splash readable and the Mortar more satisfying to use - without changing any
gameplay.

## What Changes

- When a Mortar shell impacts, spawn a brief **blast effect** centered on the
  impact point and sized to the tower's splash radius: an expanding ring that fades
  out over a fraction of a second.
- Track active blast effects and advance them over time, removing each when it
  finishes.
- This is purely visual: splash damage is still applied to every eligible enemy in
  the radius exactly as before.

## Capabilities

### Modified Capabilities
- `towers`: add a splash-impact visual effect for the Mortar (presentation of the
  existing splash behavior; no change to damage rules).

## Impact

- `src/entities/Projectile.ts` (an impact hook reporting the impact point and
  splash radius), `src/systems/TowerManager.ts` (track and advance blast effects),
  `src/scenes/GameScene.ts` (render the expanding fading ring).
- Depends on the existing `towers` splash behavior; reuses the Mortar's configured
  `splashRadius`.
