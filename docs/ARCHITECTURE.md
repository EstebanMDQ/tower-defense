# Architecture (Planned)

This describes the intended structure for the **first coding session**. Nothing
here is built yet. The goal is a clean, data-driven Phaser 3 + TypeScript setup
where balancing lives in config and gameplay code reads from it.

## Tooling

- **Vite** - dev server and bundler (fast HMR, browser-first iteration).
- **TypeScript** in **strict mode** - no `any` unless unavoidable.
- **Phaser 3** - 2D game engine; Canvas/WebGL rendering.
- **Capacitor** - added later to wrap the web build for iOS/Android. Not part of
  the initial slice.

## Suggested module layout

```
src/
  main.ts                 # Phaser.Game bootstrap + global config
  scenes/
    BootScene.ts          # load nothing heavy (procedural shapes); go to Game
    GameScene.ts          # map, path, entities, the core update loop
    HUDScene.ts           # money / lives / wave / build palette (overlay)
    GameOverScene.ts      # final wave reached, restart
  entities/
    Enemy.ts              # HP, speed, type, path-follow vs straight-fly movement
    Tower.ts              # range, damage, fire rate, level, targeting, firing
    Projectile.ts         # travel + impact (single target or Mortar splash)
  systems/
    PathGenerator.ts      # seeded RNG -> waypoint polyline (ground path)
    WaveManager.ts        # wave composition, spawn cadence, scaling, clear bonus
    Economy.ts            # money, lives, costs, rewards, can-afford checks
    TargetingSystem.ts    # pick closest-to-Base enemy in range; air/ground filter
  config/
    enemies.ts            # Enemy stat tables (mirrors GAME_DESIGN section 2)
    towers.ts             # Tower stat tables (section 3)
    upgrades.ts           # Upgrade multipliers and cost ratios (section 4)
    waves.ts              # Count/HP scaling, unlock thresholds, cadence (section 6)
    economy.ts            # Starting money/lives, wave-clear bonus formula (section 5)
    grid.ts               # Columns/rows, tile size, Base/Portal rows
  types.ts                # shared types: EnemyType, TargetClass (Ground|Air), etc.
```

## Data-driven principle

Every number in [`GAME_DESIGN.md`](GAME_DESIGN.md) maps to a typed constant in
`src/config/`. Gameplay code never hardcodes stats - it reads from config. This
keeps balancing in one place: tuning the game means editing `config/`, not logic.

Example shape (illustrative, not final):

```ts
// config/towers.ts
export type TargetClass = "ground" | "air";

export interface TowerSpec {
  cost: number;
  damage: number;
  range: number;       // tiles
  fireRate: number;    // shots per second
  targets: TargetClass;
  splashRadius?: number; // tiles; Mortar only
}

export const TOWERS: Record<string, TowerSpec> = {
  machineGun: { cost: 50,  damage: 5,  range: 2.5, fireRate: 4,   targets: "ground" },
  mortar:     { cost: 120, damage: 40, range: 3.5, fireRate: 0.5, targets: "ground", splashRadius: 1.0 },
  missiles:   { cost: 90,  damage: 35, range: 4.0, fireRate: 1,   targets: "air" },
};
```

## Coordinate model

- Work in **tile units** internally (grid coordinates), convert to pixels only at
  render time. Ranges, speeds, and splash radius in the design doc are all in
  tiles, so this keeps the math aligned with the spec and resolution-independent.

## First slice (suggested order for the next session)

1. Vite + TS + Phaser scaffold; render the grid, Base, and Portal.
2. `PathGenerator` + draw the path polyline.
3. One enemy (Soldier) following the path; lives decrement at Base.
4. One tower (Machine Gun) with targeting + projectiles + kills granting money.
5. `WaveManager` for a single wave, then the build/wave loop and HUD.
6. Fill in remaining enemies, towers, upgrades, and wave scaling from config.
