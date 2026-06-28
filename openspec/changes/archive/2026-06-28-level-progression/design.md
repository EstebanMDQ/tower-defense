## Context

Today: a single linear `GameMap.path`, an endless wave counter in `WaveManager`
(HP `1 + 0.18*(wave-1)`, count `6 + 2*wave`, composition unlocking by wave), and
`EnemyManager` built with one fixed ground route. Towers/economy persist for the
whole run. This change introduces levels (every 10 waves) and branching paths.
Systems are kept (not rebuilt) across levels - they are reset and re-pointed at the
new map - so existing references stay valid.

## Goals / Non-Goals

**Goals:**
- A clean level loop: new map, tower wipe, lives reset, money carryover, every 10
  waves, with difficulty continuing.
- Branching paths with random per-enemy routing and a guaranteed buildable area.
- Keep `Enemy` unchanged (it still follows a flat waypoint list).

**Non-Goals:**
- Hand-authored maps or a level editor (still procedural).
- Branch choice influenced by anything but chance (no pathfinding/avoidance).
- Per-branch difficulty (all branches lead to the base).

## Decisions

### Branching path generation (`map-generation`)

- **Graph, not a single line.** `GameMap` gains a directed graph from the portal
  tile to the base tile: nodes are tiles, edges point "downstream". A node with two
  outgoing edges is a fork; branches re-merge downstream (or both reach the base).
  Generation starts from the existing downward random walk (the spine), then adds
  `branchesForLevel(level)` detours: pick a spine node, route a short parallel lane
  of tiles that rejoins a node further down. Constraints: in bounds, no illegal
  overlaps, branches stay short.
- **Per-enemy route sampling.** `GameMap.sampleGroundRoute(rng)` walks portal->base,
  choosing a random outgoing edge at each fork, and returns the pixel-space waypoint
  list. Resolving the whole route at spawn is behaviorally identical to choosing at
  each fork (independent random choice) and keeps `Enemy` unchanged.
- **All path tiles** (union of every edge's tiles) form `pathKeys`; rendering draws
  every edge as a lane, and buildable = in-bounds, not a path tile, not portal/base.
- **Buildable guarantee.** After generating, require
  `buildableCount >= MIN_BUILDABLE_FRACTION` (default 0.35) of non-portal/base
  tiles. If not met, re-roll (bounded attempts); fall back to fewer branches, and
  ultimately the linear spine, which always leaves plenty of room.
- **Branches by level:** `branchesForLevel = clamp(level - 1, 0, MAX_BRANCHES)`
  (default MAX_BRANCHES 4). Level 1 is linear (today's behavior); each level adds a
  fork, capped, and further capped by the buildable guarantee.

### Enemies (`enemies`)

- `EnemyManager` is constructed with a `sampleGroundRoute: () => Vec2[]` (and the
  air route) instead of a fixed ground route. Each ground enemy gets a freshly
  sampled route at spawn; planes still fly the straight air route. A
  `setRoutes(sampleGroundRoute, airRoute)` lets the level transition re-point it at
  the new map without rebuilding the manager.

### Levels and difficulty (`levels`, `waves`)

- **Global difficulty index.** `WaveManager` keeps a continuous `globalWave`
  counter. Derived: `level = floor((globalWave-1)/10)+1`,
  `waveInLevel = ((globalWave-1) % 10)+1`. HP scaling and composition use
  `globalWave` (strength/roster keep climbing); enemy **count** and the HUD label use
  `level` / `waveInLevel`.
- **Level transition on wave 10 clear.** When the wave that completes is
  `waveInLevel === 10`, `WaveManager` emits `onLevelComplete(nextLevel)` before the
  build countdown. `GameScene` handles it during that build phase so the player
  preps on the fresh map:
  1. `carry = floor(CARRYOVER_PCT * economy.spentThisLevel())` (default 0.5).
  2. Regenerate the map with `branchesForLevel(nextLevel)`; redraw; re-point
     `EnemyManager.setRoutes(...)` and `TowerManager.setMap(...)`.
  3. `towerManager.clearAll()` (destroy towers, free tiles).
  4. `economy.refillLives()` (reset HP) and `economy.setMoney(carry)`;
     `economy.resetSpend()`.
- **Spend tracking in `Economy`.** `spend()` accumulates `spentThisLevel`;
  `resetSpend()` zeroes it at a level boundary. New helpers: `refillLives()` and
  `setMoney(n)`. Carryover is a percentage of spend (salvage), independent of
  leftover cash.

## Risks / Trade-offs

- **Tunables (first pass):** CARRYOVER_PCT 0.5, MAX_BRANCHES 4, MIN_BUILDABLE 0.35,
  WAVES_PER_LEVEL 10, difficulty continuity via `globalWave`. All in config; expect
  to retune after playtesting (e.g. carryover too generous/stingy, branches eating
  too much ground).
- **`GameMap` shape changes** (graph + sampler replace the single `path`), rippling
  to `GameScene` rendering, `EnemyManager`, and the combat/buildable code that read
  `path`/`pathKeys`. Contained but touches several files - apply branching first,
  verify, then add the level loop.
- **Carryover = % of spend** means a hoarder who never builds carries little; that
  is intended (you salvage what you invested). Flagged in case the feel is wrong.
- Coexists with `perfect-wave-bonus` (also edits `waves`): that change ADDs a
  perfect-clear bonus requirement; this one MODIFIES count/scaling/progression -
  different requirements, so deltas don't collide, but apply order should be noted.
