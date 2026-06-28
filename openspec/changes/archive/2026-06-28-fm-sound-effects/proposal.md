## Why

The game is silent. Sound is the cheapest, highest-impact way to make actions feel
responsive - a shot, a kill, a wave starting. Matching the procedural-shapes
aesthetic, the audio should also be code-generated (no asset files) and lean into an
80s arcade feel. FM synthesis gives exactly that family of bright, metallic,
chiptune-adjacent timbres from a tiny amount of code.

## What Changes

- Add a small **FM synthesizer audio engine** built on the Web Audio API: a carrier
  oscillator frequency-modulated by a second oscillator, shaped by a gain envelope,
  with an optional pitch sweep and a noise burst for explosions. No audio files.
- Define a **preset per game event** (an FM patch): machine-gun shot, mortar thud,
  missile zap, sniper boom, enemy explosion, tower placed, tower upgraded, tower
  sold, life lost, wave start, and game over - tuned for a punchy 80s arcade
  character.
- **Trigger** these on the matching events (fire, kill, place/upgrade/sell, wave
  start, leak, game over).
- Respect browser **autoplay policy**: the audio context starts suspended and
  resumes on the first user gesture (the existing start tap).
- Add a **mute toggle** (HUD button + key) that silences all sound.
- **Throttle** rapid identical effects (e.g. the machine gun firing 4x/second) so
  audio does not turn into a buzz.
- Add a **looping chiptune music player** plus an **empty placeholder song** in a
  data file. The engine and the player are built and wired up; the actual melody is
  left for the project owner to compose (the placeholder is silent until filled in).

## Capabilities

### New Capabilities
- `audio`: a runtime FM-synthesis sound engine with an event-driven preset library,
  autoplay-safe startup, a mute control, rapid-fire throttling, and a looping
  chiptune music player that plays a data-defined song (shipped as an empty
  placeholder to be composed later).

## Impact

- New `src/audio/presets.ts` (pure FM patch data per event),
  `src/audio/AudioEngine.ts` (Web Audio playback), `src/audio/MusicPlayer.ts`
  (looping sequencer), and `src/audio/song.ts` (empty placeholder song to compose).
  Triggers wired in `src/scenes/GameScene.ts`
  (fire/kill/place/upgrade/sell/wave/leak/game-over, plus start/stop music) and a
  mute button in `src/scenes/HUDScene.ts`; context resume in `src/scenes/MenuScene.ts`.
- Small event hooks added to `TowerManager` (on fire) and `EnemyManager` (on kill /
  on leak) so the scene can play sounds without coupling those systems to audio.
- No new dependencies; uses the browser Web Audio API.
