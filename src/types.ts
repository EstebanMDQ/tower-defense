/** Shared types used across systems and entities. */

/** Whether an enemy travels on the ground or through the air. */
export type TargetClass = "ground" | "air";

export interface Vec2 {
  x: number;
  y: number;
}

/** A position on the logical tile grid. */
export interface TileCoord {
  col: number;
  row: number;
}
