## ADDED Requirements

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
