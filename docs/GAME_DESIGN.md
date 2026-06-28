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
| Soldier | 30  | 1.2             | 1        | 1          | Ground | Baseline, cheap fodder         |
| Buggy   | 50  | 2.0             | 2        | 1          | Ground | Fast, low HP - rushes          |
| Tank    | 200 | 0.6             | 4        | 3          | Ground | Slow, tanky, high threat       |
| Plane   | 80  | 1.8             | 2        | 1          | Air    | Off-path; hit by MG or Missiles |

Kill rewards are deliberately small: income comes mainly from surviving waves
(the clear bonus), so leaking enemies to "farm" is not viable.

## 3. Towers

Base stats are at level 1 (freshly built).

| Tower          | Cost $ | Damage | Range (tiles) | Fire rate (/s) | Targets      | Special                     |
|----------------|--------|--------|---------------|----------------|--------------|-----------------------------|
| Machine Gun    | 50     | 5      | 2.5           | 4              | Ground + Air | Single target (20 DPS)      |
| Mortar         | 180    | 40     | 3.5           | 0.5            | Ground       | Splash radius 1.0 tile      |
| Missiles (SAM) | 160    | 35     | 4.0           | 1              | Air          | Single target, air-only     |
| Sniper         | 250    | 120    | 8.0           | 0.2            | Ground + Air | Piercing line, band 0.4 tile |

### Target rules

- **Machine Gun** is the versatile generalist: it hits **both ground and air**,
  but its low damage means it only chips at tougher enemies and planes.
- **Mortar** hits **ground only** - the splash specialist for grouped ground waves.
- **Missiles** hit **air only** - the strong dedicated anti-air; a wave of planes
  needs Missiles, since Machine Guns alone cannot out-damage them.
- **Sniper** hits **both ground and air** with a piercing line (damages every
  enemy along its firing line). Very expensive and very slow (one shot every 5s) -
  a high-investment line nuke, not a sustained answer. *Tunable to watch:* because
  planes fly a straight Portal->Base line, one shot can pierce the whole plane
  column; range 8 is near board-wide, so cost and cooldown are the balancing levers
  (flag for playtesting; range/falloff/hit-cap can be revisited).
- Roles drive the buy order: early waves are about good Machine Gun coverage; the
  expensive specialists (Mortar, Missiles, Sniper) are deliberate commitments.

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

**Worked example - Mortar** (build cost 180):

- L2 upgrade costs 135; L3 upgrade costs 225.
- Fully upgraded: 80 damage, 4.2 range, 0.6 shots/s.
- Total invested to reach L3: 180 + 135 + 225 = **540**.

## 5. Economy

- **Starting money:** 180 - opens roughly 3 Machine Guns, so initial placement
  matters.
- **Starting lives:** 20. An enemy reaching the Base subtracts its "lives cost".
  At 0 lives -> **game over**.
- **Kill reward:** a small amount per kill (see [Enemies](#2-enemies)); not a
  viable income source on its own.
- **Wave clear bonus:** `20 + 7 * waveNumber`, paid when a wave is cleared. This
  is the **main income**, so income scales with how long you survive.
- **Selling:** a tower can be sold for **50% of its total investment** (build cost
  plus all upgrades paid), freeing its tile for repositioning.

**Sanity check:** start 180 -> 3 Machine Guns (150). Per-wave income is roughly the
clear bonus plus a few coins of kills (~30-50 early), so the first Missiles (160)
land around when planes arrive at wave 4 - skimping on a 4th Machine Gun to afford
anti-air early is a real decision. These numbers are a first balance pass, tuned in
config and meant to be iterated after playtesting.

## 6. Waves

"Wave after wave of increasing difficulty" = **endless**, with deterministic
scaling so balancing is predictable.

- **Enemy count:** `6 + 2 * waveNumber` enemies per wave.
- **HP scaling:** each enemy's base HP is multiplied by `1 + 0.18 * (waveNumber - 1)`.
- **Composition unlocks** (the wave's mix is drawn from the unlocked pool, weighted):
  - Waves 1-2: Soldiers only.
  - Wave 3+: Buggies enter the pool.
  - Wave 4+: **Planes** enter - bring Machine Guns or Missiles.
  - Wave 5+: Tanks enter.
  - Later waves: weighting shifts toward Tanks and Planes.
- **Spawn cadence:** enemies spawn from the Portal at a fixed interval (~0.8s),
  tightening slightly on higher waves.
- **Wave flow (automatic):** waves auto-advance. A build/prep countdown runs before
  each wave (~12s before the first, ~6s between) and the next wave starts when it
  reaches zero. The player can build at any time and can tap **Start Now** (or
  press Space) to skip the remaining countdown. Pause halts the countdown.

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
