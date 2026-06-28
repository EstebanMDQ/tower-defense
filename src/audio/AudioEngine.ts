import { SFX, type FmPatch, type SfxName } from "./presets";

const MASTER_LEVEL = 0.5;
const DEFAULT_THROTTLE = 0.04;

/**
 * Runtime FM-synthesis sound engine (Web Audio). The audio context is created
 * lazily via an injected factory, so importing this module is safe in Node tests
 * (a mock context can be supplied). Playback is a no-op while muted or before the
 * context is resumed.
 */
export class AudioEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private muted = false;
  private lastPlayed = new Map<SfxName, number>();

  constructor(
    private readonly ctxFactory: () => AudioContext = () => new AudioContext(),
  ) {}

  /** Create (if needed) and resume the context. Must be called from a user gesture. */
  resume(): void {
    if (!this.ctx) {
      this.ctx = this.ctxFactory();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.muted ? 0 : MASTER_LEVEL;
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === "suspended") void this.ctx.resume();
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    if (this.master) this.master.gain.value = muted ? 0 : MASTER_LEVEL;
  }

  isMuted(): boolean {
    return this.muted;
  }

  getContext(): AudioContext | null {
    return this.ctx;
  }

  getMaster(): GainNode | null {
    return this.master;
  }

  /** Play a named effect (no-op when muted, no context, or throttled). */
  play(name: SfxName): void {
    if (this.muted || !this.ctx || !this.master) return;
    const patch = SFX[name];
    const now = this.ctx.currentTime;
    const last = this.lastPlayed.get(name) ?? -Infinity;
    if (now - last < (patch.throttle ?? DEFAULT_THROTTLE)) return;
    this.lastPlayed.set(name, now);
    playPatch(this.ctx, this.master, patch, now);
  }
}

/** Build and schedule one FM voice (carrier + modulator + envelope, optional noise). */
function playPatch(
  ctx: AudioContext,
  dest: AudioNode,
  patch: FmPatch,
  t0: number,
): void {
  const end = t0 + patch.attack + patch.decay;

  const amp = ctx.createGain();
  amp.gain.setValueAtTime(0.0001, t0);
  amp.gain.exponentialRampToValueAtTime(patch.gain, t0 + patch.attack);
  amp.gain.exponentialRampToValueAtTime(0.0001, end);
  amp.connect(dest);

  const carrier = ctx.createOscillator();
  carrier.type = patch.carrierWave;
  carrier.frequency.setValueAtTime(patch.freq, t0);
  if (patch.sweepTo !== undefined) {
    carrier.frequency.exponentialRampToValueAtTime(Math.max(1, patch.sweepTo), end);
  }
  carrier.connect(amp);

  const mod = ctx.createOscillator();
  mod.type = patch.modWave;
  mod.frequency.setValueAtTime(patch.freq * patch.modRatio, t0);
  const modGain = ctx.createGain();
  modGain.gain.setValueAtTime(patch.modIndex, t0);
  mod.connect(modGain);
  modGain.connect(carrier.frequency);

  carrier.start(t0);
  mod.start(t0);
  carrier.stop(end + 0.02);
  mod.stop(end + 0.02);

  if (patch.noise) playNoise(ctx, dest, patch.noise, t0);
}

function playNoise(
  ctx: AudioContext,
  dest: AudioNode,
  noise: { gain: number; decay: number },
  t0: number,
): void {
  const len = Math.max(1, Math.floor(ctx.sampleRate * (noise.decay + 0.02)));
  const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;

  const src = ctx.createBufferSource();
  src.buffer = buffer;
  const g = ctx.createGain();
  g.gain.setValueAtTime(noise.gain, t0);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + noise.decay);
  src.connect(g);
  g.connect(dest);
  src.start(t0);
  src.stop(t0 + noise.decay + 0.02);
}
