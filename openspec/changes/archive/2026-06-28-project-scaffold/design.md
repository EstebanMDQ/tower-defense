## Context

Greenfield repo. The design docs (`docs/GAME_DESIGN.md`, `docs/ARCHITECTURE.md`)
settled the stack: Phaser 3 + TypeScript, Vite for dev, browser-first. This change
turns that into a running shell.

## Goals / Non-Goals

**Goals:**
- A `npm run dev` command that opens a portrait game window in the browser.
- A scene structure later changes can extend without re-architecting.
- A coordinate model that keeps gameplay math in tile units (resolution-independent).

**Non-Goals:**
- Any gameplay (map, enemies, towers, waves) - those are separate changes.
- Capacitor / mobile native packaging.
- Art assets, sound, persistence.

## Decisions

- **Tile units internally.** Ranges, speeds, and sizes in the GDD are all in tiles.
  Systems compute in tile coordinates; a single `grid.ts` helper converts tile <->
  pixel at render time. Keeps logic independent of screen resolution.
- **Grid constants live in `src/config/grid.ts`** (columns = 9, rows = 16, plus
  Base row = bottom, Portal row = top). One place to retune the play field.
- **Scene split mirrors responsibilities:** `BootScene` (init, hand off),
  `GameScene` (world + systems + update loop), `HUDScene` (overlay UI, runs in
  parallel), `GameOverScene` (end screen). HUD as a separate parallel scene avoids
  mixing world and UI cameras.
- **Scaling:** Phaser `Scale.FIT` with a fixed portrait design resolution; the
  canvas letterboxes on mismatched aspect ratios. Simple and predictable.
- **Update step:** gameplay systems advance using Phaser's delta time so behavior
  is frame-rate independent; a fixed logical reference (delta in seconds) is passed
  to systems.

## Risks / Trade-offs

- `Scale.FIT` letterboxes on some devices (black bars). Acceptable for v1;
  revisit with `Scale.ENVELOP` if it looks bad on target phones.
- Choosing tile units adds a conversion layer, but the alternative (pixel math
  everywhere) couples balancing numbers to resolution - worse long term.
