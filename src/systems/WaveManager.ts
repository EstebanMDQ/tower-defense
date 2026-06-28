import {
  COMPOSITION,
  WAVES,
  clearBonus,
  enemyCount,
  hpScale,
  perfectionBonus,
  spawnInterval,
} from "../config/waves";
import { LEVELS } from "../config/levels";
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
export function generateComposition(
  wave: number,
  count: number = enemyCount(wave),
): EnemyType[] {
  const rng = mulberry32((wave * 2654435761) >>> 0);
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
  /** Lives at the start of the active wave, to detect an untouched clear. */
  private livesAtWaveStart = 0;
  /** Seconds left in the build phase before the next wave auto-starts. */
  private prepRemaining: number = WAVES.initialPrep;

  private waveListeners: Listener<number>[] = [];
  private phaseListeners: Listener<WavePhase>[] = [];
  private levelListeners: Listener<number>[] = [];

  constructor(
    private readonly enemyManager: EnemyManager,
    private readonly economy: Economy,
  ) {}

  /** Continuous global wave index (across all levels). */
  getWave(): number {
    return this.wave;
  }

  /** Current level (1-based). */
  getLevel(): number {
    return Math.floor(Math.max(0, this.wave - 1) / LEVELS.wavesPerLevel) + 1;
  }

  /** Wave within the current level (1..wavesPerLevel), or 0 before the first wave. */
  getWaveInLevel(): number {
    if (this.wave === 0) return 0;
    return ((this.wave - 1) % LEVELS.wavesPerLevel) + 1;
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
    // Count scales with the per-level wave; HP and composition use the global index.
    this.queue = generateComposition(this.wave, enemyCount(this.getWaveInLevel()));
    this.hp = hpScale(this.wave);
    this.interval = spawnInterval(this.wave);
    this.spawnTimer = 0; // first enemy spawns on the next update
    this.livesAtWaveStart = this.economy.getLives();
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
      // Perfect-clear bonus: lives only drop via leaks, so unchanged = untouched.
      const untouched = this.economy.getLives() === this.livesAtWaveStart;
      this.economy.earn(perfectionBonus(untouched));
      this.prepRemaining = WAVES.betweenWaves;
      this.setPhase("build");
      // After the last wave of a level, signal a new level (handled in build phase).
      if (this.wave % LEVELS.wavesPerLevel === 0) {
        const nextLevel = Math.floor(this.wave / LEVELS.wavesPerLevel) + 1;
        this.levelListeners.forEach((l) => l(nextLevel));
      }
    }
  }

  onWaveChanged(listener: Listener<number>): void {
    this.waveListeners.push(listener);
  }

  onPhaseChanged(listener: Listener<WavePhase>): void {
    this.phaseListeners.push(listener);
  }

  /** Fired with the new level number after the last wave of a level is cleared. */
  onLevelComplete(listener: Listener<number>): void {
    this.levelListeners.push(listener);
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
