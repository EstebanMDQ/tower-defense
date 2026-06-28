## Stage A - Branching paths

## 1. Branching path generator

- [x] 1.1 Extend `PathGenerator`/`GameMap` to a directed graph (nodes = tiles, edges
      downstream) from Portal to Base; generate the linear spine, then add
      `branchesForLevel(level)` short detours that re-merge or reach the Base
- [x] 1.2 Add config: `MAX_BRANCHES` (4), `MIN_BUILDABLE_FRACTION` (0.35), and
      `branchesForLevel(level) = clamp(level - 1, 0, MAX_BRANCHES)`
- [x] 1.3 Keep generation deterministic for a given seed + level; bounded re-roll
      that falls back to fewer forks and ultimately the linear spine
- [x] 1.4 Enforce the minimum buildable area; expose `pathKeys` (all lane tiles),
      `edges` (for rendering), and `isBuildable`
- [x] 1.5 Add `sampleGroundRoute(rng)` returning a pixel-space route, choosing a
      random branch at each fork

## 2. Enemies on branching paths

- [x] 2.1 Construct `EnemyManager` with a `sampleGroundRoute` callback (+ air route);
      sample a fresh route per ground enemy at spawn; planes unchanged
- [x] 2.2 Add `setRoutes(sampleGroundRoute, airRoute)` so the manager can be
      re-pointed at a new map without rebuilding

## 3. Rendering

- [x] 3.1 In `GameScene`, draw all lane tiles and every edge (so forks are visible);
      Portal/Base markers unchanged

## 4. Stage A verification

- [x] 4.1 Unit test: same seed + level reproduces the same graph; higher level has
      >= forks; level 1 is linear
- [x] 4.2 Unit test: every sampled route reaches the Base via valid edges; on a
      forked map, multiple distinct routes occur
- [x] 4.3 Unit test: buildable count >= the minimum fraction across many seeds
- [x] 4.4 Typecheck, tests, build pass; forks visible and enemies diverge in-game

## Stage B - Levels and progression

## 5. Difficulty and level numbering

- [ ] 5.1 In `WaveManager`, keep a continuous `globalWave`; derive `level` and
      `waveInLevel`; count uses `waveInLevel`, HP scaling and composition use
      `globalWave`; expose `getLevel()` / `getWaveInLevel()`
- [ ] 5.2 Emit `onLevelComplete(nextLevel)` when the cleared wave is `waveInLevel 10`

## 6. Economy support

- [ ] 6.1 In `Economy`, accumulate `spentThisLevel` on `spend()`; add `resetSpend()`,
      `spentThisLevel()`, `refillLives()`, and `setMoney(n)`

## 7. Level transition (GameScene)

- [ ] 7.1 On `onLevelComplete`, during the build phase: compute
      `carry = floor(CARRYOVER_PCT * economy.spentThisLevel())`
- [ ] 7.2 Regenerate the map with the new level's branch count; redraw; re-point
      `EnemyManager.setRoutes(...)` and `TowerManager.setMap(...)`
- [ ] 7.3 `towerManager.clearAll()`; `economy.refillLives()`;
      `economy.setMoney(carry)`; `economy.resetSpend()`
- [ ] 7.4 Add config `CARRYOVER_PCT` (0.5) and `WAVES_PER_LEVEL` (10)
- [ ] 7.5 HUD shows `Level N` and the wave within the level

## 8. Stage B verification

- [ ] 8.1 Unit test: `globalWave` math (level/waveInLevel boundaries); HP/composition
      use global index, count uses waveInLevel
- [ ] 8.2 Unit test: a level transition resets lives, sets money to the carryover
      percentage of spend, resets spend, and clears towers
- [ ] 8.3 Typecheck, tests, build pass; full loop playable (10 waves -> new branched
      map, towers gone, HP full, salvage money, tougher enemies)
