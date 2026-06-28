import type { TileCoord, Vec2 } from "../types";

/**
 * Logical play field. The game reasons in tile units internally and converts to
 * pixels only at render time, so gameplay numbers (ranges, speeds) stay
 * resolution-independent.
 */
export const GRID = {
  cols: 9,
  rows: 16,
  /** Pixels per tile at the design resolution. */
  tileSize: 48,
} as const;

/** Play-field resolution derived from the grid (portrait). */
export const DESIGN_WIDTH = GRID.cols * GRID.tileSize;
export const DESIGN_HEIGHT = GRID.rows * GRID.tileSize;

/** Reserved HUD bar below the play field, and the full canvas height. */
export const HUD_HEIGHT = 160;
export const TOTAL_HEIGHT = DESIGN_HEIGHT + HUD_HEIGHT;

/** Portal spawns on the top row; Base sits on the bottom row. */
export const PORTAL_ROW = 0;
export const BASE_ROW = GRID.rows - 1;

/** Center pixel position of a tile. */
export function tileToPixel(col: number, row: number): Vec2 {
  return {
    x: col * GRID.tileSize + GRID.tileSize / 2,
    y: row * GRID.tileSize + GRID.tileSize / 2,
  };
}

/** Tile containing a pixel position. */
export function pixelToTile(x: number, y: number): TileCoord {
  return {
    col: Math.floor(x / GRID.tileSize),
    row: Math.floor(y / GRID.tileSize),
  };
}

export function inBounds(col: number, row: number): boolean {
  return col >= 0 && col < GRID.cols && row >= 0 && row < GRID.rows;
}

/** Straight-line distance between two tiles, in tile units. */
export function tileDistance(a: TileCoord, b: TileCoord): number {
  return Math.hypot(a.col - b.col, a.row - b.row);
}
