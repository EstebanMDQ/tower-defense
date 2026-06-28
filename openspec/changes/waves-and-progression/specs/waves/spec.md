## ADDED Requirements

### Requirement: Endless wave progression

The game SHALL present an endless sequence of waves identified by an increasing
wave number, with no win condition; the run continues until the player loses.

#### Scenario: Waves advance indefinitely

- **WHEN** a wave is completed
- **THEN** the wave number increments and a new wave becomes available, with no
  upper bound

### Requirement: Wave enemy count scaling

Each wave SHALL contain a number of enemies equal to `6 + 2 * waveNumber`.

#### Scenario: Count formula

- **WHEN** wave number `w` begins
- **THEN** the wave contains `6 + 2 * w` enemies

### Requirement: Enemy HP scaling

Each wave SHALL scale enemy HP by a factor of `1 + 0.15 * (waveNumber - 1)`,
applied to enemies at spawn.

#### Scenario: HP multiplier

- **WHEN** an enemy spawns during wave number `w`
- **THEN** it is spawned with an HP scaling factor of `1 + 0.15 * (w - 1)`

### Requirement: Composition unlocks

Each wave's enemy mix SHALL be drawn from a pool that unlocks by wave: Soldiers
from wave 1, Buggies from wave 3, Planes from wave 4, and Tanks from wave 5, with
later waves weighted toward tougher enemies.

#### Scenario: Early waves are soldiers only

- **WHEN** wave 1 or 2 is generated
- **THEN** it contains only Soldiers

#### Scenario: Planes unlock at wave 4

- **WHEN** a wave numbered 4 or higher is generated
- **THEN** Planes may appear in its composition (and not before wave 4)

#### Scenario: Tanks unlock at wave 5

- **WHEN** a wave numbered 5 or higher is generated
- **THEN** Tanks may appear in its composition (and not before wave 5)

#### Scenario: Composition is deterministic

- **WHEN** the composition for a given wave number is generated more than once
  (using the wave's seeded draw)
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
clear bonus `20 + 5 * waveNumber` SHALL be granted to the economy.

#### Scenario: Completion grants bonus

- **WHEN** the last enemy of wave `w` is removed (by death or base-arrival) and the
  spawn queue is empty
- **THEN** the wave is marked complete and `20 + 5 * w` is granted to the economy

### Requirement: Build phase between waves

Between waves the game SHALL enter a build phase during which no enemies spawn,
until the player starts the next wave.

#### Scenario: Build phase before next wave

- **WHEN** a wave completes
- **THEN** the game enters a build phase with no active spawning until the next
  wave is started

### Requirement: Wave state exposure

The wave system SHALL expose its state to the UI without polling: it SHALL provide
the current wave number, emit a `wave-changed` notification when the wave number
changes and a `phase-changed` notification when the phase changes (build vs active),
and expose a `startWave` operation that begins the next wave only during the build
phase.

#### Scenario: Wave change notifies

- **WHEN** the wave number changes
- **THEN** a `wave-changed` notification is emitted with the new wave number

#### Scenario: Phase change notifies

- **WHEN** the phase changes between build and active
- **THEN** a `phase-changed` notification is emitted with the new phase

#### Scenario: Start wave only during build phase

- **WHEN** `startWave` is invoked during the build phase
- **THEN** the next wave begins and the phase becomes active

#### Scenario: Start wave ignored during active wave

- **WHEN** `startWave` is invoked while a wave is already active
- **THEN** the call is ignored and no additional wave starts
