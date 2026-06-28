## 1. Configuration

- [x] 1.1 Create `src/config/explosions.ts` with a per-`EnemyType` explosion config:
      particle count, color palette, base speed, particle size, lifetime, gravity/
      downward bias - distinct values for Soldier, Buggy, Tank, Plane

## 2. Death explosions in EnemyManager

- [x] 2.1 Add a `Particle { x, y, vx, vy, color, size, age, life }` model and a
      `particles` list to `EnemyManager`
- [x] 2.2 Each frame, advance existing particles FIRST (position, gravity, age;
      remove expired), THEN on the kill branch (enemy not alive) spawn the type's
      burst at the enemy position with `age = 0`; do NOT spawn on base arrival
- [x] 2.3 Expose `getParticles()`

## 3. Rendering

- [x] 3.1 In `GameScene`, draw each particle on the dynamic layer as a small fading
      shape (circle, or square for heavier debris), alpha by `age / life`

## 4. Verification

- [x] 4.1 Unit test: killing an enemy spawns particles at its position; the count
      matches that type's config
- [x] 4.2 Unit test: different types produce different particle configs; a
      base-arrival (leak) spawns no particles
- [x] 4.3 Unit test: particles are removed after their lifetime; reward/removal
      behavior is unchanged
- [x] 4.4 Typecheck, tests, and build pass; explosions are visible in the running
      game
