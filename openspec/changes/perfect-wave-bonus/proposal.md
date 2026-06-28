## Why

Clearing a wave without letting anything through deserves a reward. Right now the
wave-clear bonus is the same whether you held a flawless line or leaked half the
wave - so there's no incentive to defend perfectly rather than just survive. A
small "perfect clear" bonus gives the player a concrete reason to protect every
life, and a bit of tension each wave.

## What Changes

- On clearing a wave, grant an **extra perfect-clear bonus on top of** the existing
  clear bonus (`20 + 7 * waveNumber`):
  - **+10** if the wave was cleared **untouched** (no enemy reached the base during
    that wave), or
  - **+3** if **any** enemy reached the base during the wave.
- The existing clear bonus is unchanged; this only adds the perfection reward.

## Capabilities

### Modified Capabilities
- `waves`: the wave-completion reward gains a perfect-clear bonus that depends on
  whether any enemy reached the base during the wave (+10 untouched, +3 if leaked).

## Impact

- `src/config/waves.ts` (the two bonus amounts), `src/systems/WaveManager.ts` (track
  whether the wave was untouched and grant the bonus on completion).
- One existing wave test asserts the exact post-wave money and will be updated to
  include the perfect/leaked bonus.
- Optional HUD/sound feedback for a perfect clear is out of scope here.
