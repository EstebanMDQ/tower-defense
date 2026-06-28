## ADDED Requirements

### Requirement: Perfect-clear bonus

In addition to the wave clear bonus, on clearing a wave the game SHALL grant a
perfect-clear bonus that depends on whether any enemy reached the base during that
wave: `+10` if the wave was cleared untouched (no enemy reached the base), or `+3`
if at least one enemy reached the base. This is granted on top of the existing clear
bonus and does not change it.

#### Scenario: Untouched wave grants the perfect bonus

- **WHEN** a wave is cleared and no enemy reached the base during it
- **THEN** the economy is credited the clear bonus plus an additional 10

#### Scenario: Leaked wave grants the reduced bonus

- **WHEN** a wave is cleared and at least one enemy reached the base during it
- **THEN** the economy is credited the clear bonus plus an additional 3
