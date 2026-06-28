# Tower Defense

A very simple mobile tower defense game. You defend a base at the bottom of the
screen against waves of enemies that spawn from a portal at the top. Ground units
follow a fixed, procedurally generated path; planes fly straight over it. Place
and upgrade towers to survive an endless run of increasingly difficult waves.

## Status

**Design phase.** No code yet. This repo currently holds the game design only.

## Stack (planned)

- **Phaser 3 + TypeScript** (Vite for dev), browser-first for fast iteration.
- **Capacitor** to wrap for iOS/Android later.
- Visuals start as procedural shapes (circles = enemies, squares = towers,
  polyline = path); art assets come later.

## Docs

- [`docs/GAME_DESIGN.md`](docs/GAME_DESIGN.md) - full game design: map, enemies,
  towers, upgrades, economy, and wave progression with concrete numbers.
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) - planned module layout for the
  first coding session.
