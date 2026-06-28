## Context

`WaveManager` already detects wave completion and grants `clearBonus(wave)` via
`Economy.earn`. It also holds the `Economy` reference. Lives only ever decrease, and
only when an enemy reaches the base (`Economy.loseLives` in the enemy "reached base"
branch) - there is no other lives mechanic - so the change in lives across a wave is
an exact, decoupled signal of whether the wave was leaked.

## Goals / Non-Goals

**Goals:**
- Add a perfect-clear bonus (+10 untouched / +3 leaked) on top of the existing clear
  bonus, granted at wave completion.
- Keep it decoupled and unit-testable; no new cross-system wiring.

**Non-Goals:**
- Changing the existing `20 + 7 * wave` clear bonus.
- HUD/sound feedback for a perfect clear (could be a small follow-up).
- Per-enemy leak tracking - a wave-level untouched/leaked flag is enough.

## Decisions

- **Detect "untouched" via a lives delta.** On `startWave`, record
  `livesAtWaveStart = economy.getLives()`. On completion, the wave was untouched iff
  `economy.getLives() === livesAtWaveStart` (lives can only have dropped, via a leak,
  during the wave). This needs no leak hook and is exact.
- **Bonus amounts in config.** Add `perfectBonus: 10` and `leakedBonus: 3` to the
  `WAVES` config (tunable in one place), plus a small helper
  `perfectionBonus(untouched: boolean)`.
- **Grant on completion, after the clear bonus.** In the completion branch:
  `economy.earn(clearBonus(wave))` (unchanged), then
  `economy.earn(perfectionBonus(untouched))`. Two `earn` calls keep the existing
  clear-bonus behavior and tests intact and make the perfect bonus its own
  observable grant.

## Risks / Trade-offs

- The lives-delta approach assumes lives change only from leaks during a wave. That
  holds today (no healing, no other lives source); if a "gain a life" mechanic is
  ever added, the detection would need revisiting - noted here.
- Granting the bonus as a second `earn` means the HUD money simply ticks up by the
  combined amount; that's fine. A dedicated event/flag for "perfect clear" can be
  added later if UI feedback is wanted.
