## 1. Configuration

- [x] 1.1 Create `src/config/enemies.ts` with the typed stat table for Soldier,
      Buggy, Tank, Plane (HP, speed, reward, lives cost, target class)

## 2. Enemy entity

- [x] 2.1 Create `src/entities/Enemy.ts` storing type, max/current HP, position,
      and target class
- [x] 2.2 Apply the wave-supplied HP scaling factor at spawn
- [x] 2.3 Implement `takeDamage(amount)`; on HP <= 0, die and grant reward via
      Economy
- [x] 2.4 Render the enemy as a procedural shape per type

## 3. Movement

- [x] 3.1 Implement ground path-following along waypoints at tiles/second, clamped
      per segment to avoid overshoot
- [x] 3.2 Implement plane straight-line flight along the air route
- [x] 3.3 On reaching the Base, apply lives cost via Economy and remove the enemy

## 4. Verification

- [x] 4.1 Ground enemy reaches the Base by traversing all waypoints
- [x] 4.2 Plane reaches the Base via the straight route, ignoring the path
- [x] 4.3 Death grants the reward; base-arrival applies lives cost (no reward)
- [x] 4.4 HP scaling factor is applied correctly at spawn
