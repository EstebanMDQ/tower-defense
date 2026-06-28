import {
  GRID,
  PORTAL_ROW,
  BASE_ROW,
  inBounds,
  tileToPixel,
  tileDistance,
} from "../config/grid";
import type { TileCoord, Vec2 } from "../types";
import { mulberry32 } from "./Rng";

export interface GameMap {
  seed: number;
  level: number;
  /** Single spawn tile on the top row; start of the path. */
  portal: TileCoord;
  /** Single goal tile on the bottom row; end of the path. */
  base: TileCoord;
  /** The main lane (the random-walk spine). */
  spine: TileCoord[];
  /** All lane tiles (spine + branch tiles). */
  pathKeys: Set<string>;
  /** Directed edges (from -> to) for rendering all lanes. */
  edges: Array<[TileCoord, TileCoord]>;
  /** Downstream adjacency for route sampling: tile key -> next tiles. */
  adjacency: Map<string, TileCoord[]>;
  /** Straight-line air route between portal and base tile centers. */
  airRoute: { from: Vec2; to: Vec2 };
}

const MIN_LENGTH_FACTOR = 1.5;
const MAX_ATTEMPTS = 60;
/** Maximum branch forks added to a map. */
export const MAX_BRANCHES = 4;
/** At least this fraction of the non-portal/base tiles must stay buildable. */
export const MIN_BUILDABLE_FRACTION = 0.35;

/** Number of branch forks for a level: linear at level 1, +1 per level, capped. */
export function branchesForLevel(level: number): number {
  return Math.max(0, Math.min(level - 1, MAX_BRANCHES));
}

function key(col: number, row: number): string {
  return `${col},${row}`;
}

function tkey(t: TileCoord): string {
  return key(t.col, t.row);
}

/** A tile is buildable if it is in bounds and not a lane tile, portal, or base. */
export function isBuildable(map: GameMap, col: number, row: number): boolean {
  if (!inBounds(col, row)) return false;
  if (col === map.portal.col && row === map.portal.row) return false;
  if (col === map.base.col && row === map.base.row) return false;
  return !map.pathKeys.has(key(col, row));
}

/** Count buildable tiles on a map. */
export function buildableCount(map: GameMap): number {
  let n = 0;
  for (let r = 0; r < GRID.rows; r++) {
    for (let c = 0; c < GRID.cols; c++) if (isBuildable(map, c, r)) n++;
  }
  return n;
}

/**
 * Generate a branching play field deterministically from a seed and level. A
 * downward random-walk spine is generated (re-rolled until it is valid and leaves
 * enough buildable room, else a short straight fallback), then `branchesForLevel`
 * diamond detours are added at path corners as forks that re-merge downstream.
 */
export function generateMap(seed: number, level = 1): GameMap {
  const rng = mulberry32(seed);
  const portalCol = Math.floor(rng() * GRID.cols);
  const portal: TileCoord = { col: portalCol, row: PORTAL_ROW };

  const minBuildable = Math.floor(
    MIN_BUILDABLE_FRACTION * (GRID.cols * GRID.rows - 2),
  );
  // Reserve room for the diamonds too, so the final map still clears the minimum.
  const maxSpine = GRID.cols * GRID.rows - minBuildable - MAX_BRANCHES;

  let spine: TileCoord[] | null = null;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const candidate = walk(rng, portal);
    if (meetsMinLength(candidate) && candidate.length <= maxSpine) {
      spine = candidate;
      break;
    }
  }
  if (!spine) spine = straightDown(portal); // short fallback - lots of buildable

  const base = spine[spine.length - 1];
  const pathKeys = new Set(spine.map(tkey));
  const edges: Array<[TileCoord, TileCoord]> = [];
  const adjacency = new Map<string, TileCoord[]>();
  const addEdge = (from: TileCoord, to: TileCoord) => {
    const k = tkey(from);
    const list = adjacency.get(k);
    if (list) list.push(to);
    else adjacency.set(k, [to]);
    edges.push([from, to]);
  };

  for (let i = 0; i < spine.length - 1; i++) addEdge(spine[i], spine[i + 1]);

  addBranches(spine, branchesForLevel(level), rng, pathKeys, addEdge);

  const airRoute = {
    from: tileToPixel(portal.col, portal.row),
    to: tileToPixel(base.col, base.row),
  };
  return { seed, level, portal, base, spine, pathKeys, edges, adjacency, airRoute };
}

