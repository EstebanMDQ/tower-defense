import { AudioEngine } from "./AudioEngine";
import { MusicPlayer } from "./MusicPlayer";

/** Shared audio engine and music player used across scenes. */
export const audio = new AudioEngine();
export const music = new MusicPlayer(audio);

export type { SfxName } from "./presets";
