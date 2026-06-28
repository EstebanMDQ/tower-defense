## ADDED Requirements

### Requirement: Resource and wave display

The HUD SHALL display the current money, lives, and wave number, updating in
response to economy and wave change notifications.

#### Scenario: Money and lives update

- **WHEN** the economy emits a money-changed or lives-changed notification
- **THEN** the HUD updates the displayed money or lives to the new value

#### Scenario: Wave display updates

- **WHEN** the wave number changes
- **THEN** the HUD updates the displayed wave number

### Requirement: Build palette

The HUD SHALL present a palette of buildable towers; selecting one and then tapping
a tile SHALL invoke tower placement, which enforces the placement rules, and the
HUD SHALL reflect success or failure.

#### Scenario: Place from palette

- **WHEN** the player selects a tower in the palette and taps a buildable,
  affordable tile
- **THEN** the placement operation is invoked, the tower appears, and the HUD
  reflects the updated money

#### Scenario: Invalid placement feedback

- **WHEN** the player taps a non-buildable or unaffordable tile while a tower is
  selected
- **THEN** no tower is placed and the HUD indicates the placement was not possible

#### Scenario: Range preview

- **WHEN** a tower type is selected for building
- **THEN** the HUD shows a range preview for the prospective placement

### Requirement: Tower selection and upgrade

Tapping an existing tower SHALL show its information and an upgrade action that
invokes the tower upgrade operation, disabled when at max tier or unaffordable.

#### Scenario: Upgrade a tower

- **WHEN** the player selects a placed tower and chooses upgrade while able to
  afford it and below max tier
- **THEN** the upgrade operation is invoked and the HUD reflects the new tier and
  updated money

#### Scenario: Upgrade unavailable

- **WHEN** the selected tower is at max tier or the player cannot afford the upgrade
- **THEN** the upgrade action is disabled

### Requirement: Start-wave control

During the build phase the HUD SHALL present a control to start the next wave, and
SHALL hide or disable it while a wave is active.

#### Scenario: Start the next wave

- **WHEN** the player taps the start-wave control during a build phase
- **THEN** the next wave begins and the control is hidden or disabled until the wave
  ends

### Requirement: Pause and speed controls (optional)

The HUD MAY provide pause and speed-up controls; when present, pausing SHALL halt
gameplay updates and speed-up SHALL increase the gameplay rate.

#### Scenario: Pause halts gameplay

- **WHEN** the pause control is present and activated
- **THEN** gameplay updates halt until resumed
