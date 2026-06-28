## ADDED Requirements

### Requirement: Runnable application shell

The game SHALL boot into a single Phaser 3 application rendered on a portrait,
mobile-first canvas that scales to fit the available viewport.

#### Scenario: Launch in browser

- **WHEN** the developer runs the dev server and opens the app in a browser
- **THEN** a portrait game canvas is displayed and scaled to fit the viewport
  without distortion of the aspect ratio

#### Scenario: Resize viewport

- **WHEN** the browser window or device viewport changes size
- **THEN** the canvas rescales to fit while preserving the portrait design aspect
  ratio

### Requirement: Scene lifecycle

The application SHALL define a boot flow that initializes the game and transitions
into the main game scene with a HUD overlay, and SHALL provide a distinct
game-over scene.

#### Scenario: Boot to game

- **WHEN** the application starts
- **THEN** the boot scene runs first and then hands off to the game scene with the
  HUD scene running as a parallel overlay

#### Scenario: Scenes are independent

- **WHEN** the game scene renders the world
- **THEN** the HUD overlay renders on top without sharing the world camera

### Requirement: Tile coordinate system

The game SHALL reason about positions and distances in tile (grid) units and SHALL
provide conversion between tile coordinates and pixel coordinates.

#### Scenario: Convert tile to pixel

- **WHEN** a system requests the pixel position of a tile coordinate
- **THEN** it receives the pixel center of that tile based on the configured grid
  dimensions

#### Scenario: Grid dimensions are configurable

- **WHEN** the grid configuration defines columns and rows
- **THEN** the play field and all tile/pixel conversions use those values from a
  single configuration source

### Requirement: Frame-rate-independent update step

Gameplay systems SHALL advance using elapsed time (delta) so that behavior is
consistent regardless of rendering frame rate.

#### Scenario: Consistent movement across frame rates

- **WHEN** the game updates on devices with different frame rates
- **THEN** time-based behavior (e.g. movement, timers) advances by elapsed seconds
  and produces equivalent progress per unit of real time
