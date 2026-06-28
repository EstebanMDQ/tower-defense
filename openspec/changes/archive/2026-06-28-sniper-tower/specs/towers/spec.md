## MODIFIED Requirements

### Requirement: Tower roster and base stats

The game SHALL define four towers - Machine Gun, Mortar, Missiles, and Sniper -
each with the base stats from the design (cost, damage, range, fire rate, target
classes, and any special parameters such as the Mortar's splash radius) sourced
from a single configuration.

#### Scenario: Stats sourced from config

- **WHEN** a tower of a given type is created
- **THEN** its cost, damage, range, fire rate, target classes, and any special
  parameters match the values in the tower configuration for that type

#### Scenario: Config matches the design values

- **WHEN** the tower configuration is read
- **THEN** Machine Gun = 50 cost, 5 damage, 2.5 range, 4/s, ground + air; Mortar =
  180 cost, 40 damage, 3.5 range, 0.5/s, ground, 1.0 splash radius; Missiles = 160
  cost, 35 damage, 4.0 range, 1/s, air; Sniper = 250 cost, 120 damage, 8.0 range,
  0.2/s, ground + air, piercing line with a 0.4-tile band

### Requirement: Air/ground targeting restrictions

The Machine Gun SHALL target both ground and air enemies. The Mortar SHALL target
ground enemies only. The Missiles tower SHALL target air enemies only. The Sniper
SHALL target both ground and air enemies.

#### Scenario: Machine Gun targets both classes

- **WHEN** ground enemies or planes are within a Machine Gun's range
- **THEN** the Machine Gun can target and damage either class

#### Scenario: Mortar ignores planes

- **WHEN** only planes are within a Mortar's range
- **THEN** the Mortar does not target or damage them

#### Scenario: Missiles ignore ground

- **WHEN** only ground enemies are within a Missiles tower's range
- **THEN** the Missiles tower does not target or damage them

#### Scenario: Sniper targets both classes

- **WHEN** ground enemies or planes lie along a Sniper's firing line
- **THEN** the Sniper can damage either class

## ADDED Requirements

### Requirement: Sniper piercing line attack

The Sniper SHALL fire a piercing line: it acquires a primary target like other
towers, then immediately deals its damage to every eligible enemy lying along the
line from the tower in the target's direction, out to its range. An enemy is "on the
line" when its perpendicular distance to the line is within the configured pierce
band and its projection onto the line is within the range. Damage is applied at fire
time (it is not a travelling projectile), so the primary target is damaged even if
it would die the same tick.

#### Scenario: Hits every enemy along the line

- **WHEN** the Sniper fires and multiple eligible enemies lie anywhere along the
  firing line within range (within the configured pierce band)
- **THEN** every such enemy, not only the primary target, takes the Sniper's damage

#### Scenario: Does not hit enemies off the line

- **WHEN** an enemy is within the Sniper's range but its perpendicular distance to
  the firing line exceeds the configured pierce band
- **THEN** that enemy takes no damage from the shot

#### Scenario: Targets ground and air

- **WHEN** the Sniper acquires a target
- **THEN** it may target either a ground enemy or a plane

#### Scenario: Long cooldown

- **WHEN** the Sniper fires
- **THEN** it cannot fire again until its cooldown (one divided by its low fire
  rate) has elapsed
