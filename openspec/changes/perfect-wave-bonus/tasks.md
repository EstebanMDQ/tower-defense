## 1. Configuration

- [ ] 1.1 Add `perfectBonus: 10` and `leakedBonus: 3` to the `WAVES` config and a
      helper `perfectionBonus(untouched: boolean)` in `src/config/waves.ts`

## 2. Wave manager

- [ ] 2.1 In `WaveManager.startWave`, record `livesAtWaveStart = economy.getLives()`
- [ ] 2.2 On wave completion, after granting `clearBonus(wave)`, compute
      `untouched = economy.getLives() === livesAtWaveStart` and grant
      `perfectionBonus(untouched)`

## 3. Verification

- [ ] 3.1 Update the existing "spawns the wave, completes it, grants the clear bonus"
      test: a no-tower wave leaks, so expect clear bonus + 3
- [ ] 3.2 Unit test: an untouched wave (all enemies killed before the base) grants
      clear bonus + 10
- [ ] 3.3 Unit test: a leaked wave grants clear bonus + 3
- [ ] 3.4 Typecheck, tests, and build pass
