import { ENEMIES, type EnemyType } from "../config/enemies";
import { mulberry32 } from "./Rng";

export interface EnemyVariant {
  bodyColor: number;
  accentColor: number;
  outline: boolean;
  /** 0..2 small accent marks. */
  stripes: number;
}

/** Max hue jitter around the base hue, as a fraction of the wheel (+/- 15 degrees). */
const HUE_JITTER = 15 / 360;
const LIGHTNESS_FLOOR = 0.25;

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const wrap01 = (v: number) => ((v % 1) + 1) % 1;

function hashType(type: EnemyType): number {
  let h = 2166136261;
  for (let i = 0; i < type.length; i++) {
    h ^= type.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function seed(type: EnemyType, wave: number): number {
  return ((hashType(type) * 2654435761) ^ (wave * 40503)) >>> 0;
}

export function rgbToHsl(rgb: number): { h: number; s: number; l: number } {
  const r = ((rgb >> 16) & 0xff) / 255;
  const g = ((rgb >> 8) & 0xff) / 255;
  const b = (rgb & 0xff) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      default:
        h = (r - g) / d + 4;
    }
    h /= 6;
  }
  return { h, s, l };
}

export function hslToRgb(h: number, s: number, l: number): number {
  let r: number;
  let g: number;
  let b: number;
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number): number => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  const to = (v: number) => Math.round(clamp(v, 0, 1) * 255);
  return (to(r) << 16) | (to(g) << 8) | to(b);
}

/**
 * Deterministic HSL for a (type, wave) variant. Exposed so the escalation trend
 * (rising saturation, falling lightness) is directly testable.
 */
export function variantHsl(
  type: EnemyType,
  wave: number,
): { h: number; s: number; l: number } {
  const rng = mulberry32(seed(type, wave));
  const base = rgbToHsl(ENEMIES[type].color);
  const jitter = (rng() * 2 - 1) * HUE_JITTER;
  return {
    h: wrap01(base.h + jitter),
    s: clamp(base.s + (wave - 1) * 0.03, 0, 1),
    l: clamp(base.l - (wave - 1) * 0.02, LIGHTNESS_FLOOR, 1),
  };
}

/**
 * Procedural per-wave appearance for an enemy type: recognizably in the type's
 * color family (bounded hue jitter), trending darker/more saturated with the wave,
 * plus a contrasting accent and small detail flags. Deterministic.
 */
export function makeEnemyVariant(type: EnemyType, wave: number): EnemyVariant {
  const rng = mulberry32(seed(type, wave));
  const base = rgbToHsl(ENEMIES[type].color);
  const jitter = (rng() * 2 - 1) * HUE_JITTER;
  const h = wrap01(base.h + jitter);
  const s = clamp(base.s + (wave - 1) * 0.03, 0, 1);
  const l = clamp(base.l - (wave - 1) * 0.02, LIGHTNESS_FLOOR, 1);

  const bodyColor = hslToRgb(h, s, l);
  const accentColor = hslToRgb(
    wrap01(h + 150 / 360),
    clamp(s + 0.1, 0, 1),
    clamp(l + 0.15, 0, 0.9),
  );
  const outline = rng() < 0.5;
  const stripes = Math.floor(rng() * 3);
  return { bodyColor, accentColor, outline, stripes };
}
