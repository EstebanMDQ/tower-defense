import { describe, it, expect, vi } from "vitest";
import {
  WaveManager,
  generateComposition,
} from "../src/systems/WaveManager";
import {
  enemyCount,
  hpScale,
  spawnInterval,
  clearBonus,
  perfectionBonus,
  WAVES,
} from "../src/config/waves";
import { EnemyManager } from "../src/systems/EnemyManager";
import { Economy } from "../src/systems/Economy";
import type { Vec2 } from "../src/types";

const groundRoute: Vec2[] = [
  { x: 0, y: 0 },
  { x: 0, y: 1000 },
];
const airRoute: Vec2[] = [
  { x: 0, y: 0 },
  { x: 0, y: 1000 },
];

describe("wave formulas", () => {
  it("count is 6 + 2*wave", () => {
    expect(enemyCount(1)).toBe(8);
    expect(enemyCount(5)).toBe(16);
  });

  it("HP scales 1 + 0.18*(wave-1)", () => {
    expect(hpScale(1)).toBeCloseTo(1.0);
    expect(hpScale(5)).toBeCloseTo(1.72);
  });

  it("clear bonus is 20 + 7*wave", () => {
    expect(clearBonus(1)).toBe(27);
    expect(clearBonus(10)).toBe(90);
  });

  it("spawn interval tightens with a floor", () => {
    expect(spawnInterval(1)).toBeCloseTo(WAVES.baseSpawnInterval);
    expect(spawnInterval(2)).toBeLessThanOrEqual(spawnInterval(1));
    expect(spawnInterval(100)).toBe(WAVES.minSpawnInterval);
  });
});

describe("composition", () => {
  it("is deterministic for a given wave", () => {
    expect(generateComposition(5)).toEqual(generateComposition(5));
  });

  it("waves 1-2 are soldiers only", () => {
    for (const wave of [1, 2]) {
      const comp = generateComposition(wave);
      expect(comp.every((t) => t === "soldier")).toBe(true);
      expect(comp.length).toBe(enemyCount(wave));
    }
  });

  it("planes do not appear before wave 4", () => {
    for (let wave = 1; wave <= 3; wave++) {
      expect(generateComposition(wave)).not.toContain("plane");
    }
  });

  it("tanks do not appear before wave 5", () => {
    for (let wave = 1; wave <= 4; wave++) {
      expect(generateComposition(wave)).not.toContain("tank");
    }
  });
});

