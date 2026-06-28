import type { EnemyType } from "./enemies";

export interface ExplosionSpec {
  /** Number of particles in the burst. */
  count: number;
  /** Colors drawn from for the particles. */
  colors: number[];
  /** Base outward speed (px/s). */
  speed: number;
  /** Particle size (px). */
  size: number;
  /** Particle lifetime (s). */
  life: number;
  /** Downward acceleration (px/s^2). */
  gravity: number;
  shape: "circle" | "square";
}

/** Distinct death explosion per enemy type. */
export const EXPLOSIONS: Record<EnemyType, ExplosionSpec> = {
  soldier: {
    count: 6,
    colors: [0xffd166, 0xfff3b0],
    speed: 60,
    size: 2,
    life: 0.35,
    gravity: 120,
    shape: "circle",
  },
  buggy: {
    count: 8,
    colors: [0xef476f, 0xff8fa3],
    speed: 90,
    size: 2,
    life: 0.4,
    gravity: 120,
    shape: "circle",
  },
  tank: {
    count: 16,
    colors: [0x06d6a0, 0xfb8500],
    speed: 110,
    size: 3,
    life: 0.7,
    gravity: 80,
    shape: "square",
  },
  plane: {
    count: 10,
    colors: [0x118ab2, 0xcaf0f8],
    speed: 80,
    size: 2,
    life: 0.5,
    gravity: 200,
    shape: "circle",
  },
};
