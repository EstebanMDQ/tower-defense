import { describe, it, expect, vi } from "vitest";
import { Economy } from "../src/systems/Economy";

describe("Economy", () => {
  it("starts with 200 money and 20 lives", () => {
    const e = new Economy();
    expect(e.getMoney()).toBe(200);
    expect(e.getLives()).toBe(20);
    expect(e.isGameOver()).toBe(false);
  });

  it("spends affordable amounts and rejects unaffordable ones", () => {
    const e = new Economy(100, 20);
    expect(e.spend(60)).toBe(true);
    expect(e.getMoney()).toBe(40);
    expect(e.spend(50)).toBe(false); // unaffordable
    expect(e.getMoney()).toBe(40); // unchanged
    expect(e.spend(-10)).toBe(false); // negative rejected
    expect(e.getMoney()).toBe(40);
  });

  it("never goes negative", () => {
    const e = new Economy(30, 20);
    expect(e.spend(31)).toBe(false);
    expect(e.getMoney()).toBeGreaterThanOrEqual(0);
  });

  it("earns rewards", () => {
    const e = new Economy(0, 20);
    e.earn(25);
    expect(e.getMoney()).toBe(25);
    e.earn(-5); // ignored
    expect(e.getMoney()).toBe(25);
  });

  it("loses lives and clamps at zero", () => {
    const e = new Economy(0, 5);
    e.loseLives(3);
    expect(e.getLives()).toBe(2);
    e.loseLives(10);
    expect(e.getLives()).toBe(0);
  });

  it("signals game over exactly when lives reach zero", () => {
    const e = new Economy(0, 3);
    const onOver = vi.fn();
    e.onGameOver(onOver);
    e.loseLives(2);
    expect(onOver).not.toHaveBeenCalled();
    e.loseLives(1);
    expect(onOver).toHaveBeenCalledTimes(1);
    expect(e.isGameOver()).toBe(true);
    // Further losses are ignored and do not re-fire game over.
    e.loseLives(1);
    expect(onOver).toHaveBeenCalledTimes(1);
  });

  it("emits change notifications with new values", () => {
    const e = new Economy(100, 20);
    const onMoney = vi.fn();
    const onLives = vi.fn();
    e.onMoneyChanged(onMoney);
    e.onLivesChanged(onLives);
    e.spend(10);
    expect(onMoney).toHaveBeenLastCalledWith(90);
    e.earn(5);
    expect(onMoney).toHaveBeenLastCalledWith(95);
    e.loseLives(2);
    expect(onLives).toHaveBeenLastCalledWith(18);
  });
});
