import type { TargetClass } from "../types";

export type TowerType = "machineGun" | "mortar" | "missiles" | "sniper";

/** How a tower's shot resolves: single target, splash area, or piercing line. */
export type AttackMode = "single" | "splash" | "pierce";

export interface TowerSpec {
  name: string;
  cost: number;
  /** Base damage per shot at level 1. */
  damage: number;
  /** Range in tiles. */
  range: number;
  /** Shots per second. */
  fireRate: number;
  /** Enemy classes this tower can hit. */
  targets: TargetClass[];
  /** Shot resolution (default "single"). */
  attack?: AttackMode;
  /** Splash radius in tiles (splash attack only). */
  splashRadius?: number;
  /** Pierce band half-width in tiles (pierce attack only). */
  pierceWidth?: number;
  /** Render color and projectile speed (tiles/second). */
  color: number;
  projectileColor: number;
  projectileSpeed: number;
}

export const TOWERS: Record<TowerType, TowerSpec> = {
  machineGun: {
    name: "Machine Gun",
    cost: 50,
    damage: 5,
    range: 2.5,
    fireRate: 4,
    targets: ["ground", "air"],
    color: 0x8ecae6,
    projectileColor: 0xffffff,
    projectileSpeed: 14,
  },
  mortar: {
    name: "Mortar",
    cost: 180,
    damage: 40,
    range: 3.5,
    fireRate: 0.5,
    targets: ["ground"],
    attack: "splash",
    splashRadius: 1.0,
    color: 0xfb8500,
    projectileColor: 0xffb703,
    projectileSpeed: 6,
  },
  missiles: {
    name: "Missiles",
    cost: 160,
    damage: 35,
    range: 4.0,
    fireRate: 1,
    targets: ["air"],
    color: 0x90be6d,
    projectileColor: 0xf94144,
    projectileSpeed: 10,
  },
  sniper: {
    name: "Sniper",
    cost: 250,
    damage: 120,
    range: 8.0,
    fireRate: 0.2,
    targets: ["ground", "air"],
    attack: "pierce",
    pierceWidth: 0.4,
    color: 0xb5179e,
    // Hitscan - projectile fields are unused placeholders.
    projectileColor: 0xff7bef,
    projectileSpeed: 0,
  },
};

export const TOWER_TYPES: TowerType[] = [
  "machineGun",
  "mortar",
  "missiles",
  "sniper",
];
