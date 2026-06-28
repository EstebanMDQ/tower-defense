## 1. Configuration

- [x] 1.1 Create `src/config/waves.ts` with count formula, HP multiplier, spawn
      interval (base + tightening + floor), and unlock thresholds + weights

## 2. Wave generation

- [x] 2.1 Compute enemy count `6 + 2*w` and HP multiplier `1 + 0.15*(w-1)`
- [x] 2.2 Build the unlocked pool per wave and draw the composition by weighted,
      seeded selection

## 3. Wave manager

- [x] 3.1 Create `src/systems/WaveManager.ts` tracking wave number, phase, spawn
      queue, and live enemies
- [x] 3.2 Spawn enemies at the Portal at the current interval with the wave HP
      multiplier
- [x] 3.3 Detect completion (queue empty + no live enemies) counting both death and
      base-arrival removals
- [x] 3.4 Grant clear bonus `20 + 5*w` via Economy and increment the wave
- [x] 3.5 Implement build phase + `startWave()` (ignored during an active wave)
- [x] 3.6 Emit `wave-changed` and `phase-changed` notifications; expose current
      wave number

## 4. Verification

- [x] 4.1 Count and HP formulas match the GDD for several wave numbers (unit tests)
- [x] 4.2 Composition respects unlock thresholds (no Planes < w4, no Tanks < w5)
- [x] 4.3 Wave completes and grants the correct bonus when the last enemy is removed
- [x] 4.4 No spawning occurs during the build phase
