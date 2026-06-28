## Why

The current roster (Machine Gun, Mortar, Missiles) rewards spreading coverage and
splash. There is no answer to a tightly-packed column of enemies marching down a
straight stretch of path, and no high-investment "nuke" option for late waves. A
Sniper tower adds a distinct strategic choice: a very expensive, slow-firing tower
that fires a piercing shot hitting every enemy in a line, rewarding placement that
aligns with long straight path segments.

## What Changes

- Add a fourth tower, the **Sniper**: very high cost, very high damage, very long
  range, and a long cooldown (low fire rate).
- Introduce a **piercing line attack**: instead of a single-target or splash hit,
  the Sniper fires along the line from the tower toward its target and damages
  every eligible enemy within a thin band of that line, out to its range.
- The Sniper targets **both ground and air** (it shoots through anything in its
  line).
- It uses the existing 3-tier upgrade system and is sellable like other towers.
- The build palette gains a fourth entry for the Sniper.

## Capabilities

### Modified Capabilities
- `towers`: add the Sniper tower to the roster and introduce a piercing line attack
  mode (a new firing behavior alongside single-target and splash).

The `hud` build palette already specifies "a palette of buildable towers" generically,
so the Sniper appears with no requirement change - only an implementation update.

## Impact

- `docs/GAME_DESIGN.md` (add the Sniper row + target rule), `src/config/towers.ts`
  (Sniper spec + `attack` mode + `pierceWidth`), `src/systems/TowerManager.ts`
  (attack-mode switch in `fire`, hitscan pierce, transient beam list),
  `src/scenes/GameScene.ts` (draw the beam, keyboard select), `src/scenes/HUDScene.ts`
  (4th palette button -> 2x2 grid layout). `Projectile.ts` is unchanged (pierce is
  hitscan, not a projectile).
- Depends on the existing `towers` capability. Reuses targeting, placement,
  upgrades, and selling unchanged. The `hud` palette requirement is generic, so no
  hud spec change - only the palette layout.
- Coordinates with `mortar-blast-animation`: both touch `TowerManager.fire`. Land
  the `attack`-mode refactor here first; the mortar blast then keys off
  `attack === "splash"`.
