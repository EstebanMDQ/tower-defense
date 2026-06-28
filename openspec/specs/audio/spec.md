# audio Specification

## Purpose
TBD - created by archiving change fm-sound-effects. Update Purpose after archive.
## Requirements
### Requirement: Procedural FM sound effects

The game SHALL synthesize its sound effects at runtime using FM synthesis (no audio
asset files), with a distinct effect defined for each key game event: machine-gun
shot, mortar shot, missile shot, sniper shot, enemy explosion, tower placed, tower
upgraded, tower sold, life lost, wave start, and game over.

#### Scenario: A preset exists for every event

- **WHEN** the sound preset library is read
- **THEN** every game-event sound name maps to a valid FM patch (positive duration
  and defined oscillator parameters)

#### Scenario: No audio assets

- **WHEN** the game produces a sound
- **THEN** it is generated from oscillators at runtime, not loaded from an audio file

### Requirement: Autoplay-safe startup

The audio engine SHALL respect browser autoplay policy: its audio context starts
suspended and is resumed on a user gesture before any sound plays.

#### Scenario: Resume on first gesture

- **WHEN** the player makes the first interaction that starts the game
- **THEN** the audio context is resumed, after which sounds can play

### Requirement: Mute control

The player SHALL be able to mute and unmute all sound; while muted, triggering any
sound produces no audio.

#### Scenario: Muted produces no sound

- **WHEN** audio is muted and a sound is triggered
- **THEN** no audio voice is created or played

#### Scenario: Unmute restores sound

- **WHEN** audio is unmuted after being muted
- **THEN** subsequently triggered sounds play again

### Requirement: Rapid-fire throttling

Repeated triggers of the same sound effect SHALL be throttled to a minimum interval
so rapid events (such as the machine gun) do not overlap into noise.

#### Scenario: Repeat within the interval is suppressed

- **WHEN** the same sound is triggered again within its minimum interval
- **THEN** the repeat is suppressed and no second voice is created

#### Scenario: Repeat after the interval plays

- **WHEN** the same sound is triggered again after its minimum interval has elapsed
- **THEN** it plays normally

### Requirement: Looping music with a placeholder song

The game SHALL provide a looping music player that plays a song defined as data
(notes with timing), and SHALL ship with an empty placeholder song intended to be
composed later. The player SHALL respect the mute control.

#### Scenario: Empty placeholder is silent

- **WHEN** the music player starts with the shipped placeholder song (no notes)
- **THEN** no notes are scheduled and no music is heard

#### Scenario: A composed song loops

- **WHEN** the music player starts with a non-empty song marked to loop
- **THEN** its notes are scheduled in order and repeat when the song ends

#### Scenario: Mute silences music

- **WHEN** audio is muted
- **THEN** the music player produces no sound

