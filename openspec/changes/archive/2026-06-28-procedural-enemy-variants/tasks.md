## 1. Variant generator

- [x] 1.1 Create `src/systems/EnemyVariant.ts` with an `EnemyVariant` type and pure
      `rgbToHsl` / `hslToRgb` color helpers
- [x] 1.2 Implement `makeEnemyVariant(type, wave)`: seed `mulberry32` from a
      `(type, wave)` hash; derive body color from the type's base color with bounded
      hue jitter, rising saturation, and falling (clamped) lightness as the wave
      grows; derive a contrasting accent color; set `outline` / `stripes` from the seed

## 2. Carry the variant

- [x] 2.1 Add an optional `wave?: number` to `EnemyManager.spawn` and pass the
      current wave from `WaveManager`; when absent, the enemy carries no variant
      (existing one/two-arg `spawn` test callers must keep working)
- [x] 2.2 Compute the variant on spawn (cache per `(type, wave)`) and store it on the
      `Enemy` as `variant`

## 3. Rendering

- [x] 3.1 In `GameScene.drawEnemies`, draw the body with `variant.bodyColor` and
      accents/details with `variant.accentColor` on whatever shape the renderer
      currently draws (do not assume a turret - that comes from
      `directional-enemy-shapes`); honor the `outline` / `stripes` flags; fall back
      to the config base color when there is no variant
- [x] 3.2 Keep shapes and health bars unchanged

## 4. Verification

- [x] 4.1 Unit test: `makeEnemyVariant` is deterministic for a given `(type, wave)`
- [x] 4.2 Unit test: the variant differs between two consecutive waves for the same
      type (e.g. wave 1 vs 2), and saturation is non-decreasing / lightness
      non-increasing across rising waves before clamping
- [x] 4.3 Unit test: color helpers round-trip (`rgbToHsl` then `hslToRgb`) within
      +/-1 per channel; lightness is clamped to its 0.25 floor at high waves
- [x] 4.4 Typecheck, tests, and build pass; per-wave restyling is visible in-game
