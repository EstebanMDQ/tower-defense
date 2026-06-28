## Context

Combines `map-generation` (buildable/occupancy), `economy` (pay to build/upgrade),
and `enemies` (targets, target class, damage). Stats and upgrade multipliers come
from the GDD towers and upgrades tables.

## Goals / Non-Goals

**Goals:**
- Data-driven tower stats and upgrade multipliers.
- A reusable targeting system that filters by target class and picks the
  closest-to-base enemy in range.
- Clear placement validation (buildable, unoccupied, affordable).

**Non-Goals:**
- The build palette / upgrade UI presentation (owned by `game-ui-and-states`); this
  change exposes the operations the UI calls.
- Selling/refunding towers (out of scope for v1).

## Decisions

- **Data-driven config.** `towers.ts` holds per-tower `TowerSpec` (cost, damage,
  range in tiles, fire rate per second, target class, optional splash radius).
  `upgrades.ts` holds the tier multipliers (L2 x1.4 dmg / x1.1 range / x1.1 rate;
  L3 x2.0 / x1.2 / x1.2) and the cost ratios (L2 = 75%, L3 = 125% of build cost).
- **Effective stats = base x level multipliers.** A tower computes its current
  damage/range/fire-rate from its base spec and current tier, so balancing stays in
  config.
- **Targeting system is shared and stateless.** Given a tower (position, range,
  target class) and the live enemy list, it returns the eligible enemy furthest
  along its route (closest to the Base) within range. Machine Gun and Mortar pass
  `ground`; Missiles pass `air`.
- **Firing cadence by accumulator.** Each tower tracks time since last shot and
  fires when the interval (1 / fire rate) elapses and a target exists.
- **Projectiles.** A `Projectile` travels toward its target and applies damage on
  arrival. Single-target projectiles hit one enemy; the Mortar's projectile applies
  its damage to every enemy within the splash radius of the impact point.
- **Placement validation order:** tile is buildable (map) -> tile not already
  occupied by a tower -> player can afford -> deduct cost -> place. Any failure
  aborts with no state change.
- **Upgrades:** validate tower is below max tier and player can afford the tier
  cost, then deduct and increment tier.

## Risks / Trade-offs

- "Closest to base" requires a per-enemy progress metric (distance remaining along
  route). Ground enemies use remaining path distance; planes use remaining air
  distance - the targeting system reads a normalized progress value from the enemy.
- Splash uses a simple radius test in tile space; fine for v1, may need tuning so
  Mortar feels good against grouped enemies.
- Missiles being air-only and MG/Mortar ground-only is a deliberate constraint;
  flagged in the GDD as tunable after playtesting.
