import { describe, it, expect } from "vitest";
import { AudioEngine } from "../src/audio/AudioEngine";
import { MusicPlayer } from "../src/audio/MusicPlayer";
import { SFX, type SfxName } from "../src/audio/presets";
import { SONG, songLengthBeats, midiToFreq, type Song } from "../src/audio/song";

/** Minimal counting mock of the Web Audio API surface the engine uses. */
function makeMockCtx() {
  const param = () => ({
    value: 0,
    setValueAtTime() {},
    exponentialRampToValueAtTime() {},
    linearRampToValueAtTime() {},
  });
  const ctx = {
    currentTime: 0,
    state: "running" as const,
    sampleRate: 44100,
    oscCount: 0,
    destination: {},
    resume: () => Promise.resolve(),
    createGain: () => ({ gain: param(), connect() {} }),
    createOscillator() {
      ctx.oscCount++;
      return { type: "", frequency: param(), connect() {}, start() {}, stop() {} };
    },
    createBuffer: (_c: number, len: number) => ({
      getChannelData: () => new Float32Array(len),
    }),
    createBufferSource: () => ({ buffer: null, connect() {}, start() {}, stop() {} }),
  };
  return ctx;
}

function engineWithMock() {
  const ctx = makeMockCtx();
  const engine = new AudioEngine(() => ctx as unknown as AudioContext);
  engine.resume();
  return { ctx, engine };
}

describe("SFX presets", () => {
  it("every effect has a valid patch", () => {
    const names = Object.keys(SFX) as SfxName[];
    expect(names.length).toBeGreaterThan(0);
    for (const name of names) {
      const p = SFX[name];
      expect(p.freq).toBeGreaterThan(0);
      expect(p.attack + p.decay).toBeGreaterThan(0); // positive duration
      expect(p.modRatio).toBeGreaterThan(0);
      expect(p.gain).toBeGreaterThan(0);
    }
  });
});

describe("AudioEngine", () => {
  it("creates a voice when unmuted and none when muted", () => {
    const { ctx, engine } = engineWithMock();
    engine.play("place");
    expect(ctx.oscCount).toBeGreaterThan(0);

    const before = ctx.oscCount;
    engine.setMuted(true);
    engine.play("place");
    expect(ctx.oscCount).toBe(before); // muted: no new voice
  });

  it("throttles repeats of the same sound within the minimum interval", () => {
    const { ctx, engine } = engineWithMock();
    ctx.currentTime = 0;
    engine.play("mgShot");
    const after1 = ctx.oscCount;
    expect(after1).toBeGreaterThan(0);

    // Same sound again immediately -> suppressed.
    engine.play("mgShot");
    expect(ctx.oscCount).toBe(after1);

    // After the throttle interval -> plays again.
    ctx.currentTime = 0.2;
    engine.play("mgShot");
    expect(ctx.oscCount).toBeGreaterThan(after1);
  });
});

describe("MusicPlayer", () => {
  it("the placeholder song is empty and schedules nothing", () => {
    expect(songLengthBeats(SONG)).toBe(0);
    const { ctx, engine } = engineWithMock();
    const player = new MusicPlayer(engine, SONG);
    player.start();
    player.stop();
    expect(ctx.oscCount).toBe(0);
  });

  it("schedules a non-empty looping song's notes", () => {
    const song: Song = {
      bpm: 120,
      loop: true,
      notes: [
        { beat: 0, midi: 60, beats: 1 },
        { beat: 1, midi: 64, beats: 1 },
        { beat: 2, midi: 67, beats: 1 },
      ],
    };
    const { ctx, engine } = engineWithMock();
    const player = new MusicPlayer(engine, song);
    player.start();
    player.stop();
    // One oscillator per note in the first scheduled loop.
    expect(ctx.oscCount).toBe(3);
  });

  it("midiToFreq maps A4 to 440 Hz", () => {
    expect(midiToFreq(69)).toBeCloseTo(440);
  });
});
