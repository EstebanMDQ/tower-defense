/** Level progression tuning. */
export const LEVELS = {
  /** Waves per level; clearing the last starts a new level. */
  wavesPerLevel: 10,
  /** Fraction of a level's tower/upgrade spend carried into the next level. */
  carryoverPct: 0.5,
} as const;
