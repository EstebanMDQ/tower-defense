## ADDED Requirements

### Requirement: Grid play field

The game SHALL produce a tile grid play field using the configured grid dimensions,
within which all map elements are positioned.

#### Scenario: Field matches configuration

- **WHEN** the map is generated
- **THEN** it spans the configured number of columns and rows from the grid
  configuration

### Requirement: Base and Portal placement

The map SHALL place a Portal as a single tile on the top row (the enemy spawn point
and the start of the path) and a Base as a single tile on the bottom row (the
defender's goal and the end of the path). The ground path's endpoints and the air
route's endpoints SHALL be these same two tiles.

#### Scenario: Landmarks positioned

- **WHEN** the map is generated
- **THEN** exactly one Portal tile exists on the top row and exactly one Base tile
  exists on the bottom row, both rendered as distinct markers, and the path starts
  at the Portal tile and ends at the Base tile

#### Scenario: Non-landmark top/bottom tiles are buildable

- **WHEN** a top-row or bottom-row tile is not the Portal or Base and is not on the
  path
- **THEN** that tile is buildable (only the single Portal and Base tiles are
  reserved, not the entire rows)

### Requirement: Seeded ground path generation

The map SHALL generate a single ground path as an ordered list of waypoint tile
centers from the Portal to the Base, determined by a numeric seed.

#### Scenario: Deterministic from seed

- **WHEN** the path is generated twice with the same seed
- **THEN** both generations produce the identical ordered list of waypoints

#### Scenario: Path validity

- **WHEN** a path is generated
- **THEN** it starts at the Portal tile, ends at the Base tile, stays within the
  grid bounds, does not overlap or cross itself, and has a length of at least the
  configured minimum (at least 1.5x the straight-line Portal-to-Base tile distance)

#### Scenario: Generation always terminates

- **WHEN** repeated random attempts fail to satisfy the constraints
- **THEN** generation falls back to a guaranteed-valid path rather than looping
  indefinitely

### Requirement: Air route

The map SHALL provide a straight-line air route from the Portal to the Base,
independent of the ground path, for use by flying enemies.

#### Scenario: Straight air route

- **WHEN** the air route is requested
- **THEN** it is a direct line from the Portal tile center to the Base tile center
  (the same tiles used by the ground path endpoints) that does not depend on the
  ground path

### Requirement: Buildable tile determination

The map SHALL expose which tiles are buildable: all in-bounds tiles that are not
part of the path and not occupied by the Base or Portal.

#### Scenario: Path tiles are not buildable

- **WHEN** a tile lies on the generated path, or is the Base or Portal
- **THEN** that tile is reported as not buildable

#### Scenario: Empty tiles are buildable

- **WHEN** a tile is in bounds and is not path, Base, or Portal
- **THEN** that tile is reported as buildable
