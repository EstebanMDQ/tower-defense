import type { EnemyType } from "./enemies";

export const WAVES = {
  baseSpawnInterval: 0.8,
  minSpawnInterval: 0.4,
  /** Seconds shaved off the spawn interval per wave (tightens cadence). */
  spawnIntervalDecayPerWave: 0.03,
  /** Build window before the first wave auto-starts. */
  initialPrep: 12,
  /** Build window between waves before the next auto-starts. */
  betweenWaves: 6,
} as const;

/** Number of enemies in a wave. */
export function enemyCount(wave: number): number {
  return 6 + 2 * wave;
}

/** Per-wave HP multiplier applied to enemies at spawn. */
export function hpScale(wave: number): number {
  return 1 + 0.18 * (wave - 1);
}

/** Spawn interval (seconds), tightening with the wave down to a floor. */
export function spawnInterval(wave: number): number {
  return Math.max(
    WAVES.minSpawnInterval,
    WAVES.baseSpawnInterval - WAVES.spawnIntervalDecayPerWave * (wave - 1),
  );
}

/** Money granted for clearing a wave (the main income source). */
export function clearBonus(wave: number): number {
  return 20 + 7 * wave;
}

interface CompositionEntry {
  type: EnemyType;
  unlockWave: number;
  /** Draw weight; grows with the wave for tougher enemies. */
  weight: (wave: number) => number;
}

/** Enemy pool with unlock thresholds and wave-scaled weights. */
export const COMPOSITION: CompositionEntry[] = [
  { type: "soldier", unlockWave: 1, weight: () => 3 },
  { type: "buggy", unlockWave: 3, weight: () => 2 },
  { type: "plane", unlockWave: 4, weight: (w) => 1 + Math.floor((w - 4) / 3) },
  { type: "tank", unlockWave: 5, weight: (w) => 1 + Math.floor((w - 5) / 2) },
];
