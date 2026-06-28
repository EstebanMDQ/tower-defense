## Context

The Mortar fires a fixed-impact-point projectile (`Projectile` with `impact` +
`splashRadiusPx`) that, on arrival, damages every eligible enemy within the splash
radius (`Projectile.impact`). Damage is applied at the moment of impact; there is
currently no visual. Effects need an owner that advances them over time; the
`TowerManager` already runs each frame and owns projectiles, so it is the natural
home.

## Goals / Non-Goals

**Goals:**
- A readable, transient blast at the exact impact point, sized to the actual splash
  radius (so it stays correct if the splash radius is ever tuned). Note: splash
  radius is not currently tier-scaled (`Tower.splashRadiusPx` has no upgrade
  multiplier), so the blast does not change with upgrades today - only if
  `splashRadius` is later made tier-dependent.
- No change to splash damage behavior.
- Keep the effect-tracking logic testable (no Phaser dependency).

**Non-Goals:**
- Particle systems, sprites, or sound.
- Effects for non-splash hits (single-target / pierce) - out of scope here.
- Camera shake or other juice (could follow later).

## Decisions

- **Impact hook on the projectile.** Add an optional `onImpact(x, y, splashRadiusPx)`
  callback to `ProjectileOptions`, invoked inside `impact()` after damage is applied,
  on the **splash branch** (described in attack-mode-agnostic terms, not the literal
  `splashRadiusPx > 0` check, since `sniper-tower` may refactor splash detection into
  an `attack === "splash"` switch). It fires regardless of how many enemies were hit,
  so a miss on empty ground still flashes. This avoids the projectile knowing about
  the scene or effect system.
- **Sequencing with `sniper-tower`.** If `sniper-tower` lands first, attach
  `onImpact` in the `splash` case of `fire`'s switch and gate the `Projectile.impact`
  callback on the splash branch. The Sniper's pierce is hitscan and never calls
  `Projectile.impact`, so no blast fires for pierce - matching this change's
  non-goal. The logic does not conflict; only the splash-detection wording must align.
- **TowerManager owns blast effects.** When firing a splash projectile, the manager
  passes an `onImpact` that pushes a `Blast { x, y, radiusPx, age, duration }` onto
  an `effects` list. `TowerManager.update` advances `age` by `dt` and drops effects
  whose `age >= duration`. Exposed via `getBlasts()`.
- **Duration / shape.** `duration` ~0.35s. Rendered as an expanding ring: radius
  interpolates from ~0.2x to 1.0x `radiusPx` over its life, with alpha fading from
  ~0.7 to 0, plus a soft filled flash at the start. This reads as an explosion
  while clearly tracing the splash area at its peak.
- **Rendering in GameScene.** Draw blasts on the existing dynamic graphics layer
  each frame from `towerManager.getBlasts()`, using `age / duration` to drive radius
  and alpha. No new scene objects to manage.

## Risks / Trade-offs

- Many simultaneous Mortar impacts mean many short-lived effects; they are plain
  data and expire quickly, so cost is negligible at this scale.
- Tying the effect to `splashRadiusPx` (not a fixed size) keeps it honest if the
  radius changes, at the cost of the visual being small (1 tile) - acceptable and
  accurate.
- **Duplicated effect-tracking with `enemy-death-explosions`.** That change adds a
  near-identical transient-effect list (particles, advance-by-dt, drop-on-expire) to
  `EnemyManager`, rendered on the same `dynamicGfx` layer. This change adds a
  `{x,y,radiusPx,age,duration}` blast list to `TowerManager`. Intended convergence: a
  later refactor moves both into a single `EffectsManager` (or a `GameScene`-owned
  effects list). To make that a move rather than a rewrite, keep the blast model's
  `age`/`duration` fade fields aligned with the particle model's.
- A blast pushed during the projectile-update loop is advanced by `dt` in the same
  `update`, so it starts at `age = dt` rather than 0 - negligible at ~0.35s, or
  advance existing effects before resolving impacts to start at 0.
