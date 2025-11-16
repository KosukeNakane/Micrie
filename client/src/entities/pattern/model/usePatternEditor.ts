// [Hook] entities/pattern - usePatternEditor.ts
// 役割: editingPatternStore 互換の編集APIを旧ストア上に提供
import { useCallback } from 'react';

import { useChords } from '@/entities/chords';
import { useSegment } from '@/entities/segment';

import type { Chord, ChordSlot, PlayType, Segment } from './patternTypes';
import type {
  ChordSlot as LegacyChordSlot,
  PlayType as LegacyPlayType,
} from '@/entities/chords';

type PatternEditorApi = {
  bars: number;
  chordsPerBar: number;
  chordSlots: ChordSlot[];
  setBars: (bars: number) => void;
  setChordsPerBar: (value: number) => void;
  setChordAt: (index: number, partial: Partial<Chord>) => void;
  setSlotPlayType: (index: number, pos: 0 | 1, type: PlayType) => void;
  melodySegments: Segment[];
  setMelodySegments: (segments: Segment[]) => void;
  updateMelodySegment: (index: number, patch: Partial<Segment>) => void;
  rhythmSegments: Segment[];
  setRhythmSegments: (segments: Segment[]) => void;
  updateRhythmSegment: (index: number, patch: Partial<Segment>) => void;
  applyChordPreset: (
    preset: Array<Chord | { chord: Chord; plays?: [PlayType, PlayType] }>
  ) => void;
  applyProgression: (payload: {
    bars: number;
    chordsPerBar: number;
    chordSlots: ChordSlot[];
  }) => void;
};

const createDefaultSlot = (): LegacyChordSlot => ({
  chord: { rootIndex: 0, quality: 'maj', tension: '' },
  plays: ['chord', 'rest'] as [LegacyPlayType, LegacyPlayType],
});

const cloneSlot = (slot: LegacyChordSlot): LegacyChordSlot => ({
  chord: { ...slot.chord },
  plays: [...slot.plays] as [LegacyPlayType, LegacyPlayType],
});

const ensureSlotCount = (slots: LegacyChordSlot[], target: number): LegacyChordSlot[] => {
  if (target <= 0) return [];
  const next = slots.slice(0, target).map(cloneSlot);
  while (next.length < target) {
    next.push(createDefaultSlot());
  }
  return next;
};

export const usePatternEditor = () => {
  const {
    bars,
    chordsPerBar,
    slots,
    setBars,
    setChordAt,
    setSlotPlayType,
    setProgression,
    applyPreset,
  } = useChords();
  const {
    melodySegments,
    rhythmSegments,
    setMelodySegments,
    setRhythmSegments,
    updateMelodySegment,
    updateRhythmSegment,
  } = useSegment();

  const setChordsPerBar = (value: number) => {
    const total = Math.max(0, bars) * Math.max(0, value);
    const nextSlots = ensureSlotCount(slots, total);
    setProgression({ bars, chordsPerBar: value, slots: nextSlots });
  };

  const applyChordPreset = useCallback<PatternEditorApi['applyChordPreset']>(
    (preset) => {
      applyPreset(preset as any);
    },
    [applyPreset]
  );

  const applyProgression = useCallback<PatternEditorApi['applyProgression']>(
    (payload) => {
      setProgression({
        bars: payload.bars,
        chordsPerBar: payload.chordsPerBar,
        slots: payload.chordSlots.map((slot) => ({
          chord: { ...slot.chord },
          plays: [...slot.plays] as [LegacyPlayType, LegacyPlayType],
        })),
      });
    },
    [setProgression]
  );

  const api: PatternEditorApi = {
    bars,
    chordsPerBar,
    chordSlots: slots as unknown as ChordSlot[],
    setBars,
    setChordsPerBar,
    setChordAt: setChordAt as (index: number, partial: Partial<Chord>) => void,
    setSlotPlayType: setSlotPlayType as (
      index: number,
      pos: 0 | 1,
      type: PlayType
    ) => void,
    melodySegments: melodySegments as Segment[],
    setMelodySegments: setMelodySegments as (segments: Segment[]) => void,
    updateMelodySegment: updateMelodySegment as (
      index: number,
      patch: Partial<Segment>
    ) => void,
    rhythmSegments: rhythmSegments as Segment[],
    setRhythmSegments: setRhythmSegments as (segments: Segment[]) => void,
    updateRhythmSegment: updateRhythmSegment as (
      index: number,
      patch: Partial<Segment>
    ) => void,
    applyChordPreset,
    applyProgression,
  };

  return api;
};
