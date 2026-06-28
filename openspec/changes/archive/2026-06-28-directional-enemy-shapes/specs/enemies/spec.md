## ADDED Requirements

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
