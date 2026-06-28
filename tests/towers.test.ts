import { describe, it, expect } from "vitest";
import { Tower } from "../src/entities/Tower";
import { TowerManager, pierceHits } from "../src/systems/TowerManager";
import { acquireTarget } from "../src/systems/TargetingSystem";
import { EnemyManager } from "../src/systems/EnemyManager";
import { Economy } from "../src/systems/Economy";
import {
  generateMap,
  isBuildable,
  sampleGroundRoute,
} from "../src/systems/PathGenerator";
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
      targets: ["ground", "air"],
    });
    expect(TOWERS.mortar).toMatchObject({
      cost: 180,
      damage: 40,
      targets: ["ground"],
      splashRadius: 1.0,
    });
    expect(TOWERS.missiles).toMatchObject({ cost: 160, targets: ["air"] });
  });

  it("includes the Sniper with a piercing line and both target classes", () => {
    expect(TOWERS.sniper).toMatchObject({
      cost: 250,
      damage: 120,
      range: 8,
      fireRate: 0.2,
      targets: ["ground", "air"],
      attack: "pierce",
      pierceWidth: 0.4,
    });
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
    const t = new Tower("mortar", { col: 1, row: 1 }); // build 180
    expect(t.upgradeCost()).toBe(135); // 180 * 0.75
    t.applyUpgrade();
    expect(t.upgradeCost()).toBe(225); // 180 * 1.25
  });
});

describe("Targeting", () => {
  const enemyA = makeEnemy("soldier", 10, 10, 200);
  const enemyB = makeEnemy("soldier", 12, 12, 50); // closer to base
  const plane = makeEnemy("plane", 11, 11, 100);

  it("picks the eligible enemy closest to the base", () => {
    const target = acquireTarget(0, 0, 1000, ["ground"], [enemyA, enemyB]);
    expect(target).toBe(enemyB);
  });

  it("respects range", () => {
    const target = acquireTarget(0, 0, 5, ["ground"], [enemyA]);
    expect(target).toBeNull();
  });

  it("filters by target class", () => {
    // Mortar (ground only) ignores planes.
    expect(acquireTarget(0, 0, 1000, ["ground"], [plane])).toBeNull();
    // Missiles (air only) ignore ground.
    expect(acquireTarget(0, 0, 1000, ["air"], [enemyA])).toBeNull();
    // Missiles hit planes.
    expect(acquireTarget(0, 0, 1000, ["air"], [plane])).toBe(plane);
  });

  it("machine gun targets both ground and air", () => {
    expect(acquireTarget(0, 0, 1000, ["ground", "air"], [enemyA])).toBe(enemyA);
    expect(acquireTarget(0, 0, 1000, ["ground", "air"], [plane])).toBe(plane);
  });
});

describe("Sniper pierce (pierceHits)", () => {
  // Tower at origin firing along +x (ux=1, uy=0), range 400, band 20.
  const onLineNear = makeEnemy("soldier", 50, 0, 0);
  const onLineFar = makeEnemy("soldier", 300, 5, 0); // within band 20
  const offLine = makeEnemy("soldier", 100, 200, 0); // perp 200 > band
  const behind = makeEnemy("soldier", -50, 0, 0); // proj < 0
  const beyond = makeEnemy("soldier", 500, 0, 0); // proj > range
  const plane = makeEnemy("plane", 150, 0, 0);

  it("hits every eligible enemy along the line within range and band", () => {
    const hits = pierceHits(
      0,
      0,
      1,
      0,
      400,
      20,
      ["ground", "air"],
      [onLineNear, onLineFar, offLine, behind, beyond, plane],
    );
    expect(hits).toContain(onLineNear);
    expect(hits).toContain(onLineFar);
    expect(hits).toContain(plane); // both classes
  });

  it("does not hit off-line, behind, or beyond-range enemies", () => {
    const hits = pierceHits(
      0,
      0,
      1,
      0,
      400,
      20,
      ["ground", "air"],
      [onLineNear, offLine, behind, beyond],
    );
    expect(hits).not.toContain(offLine);
    expect(hits).not.toContain(behind);
    expect(hits).not.toContain(beyond);
  });

  it("respects target classes", () => {
    const hits = pierceHits(0, 0, 1, 0, 400, 20, ["ground"], [plane, onLineNear]);
    expect(hits).toContain(onLineNear);
    expect(hits).not.toContain(plane);
  });
});

