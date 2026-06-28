# game-states Specification

## Purpose
TBD - created by archiving change game-ui-and-states. Update Purpose after archive.
## Requirements
### Requirement: Game state machine

The game SHALL move through Menu, Playing, and Game Over states, with Playing
running the world and HUD, and SHALL support restarting into a fresh run.

#### Scenario: Start a run

- **WHEN** the player starts the game from the Menu
- **THEN** the game enters the Playing state with a freshly initialized run: a new
  map, starting money (200) and lives (20), and the wave number reset to 1

#### Scenario: Restart after game over

- **WHEN** the player chooses restart on the Game Over screen
- **THEN** the game returns to a fresh Playing run with state fully reset

### Requirement: Game over on zero lives

The game SHALL transition to the Game Over state when the economy signals that
lives have reached zero, presenting the wave reached and a restart option.

#### Scenario: Lives depleted ends the run

- **WHEN** the economy emits its game-over signal during Playing
- **THEN** the game transitions to Game Over, reads the current wave number from the
  wave system, and displays that wave reached along with a restart option

#### Scenario: Restart resets the wave

- **WHEN** the player restarts from Game Over
- **THEN** the new run resets the wave number to 1 along with money, lives, and the
  map

