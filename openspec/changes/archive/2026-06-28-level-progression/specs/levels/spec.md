## ADDED Requirements

### Requirement: Level structure

A run SHALL be divided into levels of 10 waves. Clearing the 10th wave of a level
SHALL advance the run to the next level, which begins on a newly generated map. The
current level and the wave within it SHALL be available for display.

#### Scenario: Advance after ten waves

- **WHEN** the 10th wave of a level is cleared
- **THEN** the run advances to the next level and a new map is generated for it

#### Scenario: Level and wave shown

- **WHEN** the game is in progress
- **THEN** the current level number and the wave within the level are available to
  the HUD

### Requirement: Level transition effects

On advancing to a new level, the game SHALL: generate a new branching map (with more
forks per the new level), destroy all placed towers, reset the player's lives to the
starting amount, and set the player's money to a configured percentage (default 50%)
of the money spent on towers and upgrades during the previous level.

#### Scenario: Towers destroyed and HP reset

- **WHEN** a new level begins
- **THEN** all towers are removed and the player's lives are reset to the starting
  amount

#### Scenario: Money carried over as a salvage percentage

- **WHEN** a new level begins after the player spent `S` on towers and upgrades
  during the previous level
- **THEN** the player's starting money for the new level is `floor(carryoverPct * S)`

#### Scenario: Spend tracking resets per level

- **WHEN** a new level begins
- **THEN** the tracked spend used for carryover is reset for the new level

### Requirement: Difficulty continuity across levels

Enemy strength and roster SHALL continue across levels (driven by the global wave
index), so a new level does not reset difficulty even though its wave numbering and
enemy counts restart.

#### Scenario: New level is not easier than the last wave before it

- **WHEN** the first wave of a new level spawns
- **THEN** its enemy HP scaling and unlocked roster are at least those of the last
  wave of the previous level
