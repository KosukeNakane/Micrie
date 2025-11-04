// [Model] entities/model - snapshotHooks.ts
// 役割: 現在の状態からアレンジメントスナップショットの生成・適用ロジックを提供
import { useCallback } from 'react';

import { useBarCount } from '@/entities/bar-count';
import { useChords } from '@/entities/chords';
import { useChordPattern, useDrumPattern } from '@/entities/pattern';
import { useSegment } from '@/entities/segment';

import type { ArrangementSnapshot } from './types';

const cloneSegments = <T extends { [key: string]: unknown }>(segments: T[] | undefined | null): T[] => {
  if (!Array.isArray(segments)) return [];
  return segments.map((seg) => ({ ...seg }));
};

export const useBuildArrangementSnapshot = () => {
  const { chordPattern } = useChordPattern();
  const { drumPattern } = useDrumPattern();
  const { bars, chordsPerBar, slots } = useChords();
  const { melodySegments, rhythmSegments } = useSegment();
  const { barCount } = useBarCount();

  return useCallback<() => ArrangementSnapshot>(() => ({
    chordPattern,
    drumPattern,
    chords: {
      bars,
      chordsPerBar,
      slots: slots.map((slot) => ({
        chord: { ...slot.chord },
        plays: [...slot.plays] as typeof slot.plays,
      })),
    },
    melody: {
      barCount: barCount ?? bars,
      segments: cloneSegments(melodySegments),
    },
    rhythmSegments: cloneSegments(rhythmSegments),
  }), [barCount, bars, chordPattern, chordsPerBar, drumPattern, melodySegments, rhythmSegments, slots]);
};

export const useApplyArrangementSnapshot = () => {
  const { setChordPattern } = useChordPattern();
  const { setDrumPattern } = useDrumPattern();
  const { setProgression } = useChords();
  const { setBarCount } = useBarCount();
  const {
    setMelodySegments,
    setRhythmSegments,
    clearWaveforms,
  } = useSegment();

  return useCallback((snapshot: ArrangementSnapshot) => {
    setChordPattern(snapshot.chordPattern);
    setDrumPattern(snapshot.drumPattern);
    setProgression({
      bars: snapshot.chords.bars,
      chordsPerBar: snapshot.chords.chordsPerBar,
      slots: snapshot.chords.slots,
    });
    setBarCount(snapshot.melody.barCount);
    setMelodySegments(cloneSegments(snapshot.melody.segments));
    setRhythmSegments(cloneSegments(snapshot.rhythmSegments));
    clearWaveforms();
  }, [clearWaveforms, setBarCount, setChordPattern, setDrumPattern, setMelodySegments, setProgression, setRhythmSegments]);
};
