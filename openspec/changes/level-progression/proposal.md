## Why

The run is currently one endless map. Adding **levels** - a fresh map every 10
waves - gives the game structure, variety, and a recurring "reset and rebuild"
decision, while difficulty keeps climbing. Branching paths make each map a real
tactical puzzle (where do enemies go, where do I cover) instead of a single lane.
Together they turn a flat survival loop into a progression with pacing.

## What Changes

**Levels (every 10 waves):**
- A run is divided into levels of 10 waves. After clearing wave 10 of a level, a new
  level begins on a **new procedurally generated map**.
- On a new level: **all towers are destroyed**, **lives reset** to the starting
  amount, and the player's starting money becomes a **percentage of the money they
  spent during the previous level** (default 50%, salvage from the wiped towers).
- **Difficulty carries over**: each level restarts its wave numbering (Level N,
  Wave 1..10) for enemy count and display, but enemy **strength and roster continue**
  from where the last level ended - Level 2 Wave 1 is as tough as the run's 11th
  wave, not the 1st.

**Branching paths:**
- The path generator produces paths with **splits (bifurcations)**: from the portal,
  lanes can fork and (re)join on the way to the base.
- Each enemy **randomly chooses a branch** at each fork.
- **Higher levels have more bifurcations** (more forks per map as the level rises).
- The generator **guarantees enough buildable ground** for towers (a minimum number
  of buildable tiles), regenerating if a map would leave too little room.

## Capabilities

### New Capabilities
- `levels`: the level lifecycle - group waves into levels of 10, and on level
  advance regenerate the map (with more branches), destroy towers, reset lives, and
  set starting money to a percentage of the previous level's spend.

### Modified Capabilities
- `map-generation`: generate a branching path graph (forking/merging lanes) with a
  per-route sampler and a guaranteed-minimum buildable area; branch count scales
  with the level.
- `enemies`: a ground enemy follows a route sampled through the branching path (a
  random choice at each fork), resolved when it spawns.
- `waves`: waves are grouped into levels; enemy count and the wave label use the
  per-level wave, while HP scaling and composition use a continuing global
  difficulty index.

## Impact

- `src/systems/PathGenerator.ts` (branching graph + route sampling + buildable
  guarantee), `src/systems/EnemyManager.ts` (sample a route per ground enemy),
  `src/systems/WaveManager.ts` (level/wave numbering + global difficulty),
  `src/systems/Economy.ts` (track spend, reset lives), `src/scenes/GameScene.ts`
  (orchestrate level transitions: regenerate map, rebuild systems, carry money) and
  `src/scenes/HUDScene.ts` (show Level + Wave).
- Large change; recommended to apply in two stages - branching paths first, then the
  level lifecycle. Coexists with the open `perfect-wave-bonus` change (both touch
  `waves` but different requirements).
