# Game Design Document

A very simple mobile tower defense game: survive an endless run of increasingly
difficult enemy waves by placing and upgrading towers. Numbers here are the
balancing source of truth; the implementation reads them from typed config (see
[`ARCHITECTURE.md`](ARCHITECTURE.md)).

## 1. Screen / Map

- **Orientation:** portrait (mobile). Logical grid of **9 columns x 16 rows** of
  tiles, rendered scaled to the device.
- **Fixed landmarks:**
  - `Base` occupies the bottom row - the defender's goal. Enemies reaching it cost
    lives.
  - `Portal` occupies the top row - where every enemy spawns.
- **Path (ground):** generated once per level from a **seed** using a seeded RNG,
  then fixed for that level ("predefined for ground units"). It is a polyline of
  waypoints from Portal to Base that snakes left/right under constraints:
  - stays in bounds,
  - does not overlap itself,
  - has a minimum length (so it is not a trivial straight shot).
  - Stored as an ordered list of tile centers.
- **Movement:**
  - **Ground units** walk waypoint-to-waypoint along the path.
  - **Planes** ignore the path and fly in a straight line from Portal to Base.
- **Tower placement:** any **buildable tile** - not on the path, not Base/Portal,
  not already occupied. Flow: tap an empty tile -> pick a tower from the palette ->
  pay its cost.

## 2. Enemies

Base stats are at wave 1. HP scales with the wave (see [Waves](#6-waves)).

| Enemy   | HP  | Speed (tiles/s) | Reward $ | Lives cost | Type   | Notes                          |
|---------|-----|-----------------|----------|------------|--------|--------------------------------|
| Soldier | 30  | 1.2             | 5        | 1          | Ground | Baseline, cheap fodder         |
| Buggy   | 50  | 2.0             | 8        | 1          | Ground | Fast, low HP - rushes          |
| Tank    | 200 | 0.6             | 20       | 3          | Ground | Slow, tanky, high reward/threat |
| Plane   | 80  | 1.8             | 12       | 1          | Air    | Off-path, anti-air only        |

## 3. Towers

Base stats are at level 1 (freshly built).

| Tower          | Cost $ | Damage | Range (tiles) | Fire rate (/s) | Targets | Special                |
|----------------|--------|--------|---------------|----------------|---------|------------------------|
| Machine Gun    | 50     | 5      | 2.5           | 4              | Ground  | Single target (20 DPS) |
| Mortar         | 120    | 40     | 3.5           | 0.5            | Ground  | Splash radius 1.0 tile |
| Missiles (SAM) | 90     | 35     | 4.0           | 1              | Air     | Single target, air-only |

### Target rules (deliberately clean roles)

- **Machine Gun** and **Mortar** hit **ground only**; they cannot target planes.
- **Missiles** hit **air only**; they cannot target ground.
- This forces the player to buy Missiles once planes appear (wave 4+), and to mix
  single-target (Machine Gun) with splash (Mortar) for ground threats.
- **Tunable to revisit:** whether the Machine Gun should also weakly hit air.
  Default is no, for clearer roles. Flagged for playtesting.

### Targeting priority

Each tower fires at the enemy **closest to the Base** (furthest along its route)
within range. Mortar additionally deals its damage to all enemies within the
splash radius of the impact point.

## 4. Upgrades

Each tower has **3 tiers**: level 1 is the built tower, plus 2 upgrades. Each
upgrade applies a multiplier to the tower's base stats.

| Level | Damage | Range | Fire rate | Upgrade cost (of build cost) |
|-------|--------|-------|-----------|------------------------------|
| 1     | x1.0   | x1.0  | x1.0      | - (build)                    |
| 2     | x1.4   | x1.1  | x1.1      | 75% of build cost            |
| 3     | x2.0   | x1.2  | x1.2      | 125% of build cost           |

**Worked example - Mortar** (build cost 120):

- L2 upgrade costs 90; L3 upgrade costs 150.
- Fully upgraded: 80 damage, 4.2 range, 0.6 shots/s.
- Total invested to reach L3: 120 + 90 + 150 = **360**.

## 5. Economy

- **Starting money:** 200.
- **Starting lives:** 20. An enemy reaching the Base subtracts its "lives cost".
  At 0 lives -> **game over**.
- **Kill reward:** granted on enemy death, per the [Enemies](#2-enemies) table.
- **Wave clear bonus:** `20 + 5 * waveNumber`, paid when a wave is fully cleared.
  Rewards survival and helps fund the next wave.
- **No selling** in v1 (keep it simple); a refund mechanic can be added later.

**Sanity check (wave 1):** 8 soldiers -> 40$ in kills + 25$ clear bonus = 65$ on
top of the 200 start. The player can open with roughly 3-4 Machine Guns, which is
enough to clear wave 1 and bank toward Mortars/Missiles.

## 6. Waves

"Wave after wave of increasing difficulty" = **endless**, with deterministic
scaling so balancing is predictable.

- **Enemy count:** `6 + 2 * waveNumber` enemies per wave.
- **HP scaling:** each enemy's base HP is multiplied by `1 + 0.15 * (waveNumber - 1)`.
- **Composition unlocks** (the wave's mix is drawn from the unlocked pool, weighted):
  - Waves 1-2: Soldiers only.
  - Wave 3+: Buggies enter the pool.
  - Wave 4+: **Planes** enter - this is when Missiles become necessary.
  - Wave 5+: Tanks enter.
  - Later waves: weighting shifts toward Tanks and Planes.
- **Spawn cadence:** enemies spawn from the Portal at a fixed interval (~0.8s),
  tightening slightly on higher waves.
- **Wave flow:** a short **build/prep phase** sits between waves for placing and
  upgrading towers. (Stretch: tap "Start Wave" to begin early for a small bonus.)

## 7. Game states / loop

```
Menu  ->  Playing  ->  Game Over
            |  ^
   build phase <-> wave phase   (loops endlessly until lives hit 0)
```

The HUD shows **money**, **lives**, the **current wave**, and a **tower-build
palette**. Pause and speed-up controls are a nice-to-have for v1.

## 8. Out of scope (v1)

Sprites/art, sound, persistence/save, selling towers, multiple maps, and
difficulty modes are deferred to later iterations.
