export interface Note {
  /** Start time in beats from the loop's beginning. */
  beat: number;
  /** MIDI note number (60 = middle C, 69 = A4 = 440 Hz). */
  midi: number;
  /** Duration in beats. */
  beats: number;
}

export interface Song {
  bpm: number;
  loop: boolean;
  notes: Note[];
}

/**
 * Background chiptune - COMPOSE YOUR MELODY HERE.
 *
 * The music player loops this song through the FM voice. While `notes` is empty
 * the game is silent (this is an intentional placeholder). Add notes to compose,
 * no engine changes needed. The loop length is the latest note end (beat + beats).
 *
 * Example:
 *   notes: [
 *     { beat: 0, midi: 60, beats: 1 }, // C4 for one beat
 *     { beat: 1, midi: 64, beats: 1 }, // E4
 *     { beat: 2, midi: 67, beats: 2 }, // G4 held for two beats
 *   ]
 */
export const SONG: Song = {
  bpm: 120,
  loop: true,
  notes: [],
};

/** MIDI note number to frequency in Hz. */
export function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

/** Loop length in beats (the latest note end); 0 for an empty song. */
export function songLengthBeats(song: Song): number {
  let end = 0;
  for (const n of song.notes) end = Math.max(end, n.beat + n.beats);
  return end;
}
