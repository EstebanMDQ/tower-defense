## 1. Configuration

- [x] 1.1 Create `src/config/towers.ts` with `TowerSpec` for Machine Gun, Mortar
      (splash), Missiles (cost, damage, range, fire rate, target class)
- [x] 1.2 Create `src/config/upgrades.ts` with tier multipliers and cost ratios

## 2. Tower entity

- [x] 2.1 Create `src/entities/Tower.ts` with position, type, current tier
- [x] 2.2 Compute effective stats from base spec x tier multipliers
- [x] 2.3 Implement firing cadence (accumulator on 1 / fire rate)
- [x] 2.4 Implement `upgrade()` with affordability and max-tier checks

## 3. Targeting and projectiles

- [x] 3.1 Create `src/systems/TargetingSystem.ts`: filter by target class, pick the
      eligible enemy closest to the Base within range
- [x] 3.2 Create `src/entities/Projectile.ts` for single-target travel + damage;
      discard with no damage if the target is removed before impact
- [x] 3.3 Implement Mortar splash: damage all eligible enemies within splash radius
      of impact

## 4. Placement

- [x] 4.1 Validate placement: buildable (map) -> unoccupied -> affordable -> deduct
      -> place
- [x] 4.2 Track tower occupancy so tiles cannot be double-built

## 5. Rendering

- [x] 5.1 Render towers and projectiles as procedural shapes
- [x] 5.2 Show tower range preview when a build tile is selected

## 6. Verification

- [x] 6.1 MG/Mortar never target planes; Missiles never target ground (unit tests)
- [x] 6.2 Targeting picks closest-to-base enemy in range
- [x] 6.3 Mortar splash damages all enemies in radius
- [x] 6.4 Placement and upgrade reject invalid/unaffordable cases without charging
