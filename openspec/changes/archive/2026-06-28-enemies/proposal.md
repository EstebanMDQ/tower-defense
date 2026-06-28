## Why

Enemies are what the player defends against. The game needs the four enemy types
from the GDD, each moving correctly (ground units along the path, planes flying
over it), taking damage, dying for a reward, and costing lives when they reach the
base. Towers and waves both build directly on this.

## What Changes

- Define the four enemy types with base stats from the GDD: Soldier, Buggy, Tank
  (ground) and Plane (air) - HP, speed, money reward, lives cost, and target class.
- Implement ground movement: enemies follow the generated path waypoint-to-waypoint
  from Portal to Base.
- Implement air movement: planes ignore the path and fly the straight air route
  from Portal to Base.
- Implement damage and death: enemies lose HP when hit; at zero HP they die and
  grant their money reward.
- Implement reaching the base: an enemy that arrives at the Base applies its lives
  cost and is removed.
- Classify each enemy as ground or air so towers can filter valid targets.
- Render enemies as procedural shapes (e.g. colored circles), distinguishable by
  type.

Enemy HP is scaled per wave by a multiplier supplied by the wave system; this
change applies a provided multiplier but does not own wave logic.

## Capabilities

### New Capabilities
- `enemies`: the four-enemy roster with path-following and flying movement, damage
  and death (with reward), base-arrival (with lives cost), and ground/air
  classification.

### Modified Capabilities
<!-- none -->

## Impact

- New files: `src/entities/Enemy.ts`, `src/config/enemies.ts`.
- Depends on `map-generation` (path, air route, Base/Portal) and `economy`
  (rewards on death, lives on arrival). Consumed by `towers-and-combat` (targets)
  and `waves-and-progression` (spawning, HP scaling).
