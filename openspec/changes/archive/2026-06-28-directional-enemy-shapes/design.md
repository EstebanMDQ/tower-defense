## Context

`Enemy.update` already moves toward the next waypoint (ground) or the base (air)
each frame, so the movement direction is available where it advances position. The
scene's `drawEnemies` currently draws an un-rotated circle (ground) or a fixed
triangle (air) per enemy from `EnemyManager.getEnemies()`. We add a facing angle on
the enemy and orient the drawn shapes to it.

## Goals / Non-Goals

**Goals:**
- A facing `angle` per enemy that points along its movement and eases toward
  direction changes at a per-type rate.
- Oriented, more unit-like shapes using only procedural drawing.
- Keep the heading math Phaser-free and unit-testable; no gameplay change.

**Non-Goals:**
- Sprites/textures or animation frames.
- Independent turret aiming (the tank turret is cosmetic, aligned to the hull).
- Banking/roll for planes or suspension/tilt - rotation only.

## Decisions

- **Angle convention.** `angle` is in radians as `atan2(dy, dx)` - 0 points along
  +x (right), increasing clockwise in screen space (y is down). Every shape is
  authored with its "forward" along local +x, so rotating local vertices by `angle`
  orients the nose/front correctly.
- **Facing angle on `Enemy`.** Add a public `angle` field. Each `update`, **after**
  advancing position/`wpIndex`, compute the desired heading toward the post-update
  current target (`waypoints[wpIndex]` for ground, the base for air):
  `atan2(target.y - y, target.x - x)`. If that toward-target vector is near-zero
  length (the enemy is essentially at its target / the base), keep the previous
  angle.
- **Eased rotation.** Rotate `angle` toward the desired heading by at most
  `turnRate * dt`, taking the shortest angular path (normalize the delta to
  [-pi, pi]). This gives the visible turn-through-corners behavior; a high
  `turnRate` approximates an instant snap.
- **Per-type `turnRate` in config** (radians/second), distinct per unit:
  - Tank - low (slow, clearly visible pivot on turns).
  - Buggy - medium.
  - Soldier - high (turns almost immediately).
  - Plane - high-ish (points forward, turns quickly but smoothly).
- **Initial angle.** At spawn, set `angle` directly to the heading toward the first
  target so units don't visibly swing from a default orientation on their first
  frame. If the first target coincides with the spawn position (degenerate
  `atan2(0,0)`), fall back to angle 0.
- **Per-type turn rate** (radians/second, in config): Tank 3 (slow, clearly visible
  pivot), Buggy 8, Soldier 12 (near-instant), Plane 10.
- **Oriented rendering in `GameScene`.** For each enemy, author the shape's local
  vertices with forward along +x, rotate them around the enemy center by `angle`
  (2D rotation), then fill via the existing dynamic graphics layer. Rectangle
  dimensions derive from the type's `radius` (e.g. length `2*radius` along forward,
  width `1.4*radius`), so no new size config is needed:
  - Plane: isoceles triangle with the nose vertex along +x.
  - Tank: rectangle hull plus a short turret line from center along +x.
  - Buggy: small rectangle, longer along +x.
  - Soldier: small circle (rotation-invariant) plus a short nub drawn along +x to
    show direction.
  Health bars stay axis-aligned above the unit (unchanged).

## Risks / Trade-offs

- Computing the heading from the toward-target vector (rather than actual
  per-frame displacement) keeps it stable at low frame rates and avoids
  zero-length velocity at waypoint boundaries.
- Manual vertex rotation in immediate-mode graphics is a little more code than
  using rotated Phaser game objects, but it preserves the existing redraw-each-frame
  rendering approach and keeps the change contained.
- A circle for the Soldier can't show rotation on its own; the small facing nub
  conveys direction without changing the silhouette.
