# economy Specification

## Purpose
TBD - created by archiving change economy-system. Update Purpose after archive.
## Requirements
### Requirement: Starting resources

A new run SHALL begin with the configured starting money and starting lives.

#### Scenario: Initial state

- **WHEN** a new run starts
- **THEN** the player has 180 money and 20 lives

### Requirement: Spending money with affordability checks

The economy SHALL allow spending money only when sufficient funds exist, and SHALL
never allow the money balance to go negative.

#### Scenario: Affordable purchase

- **WHEN** the player spends an amount less than or equal to their current money
- **THEN** the money balance decreases by that amount and the spend succeeds

#### Scenario: Unaffordable purchase rejected

- **WHEN** the player attempts to spend more than their current money
- **THEN** the spend fails, the money balance is unchanged, and it remains
  non-negative

### Requirement: Earning money

The economy SHALL increase the money balance when a reward is granted.

#### Scenario: Reward granted

- **WHEN** a money reward is granted
- **THEN** the money balance increases by the reward amount

### Requirement: Losing lives

The economy SHALL decrease lives by a caller-provided cost.

#### Scenario: Lose lives

- **WHEN** a lives cost is applied
- **THEN** the lives total decreases by that cost

### Requirement: Game over at zero lives

The economy SHALL signal game over when lives reach zero or below.

#### Scenario: Lives depleted

- **WHEN** applying a lives cost brings lives to zero or below
- **THEN** a game-over signal is emitted and lives are reported as zero (not
  negative)

### Requirement: Resource change notifications

The economy SHALL emit change notifications when money or lives change so that the
UI can update without polling.

#### Scenario: Money change notifies

- **WHEN** the money balance changes
- **THEN** a money-changed notification is emitted with the new balance

#### Scenario: Lives change notifies

- **WHEN** the lives total changes
- **THEN** a lives-changed notification is emitted with the new total

