# waves Specification

## Purpose
TBD - created by archiving change waves-and-progression. Update Purpose after archive.
## Requirements
### Requirement: Wave enemy count scaling

Each wave SHALL contain a number of enemies equal to `6 + 2 * waveInLevel`, where
`waveInLevel` is the wave number within the current level (1..10).

#### Scenario: Count formula

- **WHEN** wave `w` within a level begins
- **THEN** the wave contains `6 + 2 * w` enemies

### Requirement: Enemy HP scaling

Each wave SHALL scale enemy HP by `1 + 0.18 * (globalWave - 1)`, using the
continuous global wave index, applied to enemies at spawn. Strength therefore keeps
climbing across levels (the first wave of a new level is as strong as the run's next
global wave, not reset).

#### Scenario: HP multiplier uses the global index

- **WHEN** an enemy spawns during global wave `g`
- **THEN** it is spawned with an HP scaling factor of `1 + 0.18 * (g - 1)`

#### Scenario: Strength carries across levels

- **WHEN** the first wave of a new level begins
- **THEN** its enemies use the HP factor of the continuing global wave index, not the
  factor of wave 1

### Requirement: Composition unlocks

Each wave's enemy mix SHALL be drawn from a pool that unlocks by the global wave
index: Soldiers from global wave 1, Buggies from 3, Planes from 4, and Tanks from 5,
with later global waves weighted toward tougher enemies. Because the index
continues, levels after the first start with the full unlocked roster.

#### Scenario: Early game is soldiers only

- **WHEN** global wave 1 or 2 is generated
- **THEN** it contains only Soldiers

#### Scenario: Later levels keep the roster

- **WHEN** a wave with a global index of 5 or higher is generated (including the
  first wave of a later level)
- **THEN** Tanks and the other unlocked types may appear

#### Scenario: Composition is deterministic

- **WHEN** the composition for a given global wave index is generated more than once
- **THEN** the same multiset of enemy types is produced each time

### Requirement: Timed spawning from the portal

During an active wave, the wave's enemies SHALL spawn from the Portal one at a time
at the configured spawn interval. The base interval SHALL be 0.8 seconds, and the
interval SHALL be non-increasing as the wave number rises, down to a configured
floor (0.4 seconds).

#### Scenario: Staggered spawns

- **WHEN** a wave is active
- **THEN** its enemies appear at the Portal spaced by the current spawn interval
  rather than all at once

#### Scenario: Cadence tightens with a floor

- **WHEN** comparing the spawn interval of a higher wave to a lower wave
- **THEN** the higher wave's interval is less than or equal to the lower wave's,
  never below the configured 0.4 second floor

### Requirement: Wave completion and clear bonus

A wave SHALL be considered complete when all its enemies have been spawned and none
remain alive on the field (each having died or reached the Base); on completion the
clear bonus `20 + 7 * waveNumber` SHALL be granted to the economy.

#### Scenario: Completion grants bonus

- **WHEN** the last enemy of wave `w` is removed (by death or base-arrival) and the
  spawn queue is empty
- **THEN** the wave is marked complete and `20 + 7 * w` is granted to the economy

### Requirement: Auto-advancing build phase between waves

Between waves the game SHALL enter a build phase during which no enemies spawn, and
SHALL automatically start the next wave when a build countdown elapses (a longer
countdown before the first wave, a shorter one between waves). The player does not
need to manually start each wave.

#### Scenario: Build phase before next wave

- **WHEN** a wave completes
- **THEN** the game enters a build phase with no active spawning and a countdown to
  the next wave

#### Scenario: Next wave auto-starts

- **WHEN** the build countdown reaches zero
- **THEN** the next wave starts automatically without player input

### Requirement: Wave state exposure

The wave system SHALL expose its state to the UI without polling: it SHALL provide
the current wave number and the build-countdown remaining, emit a `wave-changed`
notification when the wave number changes and a `phase-changed` notification when
the phase changes (build vs active), and expose a `startWave` operation that skips
the remaining countdown to begin the next wave, valid only during the build phase.

#### Scenario: Wave change notifies

- **WHEN** the wave number changes
- **THEN** a `wave-changed` notification is emitted with the new wave number

#### Scenario: Phase change notifies

- **WHEN** the phase changes between build and active
- **THEN** a `phase-changed` notification is emitted with the new phase

#### Scenario: Start wave skips the countdown during build phase

- **WHEN** `startWave` is invoked during the build phase
- **THEN** the remaining countdown is skipped, the next wave begins, and the phase
  becomes active

#### Scenario: Start wave ignored during active wave

- **WHEN** `startWave` is invoked while a wave is already active
- **THEN** the call is ignored and no additional wave starts

### Requirement: Perfect-clear bonus

In addition to the wave clear bonus, on clearing a wave the game SHALL grant a
perfect-clear bonus that depends on whether any enemy reached the base during that
wave: `+10` if the wave was cleared untouched (no enemy reached the base), or `+3`
if at least one enemy reached the base. This is granted on top of the existing clear
bonus and does not change it.

#### Scenario: Untouched wave grants the perfect bonus

- **WHEN** a wave is cleared and no enemy reached the base during it
- **THEN** the economy is credited the clear bonus plus an additional 10

#### Scenario: Leaked wave grants the reduced bonus

- **WHEN** a wave is cleared and at least one enemy reached the base during it
- **THEN** the economy is credited the clear bonus plus an additional 3

### Requirement: Level-grouped wave progression

The game SHALL present waves grouped into levels of a fixed size (10 waves per
level), with no win condition; the run continues until the player loses. A
continuous global wave index (across all levels) SHALL be maintained for difficulty,
alongside the per-level wave number used for display and enemy count.

#### Scenario: Waves advance within and across levels

- **WHEN** a wave is completed
- **THEN** the per-level wave advances; after the last wave of a level the next level
  begins at wave 1, while the global wave index keeps increasing with no upper bound

