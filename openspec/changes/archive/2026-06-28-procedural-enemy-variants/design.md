## Context

Each enemy type currently has a single fixed `color` in `src/config/enemies.ts`, used
by `GameScene.drawEnemies`. Enemies are spawned by `WaveManager` (which knows the
wave) through `EnemyManager.spawn(type, hpScale)`. To restyle per wave we generate a
deterministic variant from `(type, wave)`, attach it to the enemy at spawn, and have
the renderer use it. The existing seeded PRNG (`mulberry32` in `systems/Rng.ts`) and
the same determinism approach as the path/composition generators apply here.

## Goals / Non-Goals

**Goals:**
- Deterministic, reproducible appearance per `(type, wave)` - same inputs, same look.
- Recognizable silhouette preserved; only colors and minor details change.
- Consistent within a wave, different between waves; trends "more dangerous" upward.
- Pure, unit-testable generator (no Phaser).

**Non-Goals:**
- Per-individual variation within a wave (all units of a type in a wave match).
- Texture/sprite generation - we vary draw parameters, not bitmaps.
- Changing shapes or gameplay.

## Decisions

- **Pure variant generator** `makeEnemyVariant(type, wave): EnemyVariant` in
  `systems/EnemyVariant.ts`, seeded deterministically by
  `mulberry32(((hash(type) * 2654435761) ^ (wave * 40503)) >>> 0)` (mirrors the
  `>>> 0` seed style of `generateComposition`), so the determinism test can pin a
  known constant.
  ```
  interface EnemyVariant { bodyColor: number; accentColor: number;
                           outline: boolean; stripes: number /* 0..2 */ }
  ```
- **Color math via HSL.** Convert the type's base `color` to HSL, then:
  - rotate hue by a bounded seeded jitter of at most +/-15 degrees around the base
    hue plus a small wave-driven offset (keeps it recognizably in the type's family
    while differing each wave),
  - increase saturation and decrease lightness as the wave rises, both clamped:
    lightness has a floor of 0.25 so units stay visible on the dark background, and
    saturation a ceiling of 1.0 - so higher waves read darker/more intense = stronger,
  - derive `accentColor` by a larger fixed hue rotation (~150 degrees, a contrasting
    trim/turret/stripe).
  Convert back to a packed `0xRRGGBB`. Small pure `rgbToHsl`/`hslToRgb` helpers live
  alongside the generator; they round-trip within +/-1 per 0-255 channel (rounding).
- **Detail flags** (`outline`, `stripes`) come from the same seed for cheap
  per-wave variety without touching the silhouette.
- **Plumbing.** `WaveManager` passes the current wave to `EnemyManager.spawn(type,
  hpScale, wave)`; the manager computes `makeEnemyVariant(type, wave)` once per spawn
  (or caches per `(type, wave)`) and stores it on the `Enemy` as `variant`. `Enemy`
  just carries the data. `wave` is **optional** (`wave?: number`, like the existing
  `hpScale = 1` default) so existing callers that do `spawn("soldier")` /
  `spawn("tank")` (in `tests/towers.test.ts` and `tests/enemy.test.ts`) keep
  compiling; when `wave` is absent the enemy carries no variant and the renderer
  uses the config base color (the documented fallback path).
- **Rendering.** `GameScene.drawEnemies` uses `enemy.variant.bodyColor` for the body
  and `accentColor` for accents (turret line / stripe / outline), drawing the
  `outline`/`stripes` details. Falls back to the config base color if no variant is
  present. Shapes and health bars are unchanged.

## Risks / Trade-offs

- Hue jitter must be bounded so a type stays in its recognizable color family;
  unbounded rotation could make a tank look like a plane's color. We clamp the jitter
  and anchor on the base hue.
- Lightness trending down with wave could eventually get too dark; clamp to a floor so
  units stay visible on the dark background.
- Caching per `(type, wave)` avoids recomputing for every spawned unit in a wave;
  trivial either way at this scale.
