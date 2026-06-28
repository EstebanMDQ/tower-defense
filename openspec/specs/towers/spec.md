# towers Specification

## Purpose
TBD - created by archiving change towers-and-combat. Update Purpose after archive.
## Requirements
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

### Requirement: Selling a tower

A tower SHALL be sellable for a refund of half its total investment (build cost
plus all upgrade costs paid), after which it is removed and its tile is freed.

#### Scenario: Sell refunds half of total investment

- **WHEN** the player sells a tower that cost a total of N (build plus upgrades)
- **THEN** the economy is credited floor(N / 2), the tower is removed, and its tile
  becomes buildable again

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

### Requirement: Mortar splash impact visual

When a Mortar shell impacts, the game SHALL display a transient blast effect
centered on the impact point and sized to the Mortar's splash radius. The effect is
purely visual and SHALL NOT alter splash damage behavior.

#### Scenario: Blast shown on impact

- **WHEN** a Mortar shell reaches its impact point
- **THEN** a blast effect is created at that point, sized to the Mortar's splash
  radius

#### Scenario: Blast shown even on a miss

- **WHEN** a Mortar shell impacts with no eligible enemies in the splash radius
- **THEN** a blast effect is still created at the impact point (the effect is not
  gated on hitting any enemy)

#### Scenario: Effect is transient

- **WHEN** a blast effect has been active for its full duration
- **THEN** it fades out and is removed, leaving no lasting mark

#### Scenario: Damage is unaffected

- **WHEN** a Mortar shell impacts with eligible enemies in the splash radius
- **THEN** every such enemy still takes the Mortar's damage exactly as before,
  independent of the visual effect

