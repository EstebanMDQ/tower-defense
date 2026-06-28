## 1. Impact hook

- [x] 1.1 Add optional `onImpact(x, y, splashRadiusPx)` to `ProjectileOptions`
- [x] 1.2 Call it inside `Projectile.impact()` after splash damage is applied (only
      when a splash radius is set)

## 2. Blast effects

- [x] 2.1 Add a `Blast { x, y, radiusPx, age, duration }` model and an `effects`
      list to `TowerManager`
- [x] 2.2 When firing a splash projectile, pass an `onImpact` that records a Blast
- [x] 2.3 In `TowerManager.update`, advance each Blast's `age` by `dt` and remove it
      when `age >= duration`; expose `getBlasts()`

## 3. Rendering

- [x] 3.1 In `GameScene`, draw each blast on the dynamic layer as an expanding ring
      (radius from ~0.2x to 1.0x `radiusPx`) with alpha fading over `age / duration`,
      plus a brief filled flash

## 4. Verification

- [x] 4.1 Unit test: a Mortar impact records one Blast at the impact point with the
      Mortar's splash radius
- [x] 4.2 Unit test: a Blast is removed after its duration elapses; non-splash
      projectiles create no Blast
- [x] 4.3 Unit test: splash damage is unchanged (existing splash tests still pass)
- [x] 4.4 Typecheck, tests, and build pass; the blast is visible in the running game
