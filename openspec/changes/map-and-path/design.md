## Context

Builds on `game-bootstrap`'s grid config (9 cols x 16 rows) and tile/pixel
helpers. The GDD requires a fixed-per-level path generated from a seed, with ground
units following it and planes ignoring it.

## Goals / Non-Goals

**Goals:**
- Deterministic path generation: same seed -> same path (reproducible, testable).
- Paths that are valid and non-trivial (not a straight vertical line).
- A clear buildable-tile set for tower placement.

**Non-Goals:**
- Multiple simultaneous paths or branching paths (single path in v1).
- Multiple maps / map selection.
- Enemy or tower behavior (separate changes) - this change only produces the field
  and the routes.

## Decisions

- **Seeded RNG.** A small deterministic PRNG (e.g. mulberry32) seeded by a number,
  so generation is reproducible and unit-testable. The seed is an input; a default
  or random seed can be chosen at level start.
- **Generation algorithm (guided random walk).** Start at the Portal tile on the
  top row. Walk downward row by row toward the Base, and at each step optionally
  jog horizontally by one or more tiles before descending. Constraints enforced:
  stay within columns, never revisit a tile (no self-overlap/crossing), and reach
  a minimum total length; if a generated path violates a constraint, reject and
  re-roll from the seed sequence. The result is an ordered list of tile centers.
- **Air route is implicit.** Flying enemies use a straight segment from the Portal
  center to the Base center - computed, not stored as tiles.
- **Buildable set = all tiles minus {path tiles, Base, Portal}.** Computed once
  after path generation and queried by the tower placement system later.
- **Rendering is procedural shapes:** filled tiles for the grid, a thick polyline
  for the path, distinct markers for Base and Portal. No assets.

## Risks / Trade-offs

- A naive random walk can dead-end or produce ugly paths; the reject-and-re-roll
  loop needs a bounded attempt count with a safe fallback (e.g. a simple boustrophedon
  S-path) to guarantee termination.
- Minimum-length and no-overlap constraints can conflict on a small grid; tuning
  the grid size vs constraints may be needed (grid is configurable from bootstrap).
