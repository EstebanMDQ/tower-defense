import { describe, it, expect } from "vitest";
import {
  generateMap,
  isBuildable,
  sampleGroundRoute,
  buildableCount,
  branchesForLevel,
  MIN_BUILDABLE_FRACTION,
  type GameMap,
} from "../src/systems/PathGenerator";
import { GRID, PORTAL_ROW, BASE_ROW, tileToPixel } from "../src/config/grid";

/** Number of forks (nodes with more than one downstream edge). */
function forkCount(map: GameMap): number {
  let n = 0;
  for (const nexts of map.adjacency.values()) if (nexts.length > 1) n++;
  return n;
}

function minBuildable(): number {
  return Math.floor(MIN_BUILDABLE_FRACTION * (GRID.cols * GRID.rows - 2));
}

describe("generateMap", () => {
  it("is deterministic for a given seed and level", () => {
    const a = generateMap(12345, 3);
    const b = generateMap(12345, 3);
    expect(a.spine).toEqual(b.spine);
    expect([...a.pathKeys]).toEqual([...b.pathKeys]);
    expect(a.base).toEqual(b.base);
  });

  it("produces a valid spine across many seeds", () => {
    for (let seed = 0; seed < 150; seed++) {
      const map = generateMap(seed, 1);
      const { spine } = map;
      expect(spine[0]).toEqual(map.portal);
      expect(map.portal.row).toBe(PORTAL_ROW);
      expect(spine[spine.length - 1]).toEqual(map.base);
      expect(map.base.row).toBe(BASE_ROW);

      const seen = new Set<string>();
      for (let i = 0; i < spine.length; i++) {
        const t = spine[i];
        expect(t.col).toBeGreaterThanOrEqual(0);
        expect(t.col).toBeLessThan(GRID.cols);
        expect(t.row).toBeGreaterThanOrEqual(0);
        expect(t.row).toBeLessThan(GRID.rows);
        const k = `${t.col},${t.row}`;
        expect(seen.has(k)).toBe(false);
        seen.add(k);
        if (i > 0) {
          const prev = spine[i - 1];
          expect(Math.abs(t.col - prev.col) + Math.abs(t.row - prev.row)).toBe(1);
        }
      }
    }
  });

  it("is linear at level 1 and adds forks at higher levels", () => {
    // Level 1 has no forks for any seed.
    for (let seed = 0; seed < 50; seed++) {
      expect(forkCount(generateMap(seed, 1))).toBe(0);
    }
    // Forks are non-decreasing with level (same seed), and some map actually forks.
    let everForked = false;
    for (let seed = 0; seed < 50; seed++) {
      const f1 = forkCount(generateMap(seed, 1));
      const f5 = forkCount(generateMap(seed, 5));
      expect(f5).toBeGreaterThanOrEqual(f1);
      if (f5 > 0) everForked = true;
    }
    expect(everForked).toBe(true);
  });

  it("guarantees a minimum buildable area across seeds and levels", () => {
    for (let seed = 0; seed < 100; seed++) {
      for (const level of [1, 3, 6]) {
        expect(buildableCount(generateMap(seed, level))).toBeGreaterThanOrEqual(
          minBuildable(),
        );
      }
    }
  });

  it("branchesForLevel is 0 at level 1 and capped", () => {
    expect(branchesForLevel(1)).toBe(0);
    expect(branchesForLevel(3)).toBe(2);
    expect(branchesForLevel(100)).toBeLessThanOrEqual(4);
  });
});

describe("sampleGroundRoute", () => {
  it("reaches the base via valid waypoints", () => {
    const map = generateMap(7, 4);
    const route = sampleGroundRoute(map);
    const baseCenter = tileToPixel(map.base.col, map.base.row);
    expect(route[0]).toEqual(tileToPixel(map.portal.col, map.portal.row));
    expect(route[route.length - 1]).toEqual(baseCenter);
  });

  it("leaves a gap between the spine and a branch lane", () => {
    let map: GameMap | null = null;
    for (let seed = 0; seed < 200 && !map; seed++) {
      const m = generateMap(seed, 5);
      if (forkCount(m) > 0) map = m;
    }
    expect(map).not.toBeNull();
    const spineSet = new Set(map!.spine.map((t) => `${t.col},${t.row}`));
    const branchTiles = [...map!.pathKeys].filter((k) => !spineSet.has(k));
    expect(branchTiles.length).toBeGreaterThan(0);
    // At least one branch tile is not 4-adjacent to any spine tile (a true gap,
    // not a detour pressed against the spine).
    const hasGap = branchTiles.some((k) => {
      const [c, r] = k.split(",").map(Number);
      return ![
        [c + 1, r],
        [c - 1, r],
        [c, r + 1],
        [c, r - 1],
      ].some(([nc, nr]) => spineSet.has(`${nc},${nr}`));
    });
    expect(hasGap).toBe(true);
  });

  it("varies across forks", () => {
    // Find a forked map.
    let map: GameMap | null = null;
    for (let seed = 0; seed < 200 && !map; seed++) {
      const m = generateMap(seed, 5);
      if (forkCount(m) > 0) map = m;
    }
    expect(map).not.toBeNull();
    const routes = new Set<string>();
    for (let i = 0; i < 50; i++) {
      routes.add(JSON.stringify(sampleGroundRoute(map!)));
    }
    expect(routes.size).toBeGreaterThan(1);
  });
});

describe("isBuildable", () => {
  const map = generateMap(42, 3);

  it("rejects lane, portal, and base tiles", () => {
    for (const k of map.pathKeys) {
      const [c, r] = k.split(",").map(Number);
      expect(isBuildable(map, c, r)).toBe(false);
    }
    expect(isBuildable(map, map.portal.col, map.portal.row)).toBe(false);
    expect(isBuildable(map, map.base.col, map.base.row)).toBe(false);
  });

  it("rejects out-of-bounds tiles", () => {
    expect(isBuildable(map, -1, 0)).toBe(false);
    expect(isBuildable(map, GRID.cols, 0)).toBe(false);
    expect(isBuildable(map, 0, GRID.rows)).toBe(false);
  });

  it("accepts an empty in-bounds tile", () => {
    let found = false;
    for (let row = 0; row < GRID.rows && !found; row++) {
      for (let col = 0; col < GRID.cols && !found; col++) {
        if (isBuildable(map, col, row)) found = true;
      }
    }
    expect(found).toBe(true);
  });
});