describe("TowerManager placement and upgrade", () => {
  function setup(money = 1000) {
    const map = generateMap(7);
    const economy = new Economy(money, 20);
    const enemies = new EnemyManager(
      () => sampleGroundRoute(map),
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
    const pathTile = map.spine[3];
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
    expect(towers.upgrade(tower)).toBe(true); // -38 (50*0.75 rounded)
    expect(tower.level).toBe(2);
    expect(towers.upgrade(tower)).toBe(true); // -63 (50*1.25)
    expect(tower.level).toBe(3);
    expect(towers.upgrade(tower)).toBe(false); // max tier
  });

  it("sells a tower for half its total investment and frees the tile", () => {
    const { map, economy, towers } = setup(300);
    const tile = firstBuildable(map);
    const tower = towers.place("machineGun", tile)!; // -50, invested 50
    towers.upgrade(tower); // -38, invested 88
    const before = economy.getMoney();
    const refund = towers.sell(tower);
    expect(refund).toBe(Math.floor(88 / 2)); // 44
    expect(economy.getMoney()).toBe(before + 44);
    // Tile is freed, so it can be built on again.
    expect(towers.place("machineGun", tile)).not.toBeNull();
  });

  it("clearAll removes every tower and frees their tiles", () => {
    const { map, towers } = setup(1000);
    const tile = firstBuildable(map);
    towers.place("machineGun", tile);
    expect(towers.getTowers().length).toBe(1);
    towers.clearAll();
    expect(towers.getTowers().length).toBe(0);
    expect(towers.place("machineGun", tile)).not.toBeNull(); // tile freed
  });
});

describe("Combat integration", () => {
  it("a machine gun damages and kills a ground enemy in range", () => {
    const map = generateMap(7);
    const economy = new Economy(1000, 20);
    const enemies = new EnemyManager(
      () => [
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

describe("Mortar blast effect", () => {
  function combatSetup() {
    const map = generateMap(7);
    const economy = new Economy(1000, 20);
    const enemies = new EnemyManager(
      () => [
        { x: 100, y: 100 },
        { x: 100, y: 400 },
      ],
      airRoute,
      economy,
    );
    const towers = new TowerManager(map, economy, enemies);
    return { map, economy, enemies, towers };
  }

  it("records a blast sized to the splash radius on impact", () => {
    const { map, enemies, towers } = combatSetup();
    const tower = towers.place("mortar", firstBuildable(map))!;
    const enemy = enemies.spawn("soldier");
    enemy.x = tower.x;
    enemy.y = tower.y;

    let blast = null;
    for (let t = 0; t < 5 && !blast; t += 1 / 60) {
      towers.update(1 / 60);
      blast = towers.getBlasts()[0] ?? null;
    }
    expect(blast).not.toBeNull();
    expect(blast!.radiusPx).toBeCloseTo(tower.splashRadiusPx);
  });

  it("removes the blast after its duration, and single-target towers make none", () => {
    const { map, enemies, towers } = combatSetup();
    // Machine gun (single target) -> no blast ever.
    const mg = towers.place("machineGun", firstBuildable(map))!;
    const enemy = enemies.spawn("soldier");
    enemy.x = mg.x;
    enemy.y = mg.y;
    for (let t = 0; t < 2; t += 1 / 60) towers.update(1 / 60);
    expect(towers.getBlasts().length).toBe(0);

    // Mortar blast eventually expires.
    const { map: m2, enemies: e2, towers: t2 } = combatSetup();
    const mortar = t2.place("mortar", firstBuildable(m2))!;
    const en2 = e2.spawn("soldier");
    en2.x = mortar.x;
    en2.y = mortar.y;
    let appeared = false;
    for (let t = 0; t < 5; t += 1 / 60) {
      t2.update(1 / 60);
      if (t2.getBlasts().length > 0) appeared = true;
      if (appeared && t2.getBlasts().length === 0) break;
    }
    expect(appeared).toBe(true);
    // Run well past the blast duration; it should be gone.
    for (let t = 0; t < 1; t += 1 / 60) t2.update(1 / 60);
    expect(t2.getBlasts().length).toBe(0);
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
