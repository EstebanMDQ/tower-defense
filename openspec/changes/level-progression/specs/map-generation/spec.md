## MODIFIED Requirements

### Requirement: Seeded ground path generation

The map SHALL generate a ground path as a directed graph of tile-center waypoints
from the Portal to the Base, determined by a numeric seed. The graph MAY contain
forks (a node with more than one downstream edge) that re-merge or independently
reach the Base; the number of forks SHALL scale with the level (more bifurcations at
higher levels, up to a configured maximum). With zero forks the graph is a single
linear path.

#### Scenario: Deterministic from seed

- **WHEN** the path graph is generated twice with the same seed and level
- **THEN** both generations produce the identical graph

#### Scenario: Path validity

- **WHEN** a path graph is generated
- **THEN** every route from the Portal reaches the Base, all tiles are within the
  grid bounds, and each individual lane meets the configured minimum length

#### Scenario: More forks at higher levels

- **WHEN** a map is generated for a higher level
- **THEN** it has at least as many forks as a lower level, up to the configured
  maximum (and level 1 is a single linear path)

#### Scenario: Generation always terminates

- **WHEN** repeated random attempts fail to satisfy the constraints
- **THEN** generation falls back to fewer forks, ultimately a single guaranteed-valid
  linear path, rather than looping indefinitely

### Requirement: Buildable tile determination

The map SHALL expose which tiles are buildable: all in-bounds tiles that are not on
any path lane and not occupied by the Base or Portal. Generation SHALL guarantee a
minimum buildable area (at least a configured fraction of the non-Portal/Base tiles)
so there is always room to place towers.

#### Scenario: Path tiles are not buildable

- **WHEN** a tile lies on any path lane, or is the Base or Portal
- **THEN** that tile is reported as not buildable

#### Scenario: Empty tiles are buildable

- **WHEN** a tile is in bounds and is not on a path lane, Base, or Portal
- **THEN** that tile is reported as buildable

#### Scenario: Minimum buildable area guaranteed

- **WHEN** a map is generated
- **THEN** the number of buildable tiles is at least the configured minimum fraction
  of the non-Portal/Base tiles

## ADDED Requirements

### Requirement: Per-enemy route sampling

The map SHALL provide a way to sample a complete ground route from the Portal to the
Base, choosing randomly at each fork, so that each ground enemy can travel its own
route through the branching path.

#### Scenario: Sampled route reaches the base

- **WHEN** a ground route is sampled
- **THEN** it is an ordered list of waypoints from the Portal to the Base following
  valid graph edges, choosing one branch at each fork

#### Scenario: Routes vary across forks

- **WHEN** many ground routes are sampled on a map that has at least one fork
- **THEN** more than one distinct route occurs (enemies do not all take the same
  branch)
