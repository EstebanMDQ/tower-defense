## Context

Builds on `enemies` (spawns enemies with an HP multiplier), `map-generation`
(spawns at Portal), and `economy` (clear bonus). Formulas and unlock thresholds
come from the GDD waves section.

## Goals / Non-Goals

**Goals:**
- Deterministic, data-driven wave generation from the wave number.
- Endless escalation via the count and HP formulas.
- A clean phase loop: build phase <-> wave phase.

**Non-Goals:**
- The HUD/start-wave button presentation (owned by `game-ui-and-states`); this
  change exposes wave state and a "start wave" operation.
- Enemy movement/death mechanics (owned by `enemies`).

## Decisions

- **WaveManager owns wave state:** current wave number, current phase (build vs
  active), spawn queue, and the set of live enemies for completion detection.
- **Config-driven formulas.** `waves.ts` holds: count `6 + 2*w`, HP multiplier
  `1 + 0.15*(w-1)`, spawn interval (base ~0.8s, tightening per wave to a floor),
  and the unlock thresholds (Soldier w1, Buggy w3, Plane w4, Tank w5) plus weights.
- **Composition by weighted draw.** For wave `w`, build the unlocked pool and draw
  `count` enemies using per-type weights that shift toward Tanks/Planes at higher
  waves. Deterministic given the wave number (seeded), so waves are reproducible.
- **Spawn loop.** During the active phase, the manager releases queued enemies one
  at a time at the current interval, each spawned at the Portal with the wave's HP
  multiplier.
- **Completion detection.** A wave completes when the spawn queue is empty and no
  live enemies remain (all died or reached the base). On completion: grant the
  clear bonus via Economy, increment the wave number, and return to the build phase.
- **Build phase + start control.** Between waves the manager sits in the build phase
  until a "start wave" trigger (from the UI). (Stretch: an early-start bonus is left
  as a future tweak and not required here.)

## Risks / Trade-offs

- Endless HP scaling will eventually outpace any fixed tower set - that is the
  intended "how far can you get" design; no win condition in v1.
- Weighted composition needs sane weights so early waves are not accidentally brutal
  (e.g. too many Tanks at wave 5); weights are config and tunable.
- Completion detection must count enemies removed by base-arrival as well as death,
  or a wave could hang; the manager tracks removals from both outcomes.
