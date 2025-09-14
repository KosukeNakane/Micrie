import * as Tone from 'tone';
import { usePianoSampler } from '@/entities/audio';

// Chords の発音ロジックをカプセル化
// - chordToNotes: ルート・クオリティ・テンションからノート配列へ展開
// - playChordAt: 指定ノート群を所定の time/duration で発音
export const useChordsPlayer = () => {
  const samplerRef = usePianoSampler('chord');

  const NOTES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'] as const;

  const chordToNotes = (
    rootIndex: number,
    quality: 'maj' | 'min' | 'dim' | 'aug',
    tension: '' | 'maj7' | '7' | '6' | '9' | '11' | '13'
  ): string[] => {
    const rootName = `${NOTES[rootIndex]}3`;
    let rootMidi = 60;
    try { rootMidi = Tone.Frequency(rootName).toMidi(); } catch {}
    const intervals = quality === 'min' ? [0, 3, 7]
      : quality === 'dim' ? [0, 3, 6]
      : quality === 'aug' ? [0, 4, 8]
      : [0, 4, 7];
    const ext = tension === 'maj7' ? 11
      : tension === '7' ? 10
      : tension === '6' ? 9
      : tension === '9' ? 14
      : tension === '11' ? 17
      : tension === '13' ? 21
      : null;
    const mids = intervals.map((iv) => rootMidi + iv);
    if (ext !== null) mids.push(rootMidi + ext);
    return mids.map((m) => (m > 84 ? Tone.Frequency(m - 12, 'midi').toNote() : Tone.Frequency(m, 'midi').toNote()));
  };

  const playChordAt = (notes: string[], time: number, duration: number) => {
    try {
      notes.forEach((n) => samplerRef.current?.triggerAttackRelease(n, duration, time));
    } catch {}
  };

  return { chordToNotes, playChordAt } as const;
};