/**
 * Add up to `count` diamond detours at path corners. At a corner A->S->B (an L
 * turn), the opposite square corner D = A + B - S is a tile adjacent to both A and
 * B; routing A->D->B forks at A and merges at B. Only free, in-bounds tiles are used.
 */
function addBranches(
  spine: TileCoord[],
  count: number,
  rng: () => number,
  pathKeys: Set<string>,
  addEdge: (from: TileCoord, to: TileCoord) => void,
): void {
  if (count <= 0) return;
  const candidates: { a: TileCoord; b: TileCoord; d: TileCoord }[] = [];
  for (let i = 1; i < spine.length - 1; i++) {
    const a = spine[i - 1];
    const s = spine[i];
    const b = spine[i + 1];
    // Skip straight segments (only corners host a diamond).
    const colinear =
      (s.col - a.col) * (b.row - a.row) - (s.row - a.row) * (b.col - a.col) === 0;
    if (colinear) continue;
    const d: TileCoord = { col: a.col + b.col - s.col, row: a.row + b.row - s.row };
    if (!inBounds(d.col, d.row)) continue;
    if (pathKeys.has(tkey(d))) continue;
    candidates.push({ a, b, d });
  }

  // Deterministic shuffle, then take valid candidates whose D is still free.
  shuffle(candidates, rng);
  let added = 0;
  for (const c of candidates) {
    if (added >= count) break;
    if (pathKeys.has(tkey(c.d))) continue; // taken by an earlier diamond
    pathKeys.add(tkey(c.d));
    addEdge(c.a, c.d);
    addEdge(c.d, c.b);
    added++;
  }
}

function shuffle<T>(arr: T[], rng: () => number): void {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

/** Sample a full ground route portal -> base, choosing randomly at each fork. */
export function sampleGroundRoute(map: GameMap): Vec2[] {
  let cur = map.portal;
  const route: Vec2[] = [tileToPixel(cur.col, cur.row)];
  let guard = 0;
  while (
    !(cur.col === map.base.col && cur.row === map.base.row) &&
    guard++ < GRID.cols * GRID.rows
  ) {
    const next = map.adjacency.get(tkey(cur));
    if (!next || next.length === 0) break;
    cur = next[Math.floor(Math.random() * next.length)];
    route.push(tileToPixel(cur.col, cur.row));
  }
  return route;
}

/**
 * Downward-biased random walk. Moving up is never allowed, so the tile below is
 * always unvisited and the walk always reaches the bottom row.
 */
function walk(rng: () => number, portal: TileCoord): TileCoord[] {
  const visited = new Set<string>([key(portal.col, portal.row)]);
  let col = portal.col;
  let row = portal.row;
  const path: TileCoord[] = [{ col, row }];

  while (row < BASE_ROW) {
    const moves: TileCoord[] = [];
    const down = { col, row: row + 1 };
    moves.push(down, down);
    if (col > 0 && !visited.has(key(col - 1, row))) {
      moves.push({ col: col - 1, row });
    }
    if (col < GRID.cols - 1 && !visited.has(key(col + 1, row))) {
      moves.push({ col: col + 1, row });
    }
    const next = moves[Math.floor(rng() * moves.length)];
    col = next.col;
    row = next.row;
    path.push({ col, row });
    visited.add(key(col, row));
  }
  return path;
}

function meetsMinLength(path: TileCoord[]): boolean {
  const straight = tileDistance(path[0], path[path.length - 1]);
  const minSteps = Math.max(BASE_ROW, Math.ceil(MIN_LENGTH_FACTOR * straight));
  return path.length - 1 >= minSteps;
}

/** Short, guaranteed-valid fallback: straight down the portal column. */
function straightDown(portal: TileCoord): TileCoord[] {
  const path: TileCoord[] = [];
  for (let row = portal.row; row <= BASE_ROW; row++) {
    path.push({ col: portal.col, row });
  }
  return path;
}
