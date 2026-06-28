## 1. Seeded RNG

- [x] 1.1 Add a small deterministic PRNG (e.g. mulberry32) seeded by a number
- [x] 1.2 Expose seed selection at level start (default or random seed)

## 2. Path generation

- [x] 2.1 Implement `PathGenerator` guided random walk Portal -> Base producing an
      ordered list of tile centers
- [x] 2.2 Enforce constraints: in bounds, no self-overlap, minimum length
- [x] 2.3 Add bounded re-roll with a guaranteed-valid fallback path
- [x] 2.4 Compute the straight air route (Portal center -> Base center)

## 3. Buildable tiles

- [x] 3.1 Compute the buildable-tile set (all tiles minus path, Base, Portal)
- [x] 3.2 Expose a `isBuildable(tile)` query for the placement system

## 4. Rendering

- [x] 4.1 Render grid tiles, the path polyline, and Base/Portal markers as shapes
      in `GameScene`

## 5. Verification

- [x] 5.1 Same seed reproduces the same path (unit test)
- [x] 5.2 Generated paths always satisfy constraints over many seeds (unit test)
- [x] 5.3 Path, Base, and Portal tiles report as not buildable
