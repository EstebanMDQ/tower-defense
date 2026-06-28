export interface UpgradeTier {
  /** Multipliers applied to the tower's base stats at this tier. */
  damageMul: number;
  rangeMul: number;
  fireRateMul: number;
  /** Cost to reach this tier, as a fraction of the tower's build cost. */
  costRatio: number;
}

/** Index 0 = level 1 (built), 1 = level 2, 2 = level 3. */
export const UPGRADE_TIERS: UpgradeTier[] = [
  { damageMul: 1.0, rangeMul: 1.0, fireRateMul: 1.0, costRatio: 0 },
  { damageMul: 1.4, rangeMul: 1.1, fireRateMul: 1.1, costRatio: 0.75 },
  { damageMul: 2.0, rangeMul: 1.2, fireRateMul: 1.2, costRatio: 1.25 },
];

export const MAX_LEVEL = UPGRADE_TIERS.length;
