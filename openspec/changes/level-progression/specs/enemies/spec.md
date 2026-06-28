## MODIFIED Requirements

### Requirement: Ground enemies follow the path

Ground enemies (Soldier, Buggy, Tank) SHALL move along a route sampled through the
branching path from the Portal toward the Base, advancing at their configured speed
in tiles per second. Each ground enemy's route is chosen when it spawns (a random
branch at each fork), so different enemies may take different lanes.

#### Scenario: Path traversal

- **WHEN** a ground enemy updates over time
- **THEN** it advances along its sampled route's waypoints toward the Base at its
  configured speed without skipping or overshooting waypoints

#### Scenario: Independent routing

- **WHEN** ground enemies spawn on a map with a fork
- **THEN** each follows its own sampled route, so they may diverge at the fork
