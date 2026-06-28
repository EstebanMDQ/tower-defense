## Why

The gameplay systems (map, enemies, towers, economy, waves) need a player-facing
shell to be a game: a way to start, see money/lives/wave, build and upgrade towers,
and a game-over screen with a restart. This change ties the systems together into a
playable loop.

## What Changes

- Add a game state machine: Menu -> Playing -> Game Over, with restart back to a
  fresh run.
- Drive Game Over from the economy's zero-lives signal, showing the wave reached
  and offering restart.
- Add a HUD overlay showing current money, lives, and wave number, updated from
  economy and wave events.
- Add a build palette: select a tower type, then tap a buildable tile to place it
  (delegating to the tower placement rules), with a range preview and affordability
  feedback.
- Add tower selection: tapping an existing tower shows its info and an upgrade
  action (delegating to the tower upgrade rules).
- Add a start-wave control so the player begins the next wave from the build phase.
- Optional: pause and speed-up controls.

## Capabilities

### New Capabilities
- `game-states`: the Menu/Playing/Game Over state machine, game-over on zero lives,
  and restart.
- `hud`: the on-screen money/lives/wave display, build palette, tower
  selection/upgrade interaction, start-wave control, and optional pause/speed.

### Modified Capabilities
<!-- none -->

## Impact

- Affected files: `MenuScene`/`GameOverScene` (state flow), `HUDScene` (overlay and
  input), wiring in `GameScene`.
- Depends on `economy` (money/lives, game-over signal), `waves` (wave number, start
  control), and `towers` (placement and upgrade operations). Builds on the scenes
  from `game-bootstrap`.
