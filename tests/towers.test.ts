import { describe, it, expect } from "vitest";
import { Tower } from "../src/entities/Tower";
import { TowerManager } from "../src/systems/TowerManager";
import { acquireTarget } from "../src/systems/TargetingSystem";
import { EnemyManager } from "../src/systems/EnemyManager";
import { Economy } from "../src/systems/Economy";
import { generateMap, isBuildable } from "../src/systems/PathGenerator";
import { TOWERS } from "../src/config/towers";
import { GRID } from "../src/config/grid";
import type { Enemy } from "../src/entities/Enemy";
import type { TileCoord, Vec2 } from "../src/types";

const airRoute: Vec2[] = [
  { x: 0, y: 0 },
  { x: 0, y: 400 },
];

/** First buildable tile on the map, for placement tests. */
function firstBuildable(map: ReturnType<typeof generateMap>): TileCoord {
  for (let row = 0; row < GRID.rows; row++) {
    for (let col = 0; col < GRID.cols; col++) {
      if (isBuildable(map, col, row)) return { col, row };
    }
  }
  throw new Error("no buildable tile");
}

describe("Tower config and stats", () => {
  it("matches the design values", () => {
    expect(TOWERS.machineGun).toMatchObject({
      cost: 50,
      damage: 5,
      range: 2.5,
      fireRate: 4,
      targets: "ground",
    });
    expect(TOWERS.mortar).toMatchObject({
      cost: 120,
      damage: 40,
      targets: "ground",
      splashRadius: 1.0,
    });
    expect(TOWERS.missiles).toMatchObject({ cost: 90, targets: "air" });
  });

  it("applies upgrade multipliers (tier-3 Mortar example)", () => {
    const t = new Tower("mortar", { col: 1, row: 1 });
    t.applyUpgrade();
    t.applyUpgrade();
    expect(t.level).toBe(3);
    expect(t.damage).toBeCloseTo(80); // 40 * 2.0
    expect(t.range).toBeCloseTo(4.2); // 3.5 * 1.2
    expect(t.fireRate).toBeCloseTo(0.6); // 0.5 * 1.2
    expect(t.canUpgrade()).toBe(false);
  });

  it("computes upgrade costs as cost ratios of build cost", () => {
    const t = new Tower("mortar", { col: 1, row: 1 }); // build 120
    expect(t.upgradeCost()).toBe(90); // 120 * 0.75
    t.applyUpgrade();
    expect(t.upgradeCost()).toBe(150); // 120 * 1.25
  });
});

describe("Targeting", () => {
  const enemyA = makeEnemy("soldier", 10, 10, 200);
  const enemyB = makeEnemy("soldier", 12, 12, 50); // closer to base
  const plane = makeEnemy("plane", 11, 11, 100);

  it("picks the eligible enemy closest to the base", () => {
    const target = acquireTarget(0, 0, 1000, "ground", [enemyA, enemyB]);
    expect(target).toBe(enemyB);
  });

  it("respects range", () => {
    const target = acquireTarget(0, 0, 5, "ground", [enemyA]);
    expect(target).toBeNull();
  });

  it("filters by target class", () => {
    // Ground tower ignores planes.
    expect(acquireTarget(0, 0, 1000, "ground", [plane])).toBeNull();
    // Air tower ignores ground.
    expect(acquireTarget(0, 0, 1000, "air", [enemyA])).toBeNull();
    // Air tower hits planes.
    expect(acquireTarget(0, 0, 1000, "air", [plane])).toBe(plane);
  });
});

describe("TowerManager placement and upgrade", () => {
  function setup(money = 1000) {
    const map = generateMap(7);
    const economy = new Economy(money, 20);
    const enemies = new EnemyManager(
      map.path.map((t) => ({ x: t.col, y: t.row })),
      airRoute,
      economy,
    );
    const towers = new TowerManager(map, economy, enemies);
    return { map, economy, towers };
  }

  it("places on a buildable tile and deducts cost", () => {
    const { map, economy, towers } = setup();
    const tile = firstBuildable(map);
    const tower = towers.place("machineGun", tile);
    expect(tower).not.toBeNull();
    expect(economy.getMoney()).toBe(1000 - 50);
  });

  it("rejects placement on the path and on occupied tiles", () => {
    const { map, economy, towers } = setup();
    const pathTile = map.path[3];
    expect(towers.place("machineGun", pathTile)).toBeNull();
    expect(economy.getMoney()).toBe(1000); // no charge

    const tile = firstBuildable(map);
    towers.place("machineGun", tile);
    expect(towers.place("machineGun", tile)).toBeNull(); // occupied
  });

  it("rejects unaffordable placement without charging", () => {
    const { map, economy, towers } = setup(40); // < 50
    const tile = firstBuildable(map);
    expect(towers.place("machineGun", tile)).toBeNull();
    expect(economy.getMoney()).toBe(40);
  });

  it("upgrades only when affordable and below max tier", () => {
    const { map, towers } = setup(300);
    const tile = firstBuildable(map);
    const tower = towers.place("machineGun", tile)!; // -50 -> 250
    expect(towers.upgrade(tower)).toBe(true); // -37 (50*0.75 rounded)
    expect(tower.level).toBe(2);
    expect(towers.upgrade(tower)).toBe(true); // -63 (50*1.25)
    expect(tower.level).toBe(3);
    expect(towers.upgrade(tower)).toBe(false); // max tier
  });
});

describe("Combat integration", () => {
  it("a machine gun damages and kills a ground enemy in range", () => {
    const map = generateMap(7);
    const economy = new Economy(1000, 20);
    const enemies = new EnemyManager(
      [
        { x: 100, y: 100 },
        { x: 100, y: 400 },
      ],
      airRoute,
      economy,
    );
    const towers = new TowerManager(map, economy, enemies);
    // Place a tower next to the enemy's spawn by spawning the enemy near a tower.
    const tile = firstBuildable(map);
    const tower = towers.place("machineGun", tile)!;
    // Spawn an enemy right on top of the tower so it is always in range.
    const enemy = enemies.spawn("soldier");
    enemy.x = tower.x;
    enemy.y = tower.y;

    // Run a few seconds of combat.
    for (let t = 0; t < 5; t += 1 / 60) {
      towers.update(1 / 60);
    }
    expect(enemy.alive).toBe(false);
  });
});

// --- helpers ---------------------------------------------------------------

function makeEnemy(
  type: "soldier" | "plane",
  x: number,
  y: number,
  distToBase: number,
): Enemy {
  return {
    type,
    targetClass: type === "plane" ? "air" : "ground",
    x,
    y,
    alive: true,
    reachedBase: false,
    distanceToBase: () => distToBase,
  } as unknown as Enemy;
}
