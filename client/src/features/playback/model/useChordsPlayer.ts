import { useEffect, useMemo } from 'react';
import { usePianoSampler } from '@entities/audio/model/usePianoSampler';
import { useChordPattern } from '@entities/pattern/model/ChordPatternContext';

type Chord = string[];

export const useChordsPlayer = () => {
  const { chordPattern } = useChordPattern();
  const pianoSamplerRef = usePianoSampler();

  const patterns: { [key: string]: Chord[] } = useMemo(() => ({
    pattern1: [ ['F4'], ['F4','A4','C5','E5'], ['F4'], ['F4','A4','C5','E5'], ['E4'], ['E4','G#4','B4','D5'], ['E4'], ['E4','G#4','B4','D5'], ['A3'], ['A3','C4','E4','G4'], ['A3'], ['A3','C4','E4','G4'], ['G3'], ['G3','A#3','D4','F4'], ['C4'], ['C4','E4','G4','A#4'] ],
    pattern2: [ ['C4'], ['C4','E4','G4'], ['C4'], ['C4','E4','G4'], ['G3'], ['G3','B3','D4'], ['G3'], ['G3','B3','D4'], ['A3'], ['A3','C4','E4'], ['A3'], ['A3','C4','E4'], ['F3'], ['F3','A3','C4'], ['F3'], ['F3','A3','C4'] ],
    pattern3: [ ['F4'], ['F4','A4','C5'], ['F4'], ['F4','A4','C5'], ['G4'], ['G4','B4','D5'], ['G4'], ['G4','B4','D5'], ['A4'], ['A4','C5','E5'], ['A4'], ['A4','C5','E5'], ['A4'], ['A4','C5','E5'], ['A4'], ['A4','C5','E5'] ],
    pattern4: [ ['F4'], ['F4','A4','C5'], ['F4'], ['F4','A4','C5'], ['G4'], ['G4','B4','D5'], ['G4'], ['G4','B4','D5'], ['E4'], ['E4','G4','B4'], ['E4'], ['E4','G4','B4'], ['A4'], ['A4','C5','E5'], ['A4'], ['A4','C5','E5'] ],
    pattern5: [ ['A4'], ['A4','C5','E5'], ['A4'], ['A4','C5','E5'], ['F4'], ['F4','A4','C5'], ['F4'], ['F4','A4','C5'], ['G4'], ['G4','B4','D5'], ['G4'], ['G4','B4','D5'], ['C5'], ['C5','E5','G5'], ['C5'], ['C5','E5','G5'] ],
    pattern6: [ ['A4'], ['A4','C5','E5'], ['F4'], ['F4','A4','C5'], ['C5'], ['C5','E5','G5'], ['G4'], ['G4','B4','D5'], ['A4'], ['A4','C5','E5'], ['F4'], ['F4','A4','C5'], ['C5'], ['C5','E5','G5'], ['G4'], ['G4','B4','D5'] ],
    pattern7: [ ['C4'], ['C4','E4','G4'], ['G3'], ['G3','B3','D4'], ['A3'], ['A3','C4','E4'], ['E3'], ['E3','B3','G4'], ['F3'], ['F3','A3','C4'], ['E3'], ['E3','C4','G4'], ['F3'], ['F3','A3','C4'], ['G3'], ['G3','B3','D4'] ],
  }), []);

  const chords = patterns[chordPattern] || patterns['pattern1'];

  useEffect(() => { if (pianoSamplerRef.current) pianoSamplerRef.current.volume.value = -6; }, [pianoSamplerRef]);

  const playChords = (startTime: number, duration: number) => {
    chords.forEach((chord, i) => {
      const time = startTime + i * duration;
      chord.forEach(note => pianoSamplerRef.current?.triggerAttackRelease(note, duration, time));
    });
  };

  return { playChords };
};

