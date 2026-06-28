## ADDED Requirements

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
