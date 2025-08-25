import { usePianoSampler } from '@entities/audio/model/usePianoSampler';
import { useScaleMode } from '@entities/scale-mode/model/ScaleModeContext';
import { majorPentatonicMap, minorPentatonicMap } from '@shared/lib/pitchMaps';

declare const _tone_0000_Aspirin_sf2_file: any;

const transposeUpTwoOctaves = (note: string): string => {
  const match = note.match(/^([A-G]#?)(\d)$/);
  if (!match) return note;
  const [, pitch, octave] = match;
  const newOctave = parseInt(octave) + 3;
  return `${pitch}${newOctave}`;
};

export const useMelodyPlayer = () => {
  const { scaleMode } = useScaleMode();
  const pianoSamplerRef = usePianoSampler();

  const mapNoteToScale = (note: string): string => {
    const match = note.match(/^([A-G]#?)(\d)$/);
    if (!match) return note;
    const [, base, octave] = match;
    const mappedBase = scaleMode === 'major' ? (majorPentatonicMap[base] || base) : (scaleMode === 'minor' ? (minorPentatonicMap[base] || base) : base);
    return `${mappedBase}${octave}`;
  };

  const playMelody = (note: string, startTime: number, duration: number) => {
    if (note === 'rest') return;
    const mapped = mapNoteToScale(note);
    const transposed = transposeUpTwoOctaves(mapped);
    pianoSamplerRef.current?.triggerAttackRelease(transposed, duration, startTime);
  };

  return { playMelody };
};

