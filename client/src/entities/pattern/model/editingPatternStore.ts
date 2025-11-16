// [State] entities/pattern - editingPatternStore.ts
// 役割: Pattern 編集用の唯一の状態ストア
import { create } from 'zustand';
import { combine } from 'zustand/middleware';

import type { Pattern, Segment, ChordSlot, Chord, PlayType } from './patternTypes';

const DEFAULT_CHORD: Chord = { rootIndex: 0, quality: 'maj', tension: '' };
const DEFAULT_PLAYS: readonly [PlayType, PlayType] = ['chord', 'rest'];

const cloneSegment = (segment: Segment): Segment => ({ ...segment });

const cloneChordSlot = (slot: ChordSlot): ChordSlot => ({
  chord: { ...slot.chord },
  plays: [...slot.plays] as [PlayType, PlayType],
});

const clonePattern = (pattern: Pattern): Pattern => ({
  ...pattern,
  chordSlots: pattern.chordSlots.map(cloneChordSlot),
  melodySegments: pattern.melodySegments.map(cloneSegment),
  rhythmSegments: pattern.rhythmSegments.map(cloneSegment),
});

const createEmptySlot = (): ChordSlot => ({
  chord: { ...DEFAULT_CHORD },
  plays: [...DEFAULT_PLAYS] as [PlayType, PlayType],
});

const ensureSlotCount = (slots: ChordSlot[], target: number): ChordSlot[] => {
  if (target <= 0) return [];
  const next = slots.slice(0, target);
  while (next.length < target) {
    next.push(createEmptySlot());
  }
  return next;
};

type ChordPresetItem = Chord | { chord: Chord; plays?: [PlayType, PlayType] };

const isPresetSlot = (value: ChordPresetItem): value is { chord: Chord; plays?: [PlayType, PlayType] } => {
  return typeof value === 'object' && value !== null && 'chord' in value;
};

export const useEditingPatternStore = create(
  combine(
    {
      pattern: null as Pattern | null,
    },
    (set, get) => ({
      loadPattern: (pattern: Pattern) => {
        set({ pattern: clonePattern(pattern) });
      },
      resetPattern: () => {
        set({ pattern: null });
      },
      setName: (name: string) => {
        set((state) => {
          if (!state.pattern) return state;
          return { pattern: { ...state.pattern, name } };
        });
      },
      setBars: (bars: number) => {
        set((state) => {
          if (!state.pattern) return state;
          const chordsPerBar = state.pattern.chordsPerBar;
          const total = Math.max(0, bars) * Math.max(0, chordsPerBar);
          const chordSlots = ensureSlotCount(state.pattern.chordSlots, total);
          return { pattern: { ...state.pattern, bars, chordSlots } };
        });
      },
      setChordAt: (index: number, partial: Partial<Chord>) => {
        set((state) => {
          if (!state.pattern) return state;
          if (index < 0 || index >= state.pattern.chordSlots.length) return state;
          const chordSlots = state.pattern.chordSlots.slice();
          chordSlots[index] = { ...chordSlots[index], chord: { ...chordSlots[index].chord, ...partial } };
          return { pattern: { ...state.pattern, chordSlots } };
        });
      },
      setSlotPlayType: (index: number, pos: 0 | 1, type: PlayType) => {
        set((state) => {
          if (!state.pattern) return state;
          if (index < 0 || index >= state.pattern.chordSlots.length) return state;
          const chordSlots = state.pattern.chordSlots.slice();
          const plays = [...chordSlots[index].plays] as [PlayType, PlayType];
          plays[pos] = type;
          chordSlots[index] = { ...chordSlots[index], plays };
          return { pattern: { ...state.pattern, chordSlots } };
        });
      },
      setChordsPerBar: (value: number) => {
        set((state) => {
          if (!state.pattern) return state;
          const bars = state.pattern.bars;
          const total = Math.max(0, bars) * Math.max(0, value);
          const chordSlots = ensureSlotCount(state.pattern.chordSlots, total);
          return { pattern: { ...state.pattern, chordsPerBar: value, chordSlots } };
        });
      },
      applyChordPreset: (preset: Array<ChordPresetItem>) => {
        set((state) => {
          if (!state.pattern) return state;
          const chordSlots = state.pattern.chordSlots.slice();
          const limit = Math.min(chordSlots.length, preset.length);
          for (let i = 0; i < limit; i += 1) {
            const item = preset[i];
            if (!item) continue;
            if (isPresetSlot(item)) {
              chordSlots[i] = {
                ...chordSlots[i],
                chord: { ...chordSlots[i].chord, ...item.chord },
                plays: item.plays ? [...item.plays] as [PlayType, PlayType] : chordSlots[i].plays,
              };
            } else {
              chordSlots[i] = {
                ...chordSlots[i],
                chord: { ...chordSlots[i].chord, ...item },
              };
            }
          }
          return { pattern: { ...state.pattern, chordSlots } };
        });
      },
      setMelodySegments: (segments: Segment[]) => {
        set((state) => {
          if (!state.pattern) return state;
          return {
            pattern: {
              ...state.pattern,
              melodySegments: segments.map(cloneSegment),
            },
          };
        });
      },
      updateMelodySegment: (index: number, patch: Partial<Segment>) => {
        set((state) => {
          if (!state.pattern) return state;
          if (index < 0 || index >= state.pattern.melodySegments.length) return state;
          const melodySegments = state.pattern.melodySegments.slice();
          melodySegments[index] = { ...melodySegments[index], ...patch };
          return { pattern: { ...state.pattern, melodySegments } };
        });
      },
      setRhythmSegments: (segments: Segment[]) => {
        set((state) => {
          if (!state.pattern) return state;
          return {
            pattern: {
              ...state.pattern,
              rhythmSegments: segments.map(cloneSegment),
            },
          };
        });
      },
      updateRhythmSegment: (index: number, patch: Partial<Segment>) => {
        set((state) => {
          if (!state.pattern) return state;
          if (index < 0 || index >= state.pattern.rhythmSegments.length) return state;
          const rhythmSegments = state.pattern.rhythmSegments.slice();
          rhythmSegments[index] = { ...rhythmSegments[index], ...patch };
          return { pattern: { ...state.pattern, rhythmSegments } };
        });
      },
      applyProgression: (payload: { bars: number; chordsPerBar: number; chordSlots: ChordSlot[] }) => {
        set((state) => {
          if (!state.pattern) return state;
          return {
            pattern: {
              ...state.pattern,
              bars: payload.bars,
              chordsPerBar: payload.chordsPerBar,
              chordSlots: payload.chordSlots.map(cloneChordSlot),
            },
          };
        });
      },
    })
  )
);

