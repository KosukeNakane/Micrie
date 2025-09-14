// [Model] features/model - useMelodyPlayer.ts
// 役割: ビジネスロジック/状態操作
import { usePianoSampler } from '@entities/audio/model/usePianoSampler';
import { useScaleMode } from '@entities/scale-mode/model/ScaleModeContext';
import { mapNoteToScale, transposeUpTwoOctaves } from '@shared/lib/noteMapping';

declare const _tone_0000_Aspirin_sf2_file: any;

export const useMelodyPlayer = () => {
  const { scaleMode } = useScaleMode();
  const pianoSamplerRef = usePianoSampler('melody');

  const playMelody = (note: string, startTime: number, duration: number) => {
    if (note === 'rest') return;
    const mapped = mapNoteToScale(note, scaleMode as any);
    const transposed = transposeUpTwoOctaves(mapped);
    pianoSamplerRef.current?.triggerAttackRelease(transposed, duration, startTime);
  };

  return { playMelody };
};