describe("WaveManager", () => {
  function setup() {
    const economy = new Economy(0, 20);
    const enemies = new EnemyManager(() => groundRoute, airRoute, economy);
    const waves = new WaveManager(enemies, economy);
    return { economy, enemies, waves };
  }

  it("starts in the build phase at wave 0", () => {
    const { waves } = setup();
    expect(waves.getWave()).toBe(0);
    expect(waves.getPhase()).toBe("build");
  });

  it("startWave advances the wave, emits events, and goes active", () => {
    const { waves } = setup();
    const onWave = vi.fn();
    const onPhase = vi.fn();
    waves.onWaveChanged(onWave);
    waves.onPhaseChanged(onPhase);
    waves.startWave();
    expect(waves.getWave()).toBe(1);
    expect(waves.getPhase()).toBe("active");
    expect(onWave).toHaveBeenCalledWith(1);
    expect(onPhase).toHaveBeenCalledWith("active");
  });

  it("ignores startWave while a wave is active", () => {
    const { waves } = setup();
    waves.startWave();
    waves.startWave();
    expect(waves.getWave()).toBe(1);
  });

  it("does not spawn during the build phase", () => {
    const { enemies, waves } = setup();
    waves.update(1); // still within the initial prep window
    expect(enemies.isEmpty()).toBe(true);
    expect(waves.getPhase()).toBe("build");
  });

  it("auto-starts the next wave after the prep countdown", () => {
    const { waves } = setup();
    expect(waves.getWave()).toBe(0);
    for (let t = 0; t < WAVES.initialPrep + 1; t += 1 / 60) {
      waves.update(1 / 60);
    }
    expect(waves.getWave()).toBe(1);
    expect(waves.getPhase()).toBe("active");
  });

  it("reports a prep countdown during the build phase", () => {
    const { waves } = setup();
    const start = waves.getPrepRemaining();
    expect(start).toBeGreaterThan(0);
    waves.update(2);
    expect(waves.getPrepRemaining()).toBeLessThan(start);
  });

  it("spawns the wave, completes it, and grants the clear bonus", () => {
    const { economy, enemies, waves } = setup();
    waves.startWave(); // wave 1: 8 soldiers
    // Run until wave 1 completes (phase returns to build), capped to be safe.
    let guard = 0;
    while (
      !(waves.getWave() === 1 && waves.getPhase() === "build") &&
      guard < 6000
    ) {
      waves.update(1 / 60);
      enemies.update(1 / 60);
      guard++;
    }
    expect(waves.getPhase()).toBe("build");
    expect(enemies.isEmpty()).toBe(true);
    // All 8 soldiers reached the base (lives cost 1 each) -> 20 - 8 = 12.
    expect(economy.getLives()).toBe(12);
    // Clear bonus (27) + leaked perfect-clear bonus (3), no kills.
    expect(economy.getMoney()).toBe(clearBonus(1) + perfectionBonus(false));
  });

  it("grants the perfect bonus for an untouched wave, reduced for a leaked one", () => {
    // Untouched: kill every enemy before it reaches the base.
    const a = setup();
    a.waves.startWave();
    let guard = 0;
    while (!(a.waves.getWave() === 1 && a.waves.getPhase() === "build") && guard < 6000) {
      a.waves.update(1 / 60);
      // Kill any spawned enemy immediately so none leak.
      for (const e of a.enemies.getEnemies()) e.takeDamage(e.maxHp);
      a.enemies.update(1 / 60);
      guard++;
    }
    expect(a.economy.getLives()).toBe(20); // untouched
    // clear bonus + 10 perfect, plus kill rewards (8 soldiers * 1).
    expect(a.economy.getMoney()).toBe(clearBonus(1) + perfectionBonus(true) + 8);

    // Leaked: let them through.
    const b = setup();
    b.waves.startWave();
    guard = 0;
    while (!(b.waves.getWave() === 1 && b.waves.getPhase() === "build") && guard < 6000) {
      b.waves.update(1 / 60);
      b.enemies.update(1 / 60);
      guard++;
    }
    expect(b.economy.getLives()).toBeLessThan(20); // leaked
    expect(b.economy.getMoney()).toBe(clearBonus(1) + perfectionBonus(false));
  });
});

describe("Levels", () => {
  function setup() {
    const economy = new Economy(0, 20);
    const enemies = new EnemyManager(() => groundRoute, airRoute, economy);
    const waves = new WaveManager(enemies, economy);
    return { economy, enemies, waves };
  }

  /** Run `n` waves, killing enemies immediately so no lives are lost. */
  function runWaves(n: number, ctx: ReturnType<typeof setup>): void {
    for (let i = 0; i < n; i++) {
      ctx.waves.startWave();
      let guard = 0;
      while (ctx.waves.getPhase() === "active" && guard < 8000) {
        ctx.waves.update(1 / 60);
        for (const e of ctx.enemies.getEnemies()) e.takeDamage(e.maxHp);
        ctx.enemies.update(1 / 60);
        guard++;
      }
    }
  }

  it("derives level and wave-in-level, signaling a new level after wave 10", () => {
    const ctx = setup();
    expect(ctx.waves.getLevel()).toBe(1);
    expect(ctx.waves.getWaveInLevel()).toBe(0);

    const onLevel = vi.fn();
    ctx.waves.onLevelComplete(onLevel);

    runWaves(10, ctx); // clear a whole level
    expect(ctx.waves.getWave()).toBe(10);
    expect(ctx.waves.getLevel()).toBe(1);
    expect(ctx.waves.getWaveInLevel()).toBe(10);
    expect(onLevel).toHaveBeenCalledWith(2);

    ctx.waves.startWave(); // first wave of level 2
    expect(ctx.waves.getWave()).toBe(11);
    expect(ctx.waves.getLevel()).toBe(2);
    expect(ctx.waves.getWaveInLevel()).toBe(1);
  });

  it("count uses the per-level wave; roster uses the global index", () => {
    // Level 2 wave 1: count is enemyCount(1) = 8, but global wave 11 unlocks the
    // full roster, so it is not soldiers-only.
    const comp = generateComposition(11, enemyCount(1));
    expect(comp.length).toBe(8);
    expect(comp.every((t) => t === "soldier")).toBe(false);
  });
});
