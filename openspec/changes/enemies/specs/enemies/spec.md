## ADDED Requirements

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
- **THEN** Soldier = 30 HP, 1.2 tiles/s, 5 reward, 1 lives cost, ground; Buggy = 50
  HP, 2.0 tiles/s, 8 reward, 1 lives cost, ground; Tank = 200 HP, 0.6 tiles/s, 20
  reward, 3 lives cost, ground; Plane = 80 HP, 1.8 tiles/s, 12 reward, 1 lives cost,
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
