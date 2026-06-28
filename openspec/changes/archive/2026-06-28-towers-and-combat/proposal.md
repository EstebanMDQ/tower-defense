## Why

Towers are the player's only means of stopping enemies - this is the core of the
tower defense loop. The game needs the three towers from the GDD, the ability to
place them by spending money, targeting and firing at enemies, the air/ground
restrictions that make tower choice meaningful, splash damage for the Mortar, and
the upgrade system that lets players invest in stronger towers.

## What Changes

- Define the three towers with base stats: Machine Gun, Mortar (ground only) and
  Missiles/SAM (air only) - cost, damage, range, fire rate, target class, and the
  Mortar's splash radius.
- Place towers on buildable tiles by paying their cost through the economy; reject
  placement on non-buildable or occupied tiles, or when unaffordable.
- Target enemies: each tower fires at the enemy closest to the Base within its
  range, restricted to enemies of a target class it can hit.
- Fire projectiles at the configured rate that deal the tower's damage on hit; the
  Mortar additionally damages all enemies within its splash radius of the impact.
- Enforce target restrictions: Machine Gun and Mortar hit ground only; Missiles hit
  air only.
- Upgrade towers through three tiers, each applying damage/range/fire-rate
  multipliers for an escalating cost.
- Render towers and projectiles as procedural shapes; show range when selecting a
  tile to build.

## Capabilities

### New Capabilities
- `towers`: the three-tower roster, placement-with-payment, range/target-class
  targeting, firing and projectiles, Mortar splash, air/ground restrictions, and
  three-tier upgrades.

### Modified Capabilities
<!-- none -->

## Impact

- New files: `src/entities/Tower.ts`, `src/entities/Projectile.ts`,
  `src/systems/TargetingSystem.ts`, `src/config/towers.ts`, `src/config/upgrades.ts`.
- Depends on `map-generation` (buildable tiles), `economy` (costs), and `enemies`
  (targets, damage, target class). Surfaced to the player by `game-ui-and-states`
  (build palette, upgrade UI).
