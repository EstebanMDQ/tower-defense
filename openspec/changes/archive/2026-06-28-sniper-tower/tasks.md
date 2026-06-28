## 1. Configuration

- [x] 1.1 Add an `attack` mode field to `TowerSpec` (`"single" | "splash" | "pierce"`,
      default single); set Mortar to `splash` and keep its splash radius
- [x] 1.2 Add a `pierceWidth` (tiles) field to `TowerSpec` (used by pierce; 0.4 for
      the Sniper)
- [x] 1.3 Add the Sniper to `TOWERS`: cost 250, damage 120, range 8, fireRate 0.2,
      targets ground + air, attack `pierce`, pierceWidth 0.4, plus color fields
      (projectileSpeed is a placeholder - unused by hitscan)
- [x] 1.4 Add `sniper` to `TOWER_TYPES`

## 2. Piercing line attack

- [x] 2.1 Change `TowerManager.fire(tower, target)` to `fire(tower, target, enemies)`
      and branch on the tower's attack mode (the enemies list is already in scope in
      `update`)
- [x] 2.2 Implement pierce (hitscan, no projectile): from the tower along the aim
      direction (tower -> primary target) out to `rangePx`, damage every eligible
      enemy with perpendicular distance to the line `<= pierceWidth*tileSize` and
      projection within `[0, rangePx]`, applied immediately
- [x] 2.3 Respect the tower's target classes when selecting who the line damages

## 3. Beam + rendering

- [x] 3.1 Add a `beams` list to `TowerManager` (`{x1,y1,x2,y2,age,duration}`); push
      one on a pierce fire, advance/expire in `update`, expose `getBeams()`
- [x] 3.2 In `GameScene`, draw each beam as a brief fading line
- [x] 3.3 Render the Sniper tower body distinctly; show its (long) range on select
- [x] 3.4 Add keyboard `4` to select the Sniper in `GameScene`

## 4. HUD

- [x] 4.1 Add the Sniper as a fourth build-palette button in `HUDScene`. The current
      palette is three buttons across one row; a fourth does not fit, so rework the
      palette into a 2x2 grid (or four narrower buttons) - a layout change only, no
      HUD requirement change

## 5. Verification

- [x] 5.1 Unit test: a pierce shot damages multiple enemies aligned on the line
- [x] 5.2 Unit test: enemies off the line take no damage
- [x] 5.3 Unit test: Sniper config matches the design values; targets both classes
- [x] 5.4 Typecheck, tests, and build pass; Sniper is placeable from the palette
