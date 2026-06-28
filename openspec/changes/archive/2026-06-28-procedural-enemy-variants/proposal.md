## Why

Enemies get tougher every wave (more HP), but they look identical wave after wave,
so the rising threat isn't visible. Procedurally restyling each unit type per wave -
same recognizable shape, but shifted colors and small details - makes each wave feel
like a fresh, more dangerous batch, while staying within the game's simple
procedural-shapes aesthetic and needing no art assets.

## What Changes

- Add a deterministic **variant generator**: given an enemy type and the wave
  number, it produces an appearance (body color, accent color, and small detail
  flags such as an outline or stripes).
- The **shape is unchanged** - a tank is still a tank; only colors and minor details
  vary, so units stay instantly recognizable by type.
- All units of a type within the **same wave share the same variant** (consistent
  look per wave); the variant **changes between waves**.
- Appearance trends to signal escalating strength (e.g. darker, more saturated, more
  marked at higher waves), so a glance conveys "this wave is tougher."
- Purely visual: HP, speed, rewards, targeting, and movement are unchanged.

## Capabilities

### Modified Capabilities
- `enemies`: each enemy is drawn with a per-wave, per-type procedural variant
  (colors and small details) derived deterministically from its type and wave; the
  shape is preserved (presentation only; no gameplay change).

## Impact

- New `src/systems/EnemyVariant.ts` (pure variant generator + small color helpers),
  `src/systems/WaveManager.ts` (pass the wave to spawn), `src/systems/EnemyManager.ts`
  and `src/entities/Enemy.ts` (carry the variant), `src/scenes/GameScene.ts` (use the
  variant colors/details when drawing).
- Depends on the existing `enemies` rendering. Self-contained: it colors whatever
  shape the renderer currently draws, so it composes with `directional-enemy-shapes`
  in either order (its spec delta is purely additive). If both land, applying
  `directional-enemy-shapes` first means the variant colors the richer oriented
  shapes; either order works.
