export type Waveform = "sine" | "square" | "sawtooth" | "triangle";

/** A small FM voice patch: a carrier modulated by one oscillator, with an envelope. */
export interface FmPatch {
  /** Carrier start frequency (Hz). */
  freq: number;
  /** Optional carrier end frequency for a linear-in-log pitch sweep. */
  sweepTo?: number;
  /** Modulator frequency as a ratio of the carrier. */
  modRatio: number;
  /** Modulation depth (carrier frequency deviation, Hz). */
  modIndex: number;
  carrierWave: Waveform;
  modWave: Waveform;
  /** Attack time (s). */
  attack: number;
  /** Decay time (s). */
  decay: number;
  /** Peak amplitude (0..1). */
  gain: number;
  /** Optional layered noise burst (for explosions / impacts). */
  noise?: { gain: number; decay: number };
  /** Minimum seconds between repeats of this sound (anti-spam). */
  throttle?: number;
}

export type SfxName =
  | "mgShot"
  | "mortarShot"
  | "missileShot"
  | "sniperShot"
  | "explosion"
  | "place"
  | "upgrade"
  | "sell"
  | "leak"
  | "waveStart"
  | "gameOver";

/** FM patches per game event, tuned for a punchy 80s arcade character. */
export const SFX: Record<SfxName, FmPatch> = {
  mgShot: {
    freq: 880,
    modRatio: 2,
    modIndex: 200,
    carrierWave: "square",
    modWave: "square",
    attack: 0.001,
    decay: 0.06,
    gain: 0.16,
    throttle: 0.07,
  },
  mortarShot: {
    freq: 150,
    sweepTo: 70,
    modRatio: 1.5,
    modIndex: 120,
    carrierWave: "sine",
    modWave: "sine",
    attack: 0.002,
    decay: 0.2,
    gain: 0.3,
  },
  missileShot: {
    freq: 320,
    sweepTo: 1200,
    modRatio: 3,
    modIndex: 300,
    carrierWave: "sawtooth",
    modWave: "square",
    attack: 0.001,
    decay: 0.16,
    gain: 0.2,
  },
  sniperShot: {
    freq: 600,
    sweepTo: 90,
    modRatio: 1,
    modIndex: 500,
    carrierWave: "square",
    modWave: "sawtooth",
    attack: 0.001,
    decay: 0.35,
    gain: 0.32,
    noise: { gain: 0.12, decay: 0.18 },
  },
  explosion: {
    freq: 200,
    sweepTo: 50,
    modRatio: 0.5,
    modIndex: 220,
    carrierWave: "sawtooth",
    modWave: "sawtooth",
    attack: 0.001,
    decay: 0.3,
    gain: 0.24,
    noise: { gain: 0.3, decay: 0.26 },
  },
  place: {
    freq: 660,
    modRatio: 2,
    modIndex: 60,
    carrierWave: "square",
    modWave: "square",
    attack: 0.001,
    decay: 0.09,
    gain: 0.2,
  },
  upgrade: {
    freq: 520,
    sweepTo: 1040,
    modRatio: 4,
    modIndex: 90,
    carrierWave: "square",
    modWave: "square",
    attack: 0.001,
    decay: 0.18,
    gain: 0.2,
  },
  sell: {
    freq: 1040,
    sweepTo: 360,
    modRatio: 4,
    modIndex: 90,
    carrierWave: "square",
    modWave: "square",
    attack: 0.001,
    decay: 0.18,
    gain: 0.2,
  },
  leak: {
    freq: 120,
    modRatio: 1.1,
    modIndex: 320,
    carrierWave: "sawtooth",
    modWave: "sawtooth",
    attack: 0.005,
    decay: 0.32,
    gain: 0.28,
  },
  waveStart: {
    freq: 523,
    sweepTo: 784,
    modRatio: 2,
    modIndex: 140,
    carrierWave: "square",
    modWave: "square",
    attack: 0.002,
    decay: 0.3,
    gain: 0.24,
  },
  gameOver: {
    freq: 440,
    sweepTo: 110,
    modRatio: 1,
    modIndex: 70,
    carrierWave: "triangle",
    modWave: "sine",
    attack: 0.005,
    decay: 0.7,
    gain: 0.3,
  },
};
