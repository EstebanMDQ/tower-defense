## Why

The repository is greenfield - there is no runnable application yet. Every gameplay
capability (map, enemies, towers, waves, UI) needs a working Phaser 3 + TypeScript
shell to build on. This change establishes that foundation so later changes can
focus purely on game logic.

## What Changes

- Set up a Vite + TypeScript (strict mode) project with Phaser 3 as the only
  runtime game dependency.
- Bootstrap a single `Phaser.Game` configured for a portrait, mobile-first canvas
  that scales to fit any device.
- Create an empty scene skeleton - `BootScene`, `GameScene`, `HUDScene`,
  `GameOverScene` - with the boot flow wired up (Boot -> Game, HUD overlay).
- Provide a tile-based coordinate model: the game reasons in grid (tile) units
  internally and converts to pixels only at render time.
- Establish a deterministic, frame-rate-independent update step for gameplay
  systems.

This change delivers an empty but runnable game window. No gameplay yet.

## Capabilities

### New Capabilities
- `game-bootstrap`: a runnable Phaser + TypeScript application shell with portrait
  scaling, a scene lifecycle, and a tile-to-pixel coordinate system.

### Modified Capabilities
<!-- none: greenfield -->

## Impact

- New files: `package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`,
  `src/main.ts`, `src/scenes/*`, `src/config/grid.ts`, `src/types.ts`.
- New dependencies: `phaser`, `vite`, `typescript` (dev). Installation requires
  user approval per project policy.
- No mobile packaging (Capacitor) in this change.
