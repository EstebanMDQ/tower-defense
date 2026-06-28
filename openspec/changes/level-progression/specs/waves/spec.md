## MODIFIED Requirements

### Requirement: Level-grouped wave progression

The game SHALL present waves grouped into levels of a fixed size (10 waves per
level), with no win condition; the run continues until the player loses. A
continuous global wave index (across all levels) SHALL be maintained for difficulty,
alongside the per-level wave number used for display and enemy count.

#### Scenario: Waves advance within and across levels

- **WHEN** a wave is completed
- **THEN** the per-level wave advances; after the last wave of a level the next level
  begins at wave 1, while the global wave index keeps increasing with no upper bound

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
