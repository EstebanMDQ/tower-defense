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

  it("HP scales 1 + 0.15*(wave-1)", () => {
    expect(hpScale(1)).toBeCloseTo(1.0);
    expect(hpScale(5)).toBeCloseTo(1.6);
  });

  it("clear bonus is 20 + 5*wave", () => {
    expect(clearBonus(1)).toBe(25);
    expect(clearBonus(10)).toBe(70);
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
    const enemies = new EnemyManager(groundRoute, airRoute, economy);
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
    waves.update(1);
    expect(enemies.isEmpty()).toBe(true);
  });

  it("spawns the wave, completes it, and grants the clear bonus", () => {
    const { economy, enemies, waves } = setup();
    waves.startWave(); // wave 1: 8 soldiers
    // Run enough time to spawn all and let them reach the base (no towers).
    for (let t = 0; t < 60; t += 1 / 60) {
      waves.update(1 / 60);
      enemies.update(1 / 60);
    }
    expect(waves.getPhase()).toBe("build");
    expect(enemies.isEmpty()).toBe(true);
    // All 8 soldiers reached the base (lives cost 1 each) -> 20 - 8 = 12.
    expect(economy.getLives()).toBe(12);
    // Clear bonus for wave 1 = 25.
    expect(economy.getMoney()).toBe(clearBonus(1));
  });
});
