## 1. Configuration

- [ ] 1.1 Create `src/config/enemies.ts` with the typed stat table for Soldier,
      Buggy, Tank, Plane (HP, speed, reward, lives cost, target class)

## 2. Enemy entity

- [ ] 2.1 Create `src/entities/Enemy.ts` storing type, max/current HP, position,
      and target class
- [ ] 2.2 Apply the wave-supplied HP scaling factor at spawn
- [ ] 2.3 Implement `takeDamage(amount)`; on HP <= 0, die and grant reward via
      Economy
- [ ] 2.4 Render the enemy as a procedural shape per type

## 3. Movement

- [ ] 3.1 Implement ground path-following along waypoints at tiles/second, clamped
      per segment to avoid overshoot
- [ ] 3.2 Implement plane straight-line flight along the air route
- [ ] 3.3 On reaching the Base, apply lives cost via Economy and remove the enemy

## 4. Verification

- [ ] 4.1 Ground enemy reaches the Base by traversing all waypoints
- [ ] 4.2 Plane reaches the Base via the straight route, ignoring the path
- [ ] 4.3 Death grants the reward; base-arrival applies lives cost (no reward)
- [ ] 4.4 HP scaling factor is applied correctly at spawn
