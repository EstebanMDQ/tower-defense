import type { TargetClass } from "../types";

export type EnemyType = "soldier" | "buggy" | "tank" | "plane";

export interface EnemySpec {
  /** Base hit points at wave 1 (scaled per wave at spawn). */
  hp: number;
  /** Movement speed in tiles per second. */
  speed: number;
  /** Money granted when killed. */
  reward: number;
  /** Lives subtracted from the base on arrival. */
  livesCost: number;
  targetClass: TargetClass;
  /** How fast the unit rotates toward its heading (radians/second). */
  turnRate: number;
  /** Render color and radius (px) for the procedural shape. */
  color: number;
  radius: number;
}

export const ENEMIES: Record<EnemyType, EnemySpec> = {
  soldier: {
    hp: 30,
    speed: 1.2,
    reward: 1,
    livesCost: 1,
    targetClass: "ground",
    turnRate: 12,
    color: 0xffd166,
    radius: 8,
  },
  buggy: {
    hp: 50,
    speed: 2.0,
    reward: 2,
    livesCost: 1,
    targetClass: "ground",
    turnRate: 8,
    color: 0xef476f,
    radius: 9,
  },
  tank: {
    hp: 200,
    speed: 0.6,
    reward: 4,
    livesCost: 3,
    targetClass: "ground",
    turnRate: 3,
    color: 0x06d6a0,
    radius: 12,
  },
  plane: {
    hp: 80,
    speed: 1.8,
    reward: 2,
    livesCost: 1,
    targetClass: "air",
    turnRate: 10,
    color: 0x118ab2,
    radius: 10,
  },
};
