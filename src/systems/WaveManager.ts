import {
  COMPOSITION,
  WAVES,
  clearBonus,
  enemyCount,
  hpScale,
  spawnInterval,
} from "../config/waves";
import type { EnemyType } from "../config/enemies";
import { mulberry32 } from "./Rng";
import type { EnemyManager } from "./EnemyManager";
import type { Economy } from "./Economy";

export type WavePhase = "build" | "active";

type Listener<T> = (payload: T) => void;

/**
 * Builds a wave's enemy composition deterministically from its number: the
 * unlocked pool is drawn `enemyCount(wave)` times by weighted selection, seeded
 * by the wave so the same wave always yields the same multiset.
 */
export function generateComposition(wave: number): EnemyType[] {
  const rng = mulberry32((wave * 2654435761) >>> 0);
  const count = enemyCount(wave);
  const pool = COMPOSITION.filter((e) => wave >= e.unlockWave).map((e) => ({
    type: e.type,
    w: e.weight(wave),
  }));
  const total = pool.reduce((sum, e) => sum + e.w, 0);

  const result: EnemyType[] = [];
  for (let i = 0; i < count; i++) {
    let r = rng() * total;
    let picked = pool[pool.length - 1].type;
    for (const e of pool) {
      r -= e.w;
      if (r <= 0) {
        picked = e.type;
        break;
      }
    }
    result.push(picked);
  }
  return result;
}

/**
 * Drives the endless wave loop: a build phase between waves and an active phase
 * that spawns the wave's enemies from the portal at the wave's cadence. Detects
 * completion (queue empty and no enemies left), grants the clear bonus, and
 * returns to the build phase. Emits wave/phase changes for the HUD.
 */
export class WaveManager {
  private wave = 0;
  private phase: WavePhase = "build";
  private queue: EnemyType[] = [];
  private spawnTimer = 0;
  private interval = 0;
  private hp = 1;
  /** Seconds left in the build phase before the next wave auto-starts. */
  private prepRemaining: number = WAVES.initialPrep;

  private waveListeners: Listener<number>[] = [];
  private phaseListeners: Listener<WavePhase>[] = [];

  constructor(
    private readonly enemyManager: EnemyManager,
    private readonly economy: Economy,
  ) {}

  getWave(): number {
    return this.wave;
  }

  getPhase(): WavePhase {
    return this.phase;
  }

  /** Seconds left before the next wave auto-starts (0 during an active wave). */
  getPrepRemaining(): number {
    return this.phase === "build" ? Math.max(0, this.prepRemaining) : 0;
  }

  /** Begin the next wave. Ignored if a wave is already active. */
  startWave(): void {
    if (this.phase === "active") return;
    this.wave++;
    this.emitWave();
    this.queue = generateComposition(this.wave);
    this.hp = hpScale(this.wave);
    this.interval = spawnInterval(this.wave);
    this.spawnTimer = 0; // first enemy spawns on the next update
    this.setPhase("active");
  }

  update(dt: number): void {
    // Build phase: count down, then auto-start the next wave.
    if (this.phase === "build") {
      this.prepRemaining -= dt;
      if (this.prepRemaining <= 0) this.startWave();
      return;
    }

    if (this.queue.length > 0) {
      this.spawnTimer -= dt;
      while (this.spawnTimer <= 0 && this.queue.length > 0) {
        const type = this.queue.shift() as EnemyType;
        this.enemyManager.spawn(type, this.hp, this.wave);
        this.spawnTimer += this.interval;
      }
    }

    if (this.queue.length === 0 && this.enemyManager.isEmpty()) {
      this.economy.earn(clearBonus(this.wave));
      this.prepRemaining = WAVES.betweenWaves;
      this.setPhase("build");
    }
  }

  onWaveChanged(listener: Listener<number>): void {
    this.waveListeners.push(listener);
  }

  onPhaseChanged(listener: Listener<WavePhase>): void {
    this.phaseListeners.push(listener);
  }

  private setPhase(phase: WavePhase): void {
    if (this.phase === phase) return;
    this.phase = phase;
    this.phaseListeners.forEach((l) => l(phase));
  }

  private emitWave(): void {
    this.waveListeners.forEach((l) => l(this.wave));
  }
}
