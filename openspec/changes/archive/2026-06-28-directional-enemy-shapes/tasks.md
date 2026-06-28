## 1. Configuration

- [x] 1.1 Add a per-type `turnRate` (radians/second) to the enemy config: Tank 3,
      Buggy 8, Soldier 12, Plane 10

## 2. Facing angle on Enemy

- [x] 2.1 Add a public `angle` field to `Enemy`; initialize it toward the first
      target (`atan2`), falling back to 0 if the first target equals the spawn point
- [x] 2.2 In `update`, after advancing position, compute the desired heading toward
      the post-update current target and ease `angle` toward it by at most
      `turnRate * dt` along the shortest angular path (delta normalized to [-pi,pi]);
      keep the previous angle if the toward-target vector is near-zero length

## 3. Oriented rendering

- [x] 3.1 In `GameScene.drawEnemies`, rotate each shape's vertices around the enemy
      center by `angle` and fill on the dynamic layer:
      - Plane: triangle, nose vertex forward
      - Tank: rectangle hull + short turret line along the facing
      - Buggy: small rectangle (longer along the facing)
      - Soldier: circle + a short facing nub
- [x] 3.2 Keep health bars axis-aligned above each unit

## 4. Verification

- [x] 4.1 Unit test: after moving along a straight segment, `angle` matches the
      movement direction
- [x] 4.2 Unit test: a low-turn-rate enemy rotates toward a new heading gradually
      (partial turn after one small step), not instantly
- [x] 4.3 Unit test: initial `angle` equals the heading toward the first target
- [x] 4.4 Typecheck, tests, and build pass; orientation is visible in the running
      game (planes point forward, tanks pivot on turns)
