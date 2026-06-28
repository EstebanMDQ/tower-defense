## 1. State machine

- [x] 1.1 Add Menu and Game Over scenes; controller switching Menu -> Playing ->
      Game Over
- [x] 1.2 Implement run initialization and full reset on start/restart (new seed,
      reset economy and waves)
- [x] 1.3 Subscribe to the economy game-over signal; transition to Game Over with
      the wave reached

## 2. HUD

- [x] 2.1 Render money/lives/wave labels in `HUDScene`, updated from economy and
      wave events
- [x] 2.2 Build palette: select tower type -> tap tile -> invoke placement; show
      success/failure and a range preview; disable unaffordable entries
- [x] 2.3 Tower selection panel with upgrade action (disabled at max tier or when
      unaffordable)
- [x] 2.4 Start-wave control shown during build phase, hidden during active wave

## 3. Optional controls

- [x] 3.1 Pause toggle (halts gameplay updates)
- [x] 3.2 Speed-up toggle (increases gameplay rate)

## 4. Verification

- [x] 4.1 Full loop: start -> build -> start wave -> survive/lose -> game over ->
      restart
- [x] 4.2 HUD reflects money/lives/wave changes via events
- [x] 4.3 Build palette and upgrade respect affordability and validity feedback
