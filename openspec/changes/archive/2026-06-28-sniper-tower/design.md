## Context

Builds on the existing `towers` capability (config-driven `TowerSpec`, the
`TowerManager` firing loop, `Projectile` with single-target and Mortar-splash
modes, the `TargetingSystem`, 3-tier upgrades, and selling) and the `hud` build
palette. The Sniper introduces a third attack mode: a piercing line.

## Goals / Non-Goals

**Goals:**
- A distinct, high-investment tower that punishes lining up with straight path
  segments by hitting every enemy along a line.
- Reuse placement, targeting, upgrades, and selling without change.

**Non-Goals:**
- Aimable/manual targeting (the Sniper auto-targets like other towers).
- Damage falloff along the line (full damage to every enemy hit, v1).
- A new resource or charge mechanic beyond the normal cooldown.

## Decisions

- **Stats (first pass, in config):** cost 250, damage 120, range 8 tiles (covers
  most of the 9x16 field), fire rate 0.2/s (one shot every 5s), targets both
  ground and air. The most expensive and slowest tower, with the highest single
  hit.
- **Attack mode field.** Add an `attack` discriminator to `TowerSpec`
  (`"single" | "splash" | "pierce"`), defaulting to `"single"`. Mortar is set to
  `"splash"` (replacing the implicit `splashRadius > 0` check that
  `TowerManager.fire` uses today), Sniper to `"pierce"`. `TowerManager.fire` becomes
  a switch on `attack`. (This refactor is shared with `mortar-blast-animation` -
  see Risks.)
- **`fire` needs the enemy list.** Pierce damage is resolved at fire time against
  all enemies in the line, but today `TowerManager.fire(tower, target)` does not
  receive the enemy array (only `update` has it). Change `fire` to also take
  `enemies` (it is already in scope in `update` where `fire` is called), so the
  pierce case can damage everyone in the line. Single/splash cases ignore it.
- **Targeting picks the aim point.** Reuse `acquireTarget` to choose the primary
  target (closest-to-base eligible enemy in range). The shot direction is the unit
  vector from the tower to that target.
- **Pierce is hitscan (no travelling projectile).** On fire, build a ray from the
  tower along the aim direction out to `rangePx`. Every eligible enemy whose
  perpendicular distance to that ray is `<= pierceWidthPx` (a configured band) AND
  whose projection onto the ray is within `[0, rangePx]` takes full damage,
  immediately. Damage is applied at fire time, so - unlike the homing single-target
  `Projectile` - a primary target that would die the same tick still takes its hit,
  and there is no "target removed before impact" cancellation. The Sniper does
  **not** create a `Projectile`; `Projectile.ts` is unchanged by this change.
- **Beam record for rendering.** Since there is no projectile, add a transient
  beam record so the scene can draw the shot: `TowerManager` keeps a `beams` list of
  `{ x1, y1, x2, y2, age, duration }` (endpoint = tower + dir * rangePx). On fire
  (pierce case) push one beam; `TowerManager.update` advances `age` by `dt` and drops
  expired beams; expose `getBeams()`. `GameScene` draws each beam as a fading line.
  Visual only.
- **Upgrades/selling unchanged.** Tier multipliers apply to damage/range/fire rate;
  invested tracking and 50% sell refund work as-is. `projectileSpeed` is unused by
  the Sniper (hitscan) - it is set to a placeholder and ignored; consider making the
  projectile fields optional later.

## Risks / Trade-offs

- A long-range piercing line is strong against single-file ground waves; the very
  high cost and 5s cooldown are the balancing levers. Numbers are a first pass and
  live in config for tuning.
- **Strong against planes by construction.** Planes fly a straight Portal->Base
  line, so the whole plane column is collinear - one pierce shot can hit every plane
  for full damage. Combined with both-class targeting, the Sniper is a harder
  anti-air counter than "expensive + slow" alone implies. Range 8 (tier-3 ~9.6) is
  near board-wide, so placement matters less than aim direction. Acceptable for a
  first pass given the cost/cooldown; if it proves oppressive, the levers are
  ground-only targeting, damage falloff along the line, a per-shot hit cap, or a
  shorter range. Flagged in the GDD as tunable.
- **Shared `fire`/attack-mode refactor with `mortar-blast-animation`.** Both change
  `TowerManager.fire` and how splash is detected. Land the `attack`-mode refactor
  here first; `mortar-blast-animation` then keys its blast off `attack === "splash"`
  (in the `splash` case) rather than the old `splashRadius > 0` check. The pierce
  case never calls `Projectile.impact`, so no blast fires for Sniper shots.
- Band width is a feel parameter: too wide makes it a screen-clear, too thin makes
  it miss diagonally-moving enemies. Start at `pierceWidth` 0.4 tile (config) and tune.
