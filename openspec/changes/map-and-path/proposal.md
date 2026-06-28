## Why

Every other gameplay system needs a play field to act on: enemies need a path to
walk, towers need tiles to occupy, and the wave system needs a portal to spawn
from and a base to defend. This change builds the procedural map and the ground
path that the rest of the game is positioned against.

## What Changes

- Generate a tile grid play field with a `Base` on the bottom row (defender goal)
  and a `Portal` on the top row (enemy spawn).
- Generate a single ground `path` deterministically from a numeric seed: an
  ordered list of waypoint tile centers from Portal to Base that snakes left/right
  under validity constraints (in bounds, no self-overlap, minimum length).
- Define the straight-line air route used by flying enemies (Portal -> Base),
  independent of the ground path.
- Determine which tiles are `buildable` (not on the path, not Base/Portal, within
  bounds) for later tower placement.
- Render the map procedurally: tiles, the path polyline, and the Base/Portal
  markers using simple shapes.

## Capabilities

### New Capabilities
- `map-generation`: deterministic procedural play field - grid, Base, Portal,
  seeded ground path, air route, and buildable-tile determination.

### Modified Capabilities
<!-- none -->

## Impact

- New files: `src/systems/PathGenerator.ts`, map rendering in `GameScene`,
  buildable-tile lookup helper.
- Depends on `game-bootstrap` (grid config, tile/pixel conversion, scenes).
