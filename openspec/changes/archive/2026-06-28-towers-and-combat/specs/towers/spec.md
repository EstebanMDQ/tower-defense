## ADDED Requirements

### Requirement: Tower roster and base stats

The game SHALL define three towers - Machine Gun, Mortar, and Missiles - each with
the base stats from the design (cost, damage, range, fire rate, target class, and
the Mortar's splash radius) sourced from a single configuration.

#### Scenario: Stats sourced from config

- **WHEN** a tower of a given type is created
- **THEN** its cost, damage, range, fire rate, target class, and (for the Mortar)
  splash radius match the values in the tower configuration for that type

#### Scenario: Config matches the design values

- **WHEN** the tower configuration is read
- **THEN** Machine Gun = 50 cost, 5 damage, 2.5 range, 4/s, ground; Mortar = 120
  cost, 40 damage, 3.5 range, 0.5/s, ground, 1.0 splash radius; Missiles = 90 cost,
  35 damage, 4.0 range, 1/s, air

### Requirement: Tower placement with payment

A tower SHALL be placeable only on a buildable, unoccupied tile that the player can
afford, and placement SHALL deduct its cost.

#### Scenario: Successful placement

- **WHEN** the player places a tower on a buildable, unoccupied tile with
  sufficient money
- **THEN** the tower is created on that tile and its cost is deducted from the
  economy

#### Scenario: Placement on invalid tile rejected

- **WHEN** the player attempts to place a tower on a non-buildable or
  already-occupied tile
- **THEN** placement is rejected and no money is deducted

#### Scenario: Placing a tower occupies its tile

- **WHEN** a tower is successfully placed on a tile
- **THEN** that tile is marked occupied, and any later placement attempt on it is
  rejected (occupancy is owned by the towers capability, layered on top of the
  map's buildable set)

#### Scenario: Placement when unaffordable rejected

- **WHEN** the player attempts to place a tower they cannot afford
- **THEN** placement is rejected and no money is deducted

### Requirement: Targeting

A tower SHALL fire at the enemy closest to the Base among eligible enemies within
its range, and SHALL not fire when no eligible target is in range.

#### Scenario: Closest-to-base priority

- **WHEN** multiple eligible enemies are within a tower's range
- **THEN** the tower targets the one with the least remaining distance to the Base
  along its own route (ground enemies measured along the path, planes along the air
  route), with ties broken deterministically

#### Scenario: No target in range

- **WHEN** no eligible enemy is within a tower's range
- **THEN** the tower does not fire

### Requirement: Firing and projectiles

A tower SHALL fire at its configured rate, producing projectiles that deal the
tower's damage to the targeted enemy on hit.

#### Scenario: Fire at configured rate

- **WHEN** an eligible target remains in range over time
- **THEN** the tower fires at intervals equal to one divided by its fire rate

#### Scenario: First shot on acquiring a target

- **WHEN** a tower with no recent shot acquires an eligible target in range
- **THEN** it fires immediately (its first shot is not delayed by a full interval),
  then waits one interval before firing again

#### Scenario: Projectile deals damage

- **WHEN** a projectile reaches its target
- **THEN** the target takes the tower's effective damage

#### Scenario: Target removed before impact

- **WHEN** a single-target projectile's target is removed (dies or reaches the Base)
  before the projectile arrives
- **THEN** the projectile is discarded and applies no damage

### Requirement: Mortar splash damage

The Mortar's projectile SHALL deal its damage to all eligible enemies within its
splash radius of the impact point, not only the primary target.

#### Scenario: Splash hits grouped enemies

- **WHEN** a Mortar projectile impacts and multiple eligible enemies are within the
  splash radius
- **THEN** every such enemy takes the Mortar's damage

### Requirement: Air/ground targeting restrictions

The Machine Gun and Mortar SHALL target ground enemies only, and the Missiles tower
SHALL target air enemies only.

#### Scenario: Ground tower ignores planes

- **WHEN** only planes are within a Machine Gun's or Mortar's range
- **THEN** that tower does not target or damage them

#### Scenario: Missiles ignore ground

- **WHEN** only ground enemies are within a Missiles tower's range
- **THEN** the Missiles tower does not target or damage them

### Requirement: Tower upgrades

A tower SHALL support three tiers; each upgrade SHALL apply the configured
damage/range/fire-rate multipliers for the configured cost, only when the player
can afford it and the tower is below the maximum tier.

#### Scenario: Successful upgrade

- **WHEN** the player upgrades a tower below the maximum tier and can afford the
  tier cost
- **THEN** the tier increases, the new multipliers apply to the tower's effective
  stats, and the cost is deducted

#### Scenario: Upgrade multipliers and costs match the design

- **WHEN** the upgrade configuration is read
- **THEN** tier 2 applies x1.4 damage, x1.1 range, x1.1 fire rate at 75% of build
  cost; tier 3 applies x2.0 damage, x1.2 range, x1.2 fire rate at 125% of build
  cost (e.g. a tier-3 Mortar = 80 damage, 4.2 range, 0.6 fire rate)

#### Scenario: Upgrade at max tier rejected

- **WHEN** the player attempts to upgrade a tower already at the maximum tier
- **THEN** the upgrade is rejected and no money is deducted

#### Scenario: Upgrade when unaffordable rejected

- **WHEN** the player attempts an upgrade they cannot afford
- **THEN** the upgrade is rejected and no money is deducted
