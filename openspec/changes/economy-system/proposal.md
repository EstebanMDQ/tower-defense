## Why

Money and lives are the core resources that tie the whole game together: towers
cost money, kills grant money, enemies reaching the base cost lives, and running
out of lives ends the run. Centralizing this bookkeeping in one system - before
towers, enemies, and waves are built - gives those systems a single, consistent
place to spend, earn, and lose against.

## What Changes

- Introduce an `Economy` system holding the player's current money and lives.
- Start each run with 200 money and 20 lives (from config).
- Provide spend/earn operations with affordability checks (cannot spend more money
  than available).
- Grant money rewards (used later when enemies die).
- Subtract lives by a configurable cost (used later when enemies reach the base).
- Signal game over when lives reach zero.
- Emit change events so the HUD can reflect money/lives without polling.

## Capabilities

### New Capabilities
- `economy`: authoritative money and lives state with spend/earn/lose operations,
  affordability checks, and a game-over signal at zero lives.

### Modified Capabilities
<!-- none -->

## Impact

- New files: `src/systems/Economy.ts`, `src/config/economy.ts` (starting values).
- Depends on `game-bootstrap`. Consumed later by `towers-and-combat` (costs),
  `enemies` (rewards, lives loss), `waves-and-progression` (clear bonus), and
  `game-ui-and-states` (HUD display, game over).
