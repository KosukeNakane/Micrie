//現在未使用　Tone.jsでメロディーを再生する
//client/src/hooks/useChordsLoop.ts

import { useEffect, useRef } from 'react';
import { useTempo } from '../context/TempoContext';

declare const _tone_0000_Aspirin_sf2_file: any;

type Chord = string[]; // 例: ['C4', 'E4', 'G4']

export const useChordsLoop = (
  isChordsPlaying: boolean
) => {
  const { tempo } = useTempo();
  const chords: Chord[] = [
    ['F3'],
    ['F3', 'A3', 'C4', 'E4'],
    ['F3'],
    ['F3', 'A3', 'C4', 'E4'],
    ['E3'],
    ['E3', 'G#3', 'B3', 'D4'],
    ['E3'],
    ['E3', 'G#3', 'B3', 'D4'],
    ['A2'],
    ['A2', 'C3', 'E3', 'G3'],
    ['A2'],
    ['A2', 'C3', 'E3', 'G3'],
    ['G2'],
    ['G2', 'A#2', 'D3', 'F3'],
    ['C3'],
    ['C3', 'E3', 'G3', 'A#3'],
  ];
  const chordDuration = 30 / tempo;
  const beatDuration = chordDuration * 1000;

  const audioCtxRef = useRef<AudioContext | null>(null);
  const playerRef = useRef<any>(null);
  const intervalRef = useRef<number | null>(null);
  const currentChordIndexRef = useRef(0);

  useEffect(() => {
    if (!audioCtxRef.current) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new AudioContextClass();
    }
    if (!playerRef.current) {
      playerRef.current = new (window as any).WebAudioFontPlayer();
    }
    playerRef.current.loader.startLoad(audioCtxRef.current, _tone_0000_Aspirin_sf2_file);
    playerRef.current.loader.waitLoad(() => {});
  }, []);

  useEffect(() => {
    const playChord = (chord: Chord) => {
      const audioCtx = audioCtxRef.current!;
      const currentTime = audioCtx.currentTime;
      chord.forEach(note => {
        const midi = noteToMidiNumber(note);
        playerRef.current.queueWaveTable(
          audioCtx,
          audioCtx.destination,
          _tone_0000_Aspirin_sf2_file,
          currentTime,
          midi,
          1.0
        );
      });
    };

    if (isChordsPlaying) {
      intervalRef.current = window.setInterval(() => {
        const chord = chords[currentChordIndexRef.current];
        playChord(chord);
        currentChordIndexRef.current = (currentChordIndexRef.current + 1) % chords.length;
      }, beatDuration);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        currentChordIndexRef.current = 0;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isChordsPlaying, tempo]);
};

// 例: 'C4' → 60 (MIDI)
const noteToMidiNumber = (note: string): number => {
  const noteMap: { [key: string]: number } = {
    C: 0, Cs: 1, D: 2, Ds: 3, E: 4, F: 5, Fs: 6,
    G: 7, Gs: 8, A: 9, As: 10, B: 11,
  };
  const flatToSharp: { [key: string]: string } = {
    Ab: 'Gs',
    Bb: 'As',
    Db: 'Cs',
    Eb: 'Ds',
    Gb: 'Fs',
  };
  const match = note.match(/^([A-G][b#]?)(\d)$/);
  if (!match) throw new Error(`Invalid note format: ${note}`);
  let [_, noteName, octaveStr] = match;
  if (noteName in flatToSharp) {
    noteName = flatToSharp[noteName];
  } else {
    noteName = noteName.replace('#', 's');
  }
  return (parseInt(octaveStr) + 1) * 12 + noteMap[noteName];
};