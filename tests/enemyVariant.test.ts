import { describe, it, expect } from "vitest";
import {
  makeEnemyVariant,
  variantHsl,
  rgbToHsl,
  hslToRgb,
} from "../src/systems/EnemyVariant";

describe("makeEnemyVariant", () => {
  it("is deterministic for a given type and wave", () => {
    expect(makeEnemyVariant("tank", 5)).toEqual(makeEnemyVariant("tank", 5));
    expect(makeEnemyVariant("soldier", 1)).toEqual(
      makeEnemyVariant("soldier", 1),
    );
  });

  it("differs between consecutive waves for the same type", () => {
    expect(makeEnemyVariant("tank", 1)).not.toEqual(makeEnemyVariant("tank", 2));
    expect(makeEnemyVariant("plane", 4)).not.toEqual(
      makeEnemyVariant("plane", 5),
    );
  });
});

describe("variant escalation trend", () => {
  it("saturation is non-decreasing and lightness non-increasing with the wave", () => {
    for (const type of ["soldier", "buggy", "tank", "plane"] as const) {
      const a = variantHsl(type, 1);
      const b = variantHsl(type, 5);
      expect(b.s).toBeGreaterThanOrEqual(a.s);
      expect(b.l).toBeLessThanOrEqual(a.l);
    }
  });

  it("clamps lightness to a visible floor at high waves", () => {
    expect(variantHsl("soldier", 100).l).toBeCloseTo(0.25);
  });
});

describe("HSL color helpers", () => {
  it("round-trip rgb -> hsl -> rgb within +/-1 per channel", () => {
    for (const color of [0xffd166, 0xef476f, 0x06d6a0, 0x118ab2, 0x000000, 0xffffff]) {
      const { h, s, l } = rgbToHsl(color);
      const back = hslToRgb(h, s, l);
      const channel = (c: number, shift: number) => (c >> shift) & 0xff;
      for (const shift of [16, 8, 0]) {
        expect(Math.abs(channel(color, shift) - channel(back, shift))).toBeLessThanOrEqual(1);
      }
    }
  });
});
