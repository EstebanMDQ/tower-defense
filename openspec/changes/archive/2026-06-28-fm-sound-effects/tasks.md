## 1. Preset library

- [x] 1.1 Create `src/audio/presets.ts`: an `SfxName` union, an `FmPatch` type
      (carrier freq, modulator ratio, modulation index, waveform, envelope ms,
      optional sweepTo and noise), and `SFX: Record<SfxName, FmPatch>` tuned per
      event (mgShot, mortarShot, missileShot, sniperShot, explosion, place, upgrade,
      sell, leak, waveStart, gameOver)

## 2. Audio engine

- [x] 2.1 Create `src/audio/AudioEngine.ts` with an injected AudioContext factory
      (lazy creation so the module imports safely in Node)
- [x] 2.2 Implement `play(name)`: build the FM graph (carrier + modulator + mod gain
      + amp envelope, optional pitch sweep and noise burst) from the patch and
      schedule it through a master gain
- [x] 2.3 Implement `resume()` and `setMuted(bool)`; `play` is a no-op when muted or
      no context
- [x] 2.4 Throttle: suppress a repeat of the same `SfxName` within its minimum
      interval

## 3. Music player (placeholder)

- [x] 3.1 Create `src/audio/song.ts`: `Song`/`Note` types and `SONG` - an empty
      placeholder (`notes: []`, `loop: true`) with a commented example and a
      "compose your chiptune here" marker
- [x] 3.2 Create `src/audio/MusicPlayer.ts`: a look-ahead scheduler that plays the
      song's notes (MIDI -> frequency) through the FM voice, loops when set, with
      `start()` / `stop()`, gated by mute

## 4. Triggers and controls

- [x] 4.1 Add decoupled hooks: `onFire(towerType)` on `TowerManager`,
      `onKill(enemyType)` and `onLeak()` on `EnemyManager`
- [x] 4.2 In `GameScene`, create the engine + music player, resume on the start
      gesture (Menu), and wire sounds: fire (per tower type), explosion on kill,
      leak buzz, place/upgrade/sell on successful actions, wave start (phase ->
      active), game over (economy signal); start music on run start, stop on game over
- [x] 4.3 Add a mute toggle button to `HUDScene` and an `M` key in `GameScene`

## 5. Verification

- [x] 5.1 Unit test: every `SfxName` has a valid patch (positive duration, defined
      oscillator params)
- [x] 5.2 Unit test (mock AudioContext): `play` creates a voice when unmuted and
      none when muted
- [x] 5.3 Unit test (mock AudioContext): a same-sound repeat within the minimum
      interval is suppressed; after the interval it plays
- [x] 5.4 Unit test: the placeholder `SONG` is empty (schedules nothing); a sample
      non-empty looping song schedules its notes
- [x] 5.5 Typecheck, tests, and build pass; sounds are audible in the running game
      and the empty placeholder song stays silent
