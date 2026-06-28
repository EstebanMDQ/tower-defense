## Context

No audio capability exists yet. The game already establishes a user gesture (the
Menu "tap to start", which also requests fullscreen and the wake lock) - the natural
place to resume a Web Audio context under autoplay rules. Several systems already
expose change events (economy, waves); for fire/kill/leak we add small callbacks so
the scene can react without those systems knowing about audio.

## Goals / Non-Goals

**Goals:**
- Code-generated 80s arcade sound via FM synthesis - no audio files.
- A distinct, recognizable effect per game event.
- Autoplay-safe, mutable, and not spammy on rapid fire.
- Keep the patch data pure/testable; keep systems audio-agnostic.

**Non-Goals:**
- Composing the actual chiptune melody - the looping music player and a song data
  format are built, but the song ships empty for the project owner to compose.
- A full synth/mixer, reverb, or per-sound volume UI (one master mute only).
- Spatial/positional audio.

## Decisions

- **FM voice.** One carrier `OscillatorNode` whose frequency is modulated by a
  modulator oscillator through a gain node (the modulation index). An amplitude
  `GainNode` applies a short envelope (attack + exponential decay). Optional: a
  linear pitch sweep on the carrier (for zaps/booms) and a short filtered
  **noise burst** (a one-shot `AudioBufferSourceNode` of random samples) layered in
  for explosions. This small graph covers blips, zaps, thuds, and booms.
- **Pure preset library** `src/audio/presets.ts`: an `SfxName` union and
  `SFX: Record<SfxName, FmPatch>`, where `FmPatch` is plain data
  (carrier freq, modulator ratio, modulation index, waveform, envelope ms,
  sweepTo?, noise?). This is unit-testable without a browser. Patches are tuned per
  event:
  - `mgShot` short high blip; `mortarShot` low thud; `missileShot` rising zap;
    `sniperShot` big descending boom; `explosion` noise + downward FM;
    `place` confirm beep; `upgrade` rising two-note; `sell` falling two-note;
    `leak` harsh buzz; `waveStart` bright fanfare; `gameOver` slow descending tones.
- **AudioEngine** `src/audio/AudioEngine.ts`: constructed with an injected
  `AudioContext` factory (defaulting to the browser's), created lazily so importing
  the module is safe in Node tests. Methods: `resume()` (called on the start
  gesture), `setMuted(bool)`, and `play(name)`. `play` builds the FM graph from the
  patch and schedules it; when muted (or context unavailable) it is a no-op.
- **Throttling.** `play` records the last time each `SfxName` was played and
  suppresses a repeat within a small per-sound minimum interval (e.g. 60-80 ms),
  so the 4/second machine gun stays crisp instead of a buzz.
- **Triggers, decoupled.** Add optional callbacks `onFire(towerType)` to
  `TowerManager` and `onKill(enemyType)` / `onLeak()` to `EnemyManager`; `GameScene`
  sets them to call `audio.play(...)`. Place/upgrade/sell play on the existing
  successful HUD actions; wave start and game over hook the existing
  `WaveManager.onPhaseChanged("active")` and `Economy.onGameOver`.
- **Mute UI.** A compact mute button in the HUD top row and an `M` key toggle,
  driving `audio.setMuted`.
- **Music player (placeholder).** A simple data-driven looping sequencer so the
  owner can compose later without touching engine code:
  - `src/audio/song.ts` defines `Song { bpm: number; loop: boolean; notes: Note[] }`
    where `Note { beat: number; midi: number; beats: number }`, and exports
    `SONG` - an **empty placeholder** (`notes: []`, so it is silent) with a commented
    example and a "compose your chiptune here" marker.
  - `src/audio/MusicPlayer.ts` schedules the song's notes through the FM voice on a
    Web Audio look-ahead timer, converting MIDI -> frequency, looping when
    `loop` is set. `start()` / `stop()`; respects the same mute. With the empty
    placeholder it simply plays nothing until notes are added.
  - `GameScene` starts the music when a run begins and stops it on game over.

## Risks / Trade-offs

- Web Audio is browser-only; the engine is therefore not exercised by the Node test
  suite directly. Mitigation: the patch library is pure and tested, and the muted/
  throttle gating is tested with a counting mock `AudioContext`, so the untested
  surface is just the actual node scheduling.
- Many simultaneous voices (a big wave wipe) could get loud; a master gain with
  modest level and the throttle keep it bounded. A hard voice cap can be added if
  needed.
- FM patches are subjective; values are a first pass in one file, easy to tune.
