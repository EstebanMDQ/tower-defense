## Context

The final integration change. It consumes `economy` (money/lives + game-over
signal), `waves` (wave number + startWave), and `towers` (place/upgrade ops), and
presents them through the scenes established in `game-bootstrap`.

## Goals / Non-Goals

**Goals:**
- A complete playable loop: start a run, build/upgrade, fight waves, lose, restart.
- A HUD that reflects live state via events (no polling).
- Touch-first interaction (tap to build/select/upgrade).

**Non-Goals:**
- New gameplay rules - placement, upgrade, and wave logic live in their own changes;
  the UI only invokes them and shows results.
- Settings, audio, persistence, multiple maps.

## Decisions

- **States as scenes/flags.** Menu and Game Over are dedicated scenes; Playing is
  `GameScene` + `HUDScene`. A simple controller switches between them. Restart
  tears down and re-initializes a fresh run (new map seed, reset economy/waves).
- **Game Over is event-driven.** The state controller subscribes to the economy's
  game-over signal; when it fires, it transitions to `GameOverScene` showing the
  wave reached and a restart button.
- **HUD subscribes to events.** `HUDScene` listens to `money-changed`,
  `lives-changed`, and wave-change notifications and updates labels; it never reads
  system internals directly.
- **Build palette flow.** Player taps a palette entry (tower type) to enter "build
  mode," then taps a tile: the HUD calls the tower placement operation, which
  enforces buildable/affordable rules and returns success/failure for feedback. A
  range preview follows the cursor/last-tapped tile. Unaffordable entries are shown
  disabled.
- **Tower selection/upgrade.** Tapping an existing tower opens a small panel with
  its tier/stats and an upgrade button that calls the tower upgrade operation;
  disabled at max tier or when unaffordable.
- **Start-wave control.** During the build phase the HUD shows a "Start Wave"
  button that calls `WaveManager.startWave()`; hidden/disabled during an active
  wave.
- **Pause/speed are optional** and gated behind a simple toggle; not required for
  the loop to be complete.

## Risks / Trade-offs

- Touch targets on a 9-wide grid may be small on phones; the build palette and tile
  tap need adequate hit areas - revisit sizing during playtest.
- Keeping the HUD strictly event-driven requires every system mutation to emit; the
  economy and wave changes already specify these events, so the contract holds.
