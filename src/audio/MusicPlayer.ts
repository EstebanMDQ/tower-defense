import type { AudioEngine } from "./AudioEngine";
import { SONG, midiToFreq, songLengthBeats, type Song } from "./song";

const LOOKAHEAD_MS = 100;
const SCHEDULE_AHEAD = 0.2;
const NOTE_GAIN = 0.16;

/**
 * Looping chiptune player. Schedules the song's notes through a simple FM-ish
 * square voice on a Web Audio look-ahead timer. With the empty placeholder song it
 * schedules nothing (silent). Mute is handled by the engine's master gain.
 */
export class MusicPlayer {
  private timer: ReturnType<typeof setInterval> | null = null;
  private playing = false;
  private nextLoopTime = 0;

  constructor(
    private readonly engine: AudioEngine,
    private song: Song = SONG,
  ) {}

  setSong(song: Song): void {
    this.song = song;
  }

  start(): void {
    if (this.playing) return;
    const ctx = this.engine.getContext();
    if (!ctx) return;
    this.playing = true;
    this.nextLoopTime = ctx.currentTime + 0.05;
    this.scheduleDue();
    this.timer = setInterval(() => this.scheduleDue(), LOOKAHEAD_MS);
  }

  stop(): void {
    this.playing = false;
    if (this.timer !== null) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  isPlaying(): boolean {
    return this.playing;
  }

  /** Schedule any loop iterations whose start falls within the look-ahead window. */
  private scheduleDue(): void {
    const ctx = this.engine.getContext();
    if (!ctx || !this.playing) return;
    const beatDur = 60 / this.song.bpm;
    const loopDur = songLengthBeats(this.song) * beatDur;
    if (loopDur <= 0) return; // empty placeholder - nothing to play

    while (this.nextLoopTime < ctx.currentTime + SCHEDULE_AHEAD) {
      this.scheduleLoop(this.nextLoopTime, beatDur);
      this.nextLoopTime += loopDur;
      if (!this.song.loop) {
        this.stop();
        return;
      }
    }
  }

  private scheduleLoop(base: number, beatDur: number): void {
    const ctx = this.engine.getContext();
    const dest = this.engine.getMaster();
    if (!ctx || !dest) return;
    for (const note of this.song.notes) {
      this.scheduleNote(
        ctx,
        dest,
        midiToFreq(note.midi),
        base + note.beat * beatDur,
        note.beats * beatDur,
      );
    }
  }

  private scheduleNote(
    ctx: AudioContext,
    dest: AudioNode,
    freq: number,
    t0: number,
    dur: number,
  ): void {
    const osc = ctx.createOscillator();
    osc.type = "square";
    osc.frequency.setValueAtTime(freq, t0);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(NOTE_GAIN, t0 + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g);
    g.connect(dest);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }
}
