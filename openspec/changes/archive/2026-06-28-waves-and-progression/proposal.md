## Why

The game is "wave after wave of increasing difficulty." This change is the engine
that drives the run: it decides what spawns, when, and how hard, scaling endlessly
so the player faces mounting pressure. Without it the enemies and towers have
nothing to do.

## What Changes

- Drive an endless sequence of waves, each identified by an increasing wave number.
- Compute each wave's enemy count from the GDD formula (`6 + 2 * waveNumber`).
- Scale enemy HP per wave by the GDD multiplier (`1 + 0.15 * (waveNumber - 1)`),
  passed to enemies at spawn.
- Build each wave's composition from a pool that unlocks by wave: Soldiers from
  wave 1, Buggies from wave 3, Planes from wave 4, Tanks from wave 5, with later
  waves weighted toward tougher enemies.
- Spawn enemies from the Portal at a fixed cadence that tightens slightly on higher
  waves.
- Detect wave completion (all enemies spawned and none remaining) and grant the
  clear bonus (`20 + 5 * waveNumber`) via the economy.
- Run a short build/prep phase between waves so the player can place and upgrade
  towers before starting the next wave.

## Capabilities

### New Capabilities
- `waves`: endless wave progression with count and HP scaling, wave-gated
  composition, timed spawning from the Portal, wave-completion detection, clear
  bonus, and a between-waves build phase.

### Modified Capabilities
<!-- none -->

## Impact

- New files: `src/systems/WaveManager.ts`, `src/config/waves.ts` (formulas, unlock
  thresholds, cadence).
- Depends on `enemies` (spawn + HP scaling), `map-generation` (Portal), and
  `economy` (clear bonus). Surfaced by `game-ui-and-states` (wave number, start
  controls).
