# enemies Specification

## Purpose
TBD - created by archiving change enemies. Update Purpose after archive.
## Requirements
### Requirement: Enemy roster and base stats

The game SHALL define four enemy types - Soldier, Buggy, Tank, and Plane - each
with the base stats from the design (HP, speed, money reward, lives cost, and
target class) sourced from a single configuration.

#### Scenario: Stats sourced from config

- **WHEN** an enemy of a given type is created
- **THEN** its HP, speed, reward, lives cost, and target class match the values in
  the enemy configuration for that type

#### Scenario: Config matches the design values

- **WHEN** the enemy configuration is read
- **THEN** Soldier = 30 HP, 1.2 tiles/s, 1 reward, 1 lives cost, ground; Buggy = 50
  HP, 2.0 tiles/s, 2 reward, 1 lives cost, ground; Tank = 200 HP, 0.6 tiles/s, 4
  reward, 3 lives cost, ground; Plane = 80 HP, 1.8 tiles/s, 2 reward, 1 lives cost,
  air

### Requirement: Ground enemies follow the path

Ground enemies (Soldier, Buggy, Tank) SHALL move along the generated path from the
Portal toward the Base, advancing at their configured speed in tiles per second.

#### Scenario: Path traversal

- **WHEN** a ground enemy updates over time
- **THEN** it advances along the path waypoints toward the Base at its configured
  speed without skipping or overshooting waypoints

### Requirement: Planes fly the air route

Plane enemies SHALL move along the straight air route from Portal to Base, ignoring
the ground path.

#### Scenario: Straight flight

- **WHEN** a plane updates over time
- **THEN** it moves directly from the Portal toward the Base along the air route,
  independent of the ground path

### Requirement: Damage and death

An enemy SHALL lose health when it takes damage and SHALL die when its health
reaches zero, granting its money reward.

#### Scenario: Take damage

- **WHEN** an enemy takes damage less than its current health
- **THEN** its current health decreases by the damage amount and it remains alive

#### Scenario: Death grants reward

- **WHEN** an enemy's health reaches zero or below
- **THEN** the enemy is removed and its money reward is granted to the economy

### Requirement: Reaching the base

An enemy that reaches the Base SHALL apply its lives cost and be removed without
granting a reward.

#### Scenario: Arrival costs lives

- **WHEN** an enemy reaches the Base
- **THEN** its lives cost is applied to the economy and the enemy is removed
  without granting a money reward

### Requirement: Per-wave HP scaling

An enemy's starting health SHALL be its base HP multiplied by a wave-supplied
scaling factor provided at spawn.

#### Scenario: Scaled spawn

- **WHEN** an enemy is spawned with an HP scaling factor
- **THEN** its maximum and current health equal its base HP multiplied by that
  factor

### Requirement: Ground/air classification

Each enemy SHALL expose a target class of ground or air so that towers can
determine whether they may target it.

#### Scenario: Classification exposed

- **WHEN** the targeting system inspects an enemy
- **THEN** the enemy reports `air` for planes and `ground` for Soldier, Buggy, and
  Tank

### Requirement: Enemies face their direction of travel

Each enemy SHALL maintain a facing angle that points along its direction of
movement, and its drawn shape SHALL be oriented to that facing. The facing SHALL
ease toward the movement direction at a per-type turn rate rather than snapping, so
units visibly turn through direction changes. This is presentation only and SHALL
NOT change movement, speed, or combat.

#### Scenario: Facing follows movement

- **WHEN** an enemy moves along a straight segment
- **THEN** its facing angle points in the direction it is moving

#### Scenario: Smooth turn at a limited turn rate

- **WHEN** the movement direction changes (for example at a path corner) for an
  enemy with a limited turn rate, such as the Tank
- **THEN** its facing rotates toward the new direction over time at its turn rate,
  not instantly

#### Scenario: Initial facing

- **WHEN** an enemy spawns
- **THEN** its facing is already set toward its first target, so it does not swing
  from a default orientation on the first frame

#### Scenario: Oriented shapes

- **WHEN** enemies are drawn
- **THEN** each type's shape is rotated to its facing: a plane is a triangle with
  its nose forward, a tank is a rectangle hull (with a turret line) oriented along
  its heading, a buggy is a rectangle oriented along its heading, and a soldier is a
  circle with a short nub indicating its facing

#### Scenario: Stationary keeps facing

- **WHEN** an enemy is at its target (the toward-target direction is near-zero, e.g.
  reaching the base)
- **THEN** its facing angle is unchanged from the previous frame (it does not snap to
  a default)

#### Scenario: Gameplay unchanged

- **WHEN** facing and rotation are applied
- **THEN** movement, speed, HP, rewards, and targeting are unaffected

### Requirement: Per-wave procedural enemy variants

Each enemy SHALL be drawn with a procedurally generated appearance variant (body
color, accent color, and small details) derived deterministically from its type and
its wave number. The variant SHALL preserve the type's shape - only colors and minor
details change - and SHALL NOT affect movement, HP, rewards, or targeting.

#### Scenario: Deterministic per type and wave

- **WHEN** a variant is generated for the same enemy type and wave number more than
  once
- **THEN** the identical appearance is produced each time

#### Scenario: Consistent within a wave

- **WHEN** multiple enemies of the same type spawn during the same wave
- **THEN** they all share the same appearance variant

#### Scenario: Changes between adjacent waves

- **WHEN** the same enemy type appears in two consecutive waves
- **THEN** its appearance variant differs (the monotonic per-wave saturation/lightness
  offset guarantees a difference before clamping; for arbitrary far-apart waves the
  difference is very likely but not strictly guaranteed once values clamp)

#### Scenario: Escalation trend

- **WHEN** comparing variants of the same type across rising wave numbers (before
  clamping)
- **THEN** saturation is non-decreasing and lightness is non-increasing, so higher
  waves read as darker / more intense

#### Scenario: Shape preserved

- **WHEN** an enemy is drawn with its variant
- **THEN** the renderer selects the same shape branch for the type regardless of the
  variant (the variant carries only colors and detail flags, no shape), so a tank
  still reads as a tank

#### Scenario: Gameplay unchanged

- **WHEN** variants are applied
- **THEN** movement, speed, HP, rewards, and targeting are unaffected

### Requirement: Enemy death explosion

When an enemy is killed (its health reaches zero), the game SHALL spawn a transient
explosion effect at the enemy's position. The explosion SHALL be visually distinct
per enemy type. Enemies that reach the base SHALL NOT explode, and the effect SHALL
NOT change any gameplay (rewards, lives, or removal).

#### Scenario: Killed enemy explodes

- **WHEN** an enemy's health reaches zero
- **THEN** an explosion effect is created at that enemy's position

#### Scenario: Distinct per type

- **WHEN** enemies of different types are killed
- **THEN** their explosions differ in appearance (for example color, size, particle
  count, or spread) according to each type's configuration

#### Scenario: Leaked enemies do not explode

- **WHEN** an enemy reaches the base instead of being killed
- **THEN** no explosion effect is created for it

#### Scenario: Transient and gameplay-neutral

- **WHEN** an explosion effect has been active for its full lifetime
- **THEN** it is removed, and the kill's reward and the enemy's removal are
  unchanged by the presence of the effect

