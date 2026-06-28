import type { TargetClass } from "../types";

export type TowerType = "machineGun" | "mortar" | "missiles";

export interface TowerSpec {
  name: string;
  cost: number;
  /** Base damage per shot at level 1. */
  damage: number;
  /** Range in tiles. */
  range: number;
  /** Shots per second. */
  fireRate: number;
  targets: TargetClass;
  /** Splash radius in tiles (Mortar only). */
  splashRadius?: number;
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
    targets: "ground",
    color: 0x8ecae6,
    projectileColor: 0xffffff,
    projectileSpeed: 14,
  },
  mortar: {
    name: "Mortar",
    cost: 120,
    damage: 40,
    range: 3.5,
    fireRate: 0.5,
    targets: "ground",
    splashRadius: 1.0,
    color: 0xfb8500,
    projectileColor: 0xffb703,
    projectileSpeed: 6,
  },
  missiles: {
    name: "Missiles",
    cost: 90,
    damage: 35,
    range: 4.0,
    fireRate: 1,
    targets: "air",
    color: 0x90be6d,
    projectileColor: 0xf94144,
    projectileSpeed: 10,
  },
};

export const TOWER_TYPES: TowerType[] = ["machineGun", "mortar", "missiles"];
