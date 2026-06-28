## ADDED Requirements

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
