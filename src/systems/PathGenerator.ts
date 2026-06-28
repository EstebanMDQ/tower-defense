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
  /** Single spawn tile on the top row; start of the path. */
  portal: TileCoord;
  /** Single goal tile on the bottom row; end of the path. */
  base: TileCoord;
  /** Ordered, 4-connected waypoints from portal to base. */
  path: TileCoord[];
  /** Fast lookup of path-tile membership. */
  pathKeys: Set<string>;
  /** Straight-line air route between portal and base tile centers. */
  airRoute: { from: Vec2; to: Vec2 };
}

/** Path must be at least this multiple of the straight-line portal->base distance. */
const MIN_LENGTH_FACTOR = 1.5;
const MAX_ATTEMPTS = 50;

function key(col: number, row: number): string {
  return `${col},${row}`;
}

/** A tile is buildable if it is in bounds and not the path, portal, or base. */
export function isBuildable(map: GameMap, col: number, row: number): boolean {
  if (!inBounds(col, row)) return false;
  if (col === map.portal.col && row === map.portal.row) return false;
  if (col === map.base.col && row === map.base.row) return false;
  return !map.pathKeys.has(key(col, row));
}

/**
 * Generate a play field deterministically from a seed. Uses a guided random walk
 * (downward-biased, never revisiting a tile) that always reaches the bottom row;
 * the base is wherever it arrives. Falls back to a serpentine if no attempt meets
 * the minimum-length constraint, so generation always terminates.
 */
export function generateMap(seed: number): GameMap {
  const rng = mulberry32(seed);
  const portalCol = Math.floor(rng() * GRID.cols);
  const portal: TileCoord = { col: portalCol, row: PORTAL_ROW };

  let path: TileCoord[] | null = null;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const candidate = walk(rng, portal);
    if (meetsMinLength(candidate)) {
      path = candidate;
      break;
    }
  }
  if (!path) path = serpentine(portal);

  const base = path[path.length - 1];
  const pathKeys = new Set(path.map((t) => key(t.col, t.row)));
  const airRoute = {
    from: tileToPixel(portal.col, portal.row),
    to: tileToPixel(base.col, base.row),
  };
  return { seed, portal, base, path, pathKeys, airRoute };
}

/**
 * Downward-biased random walk. Moving up is never allowed, so the tile below is
 * always unvisited and the walk always reaches the bottom row without getting
 * stuck. Horizontal moves add length and snaking.
 */
function walk(rng: () => number, portal: TileCoord): TileCoord[] {
  const visited = new Set<string>([key(portal.col, portal.row)]);
  let col = portal.col;
  let row = portal.row;
  const path: TileCoord[] = [{ col, row }];

  while (row < BASE_ROW) {
    const moves: TileCoord[] = [];
    // Bias downward by weighting it twice.
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

/** Guaranteed-valid fallback: a serpentine sweep from the portal to the bottom. */
function serpentine(portal: TileCoord): TileCoord[] {
  const path: TileCoord[] = [];
  let col = portal.col;
  let row = portal.row;
  path.push({ col, row });
  // Slide to the left edge along the top row.
  while (col > 0) {
    col--;
    path.push({ col, row });
  }
  // Snake downward, sweeping fully across each new row.
  let movingRight = true;
  while (row < BASE_ROW) {
    row++;
    path.push({ col, row });
    if (movingRight) {
      while (col < GRID.cols - 1) {
        col++;
        path.push({ col, row });
      }
    } else {
      while (col > 0) {
        col--;
        path.push({ col, row });
      }
    }
    movingRight = !movingRight;
  }
  return path;
}
