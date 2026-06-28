import { describe, it, expect } from "vitest";
import { generateMap, isBuildable } from "../src/systems/PathGenerator";
import { GRID, PORTAL_ROW, BASE_ROW } from "../src/config/grid";

describe("generateMap", () => {
  it("is deterministic for a given seed", () => {
    const a = generateMap(12345);
    const b = generateMap(12345);
    expect(a.path).toEqual(b.path);
    expect(a.portal).toEqual(b.portal);
    expect(a.base).toEqual(b.base);
  });

  it("produces different paths for different seeds (usually)", () => {
    const a = generateMap(1);
    const b = generateMap(99999);
    // Not a hard guarantee, but these two seeds should differ.
    expect(a.path).not.toEqual(b.path);
  });

  it("produces valid paths across many seeds", () => {
    for (let seed = 0; seed < 200; seed++) {
      const map = generateMap(seed);
      const { path } = map;

      // Starts at the portal on the top row, ends at the base on the bottom row.
      expect(path[0]).toEqual(map.portal);
      expect(map.portal.row).toBe(PORTAL_ROW);
      expect(path[path.length - 1]).toEqual(map.base);
      expect(map.base.row).toBe(BASE_ROW);

      const seen = new Set<string>();
      for (let i = 0; i < path.length; i++) {
        const t = path[i];
        // In bounds.
        expect(t.col).toBeGreaterThanOrEqual(0);
        expect(t.col).toBeLessThan(GRID.cols);
        expect(t.row).toBeGreaterThanOrEqual(0);
        expect(t.row).toBeLessThan(GRID.rows);
        // No self-overlap.
        const k = `${t.col},${t.row}`;
        expect(seen.has(k)).toBe(false);
        seen.add(k);
        // 4-connected adjacency between consecutive waypoints.
        if (i > 0) {
          const prev = path[i - 1];
          const manhattan =
            Math.abs(t.col - prev.col) + Math.abs(t.row - prev.row);
          expect(manhattan).toBe(1);
        }
      }

      // Minimum length: at least the vertical distance.
      expect(path.length - 1).toBeGreaterThanOrEqual(BASE_ROW);
    }
  });
});

describe("isBuildable", () => {
  const map = generateMap(42);

  it("rejects path, portal, and base tiles", () => {
    for (const t of map.path) {
      expect(isBuildable(map, t.col, t.row)).toBe(false);
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
    // Find at least one buildable tile and assert it is reported as such.
    let found = false;
    for (let row = 0; row < GRID.rows && !found; row++) {
      for (let col = 0; col < GRID.cols && !found; col++) {
        if (isBuildable(map, col, row)) found = true;
      }
    }
    expect(found).toBe(true);
  });
});
