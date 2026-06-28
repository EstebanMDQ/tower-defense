import { describe, it, expect } from "vitest";
import { Enemy } from "../src/entities/Enemy";
import { EnemyManager } from "../src/systems/EnemyManager";
import { Economy } from "../src/systems/Economy";
import { ENEMIES } from "../src/config/enemies";
import { GRID } from "../src/config/grid";
import type { Vec2 } from "../src/types";

// A simple two-leg ground route: down then right (pixel space).
const groundRoute: Vec2[] = [
  { x: 0, y: 0 },
  { x: 0, y: 100 },
  { x: 100, y: 100 },
];
const airRoute: Vec2[] = [
  { x: 0, y: 0 },
  { x: 0, y: 200 },
];

function step(e: Enemy, seconds: number, dt = 1 / 60): void {
  for (let t = 0; t < seconds; t += dt) e.update(dt);
}

describe("Enemy config", () => {
  it("matches the design values", () => {
    expect(ENEMIES.soldier).toMatchObject({
      hp: 30,
      speed: 1.2,
      reward: 5,
      livesCost: 1,
      targetClass: "ground",
    });
    expect(ENEMIES.tank).toMatchObject({ hp: 200, speed: 0.6, livesCost: 3 });
    expect(ENEMIES.plane.targetClass).toBe("air");
  });
});

describe("Enemy movement", () => {
  it("follows the route to the base across all waypoints", () => {
    const e = new Enemy("buggy", groundRoute);
    step(e, 30); // plenty of time
    expect(e.reachedBase).toBe(true);
    expect(e.x).toBeCloseTo(100);
    expect(e.y).toBeCloseTo(100);
  });

  it("moves at its configured speed (tiles/second)", () => {
    const e = new Enemy("soldier", groundRoute); // 1.2 tiles/s
    e.update(1); // one second
    // Expected travel: 1.2 * tileSize pixels down the first leg.
    expect(e.y).toBeCloseTo(1.2 * GRID.tileSize);
    expect(e.reachedBase).toBe(false);
  });

  it("planes fly the straight route", () => {
    const e = new Enemy("plane", airRoute);
    step(e, 30);
    expect(e.reachedBase).toBe(true);
    expect(e.x).toBeCloseTo(0);
    expect(e.y).toBeCloseTo(200);
  });

  it("reports decreasing distance-to-base as it advances", () => {
    const e = new Enemy("soldier", groundRoute);
    const before = e.distanceToBase();
    step(e, 2);
    expect(e.distanceToBase()).toBeLessThan(before);
  });
});

describe("Enemy damage", () => {
  it("scales HP at spawn", () => {
    const e = new Enemy("soldier", groundRoute, 2);
    expect(e.maxHp).toBe(60);
    expect(e.hp).toBe(60);
  });

  it("dies when HP reaches zero", () => {
    const e = new Enemy("soldier", groundRoute);
    e.takeDamage(20);
    expect(e.alive).toBe(true);
    e.takeDamage(20);
    expect(e.alive).toBe(false);
    expect(e.hp).toBe(0);
  });
});

describe("EnemyManager outcomes", () => {
  it("grants the reward when an enemy dies", () => {
    const economy = new Economy(0, 20);
    const mgr = new EnemyManager(groundRoute, airRoute, economy);
    const e = mgr.spawn("tank");
    e.takeDamage(e.maxHp);
    mgr.update(1 / 60);
    expect(economy.getMoney()).toBe(ENEMIES.tank.reward);
    expect(mgr.isEmpty()).toBe(true);
  });

  it("applies the lives cost on base arrival without a reward", () => {
    const economy = new Economy(0, 20);
    const mgr = new EnemyManager(groundRoute, airRoute, economy);
    mgr.spawn("tank"); // lives cost 3
    // Run long enough to reach the base.
    for (let t = 0; t < 60; t += 1 / 60) mgr.update(1 / 60);
    expect(economy.getLives()).toBe(17);
    expect(economy.getMoney()).toBe(0);
    expect(mgr.isEmpty()).toBe(true);
  });
});
