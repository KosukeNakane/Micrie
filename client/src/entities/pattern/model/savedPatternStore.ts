// [State] entities/pattern - savedPatternStore.ts
// 役割: 最大6つのローカル保存パターンの管理
import { create } from 'zustand';
import { combine } from 'zustand/middleware';

import type { Pattern, ChordSlot, Segment, PlayType } from './patternTypes';

const PATTERN_CAPACITY = 6;

const cloneSegment = (segment: Segment): Segment => ({ ...segment });

const cloneChordSlot = (slot: ChordSlot): ChordSlot => ({
  chord: { ...slot.chord },
  plays: [...slot.plays] as [PlayType, PlayType],
});

const clonePattern = (pattern: Pattern): Pattern => ({
  id: pattern.id,
  name: pattern.name,
  bars: pattern.bars,
  chordsPerBar: pattern.chordsPerBar,
  chordSlots: pattern.chordSlots.map(cloneChordSlot),
  melodySegments: pattern.melodySegments.map(cloneSegment),
  rhythmSegments: pattern.rhythmSegments.map(cloneSegment),
});

const randomBase36 = (length: number) => {
  let text = '';
  while (text.length < length) {
    text += Math.random().toString(36).slice(2);
  }
  return text.slice(0, length);
};

const generatePatternId = () => `pat-${Date.now()}-${randomBase36(4)}`;

const resolvePatternId = (
  existing: Pattern | null,
  baseId: string,
  isIdInUse: (id: string) => boolean,
): string => {
  if (existing?.id) return existing.id;
  let candidate = baseId && baseId.length > 0 ? baseId : generatePatternId();
  if (!isIdInUse(candidate)) return candidate;
  do {
    candidate = generatePatternId();
  } while (isIdInUse(candidate));
  return candidate;
};

const createEmptyPatterns = (): Array<Pattern | null> =>
  Array.from({ length: PATTERN_CAPACITY }, () => null);

export const useSavedPatternStore = create(
  combine(
    {
      patterns: createEmptyPatterns(),
    },
    (set, get) => ({
      savePattern: (index: number, pattern: Pattern): Pattern => {
        if (index < 0 || index >= PATTERN_CAPACITY) {
          throw new Error(`savedPattern index out of range: ${index}`);
        }
        const existing = get().patterns[index];
        const isIdInUse = (id: string) =>
          get().patterns.some((item, idx) => idx !== index && item?.id === id);
        const stored = clonePattern(pattern);
        stored.id = resolvePatternId(existing, stored.id, isIdInUse);
        const cloneForReturn = clonePattern(stored);
        set((state) => {
          const next = state.patterns.slice();
          next[index] = stored;
          return { patterns: next };
        });
        return cloneForReturn;
      },
      renamePattern: (index: number, name: string) => {
        if (index < 0 || index >= PATTERN_CAPACITY) return;
        set((state) => {
          const current = state.patterns[index];
          if (!current) return state;
          const next = state.patterns.slice();
          next[index] = { ...current, name };
          return { patterns: next };
        });
      },
      clearPattern: (index: number) => {
        if (index < 0 || index >= PATTERN_CAPACITY) return;
        set((state) => {
          const next = state.patterns.slice();
          next[index] = null;
          return { patterns: next };
        });
      },
      setPatterns: (list: Array<Pattern | null>) => {
        const next: Array<Pattern | null> = Array.from({ length: PATTERN_CAPACITY }, (_, idx) => {
          const item = list[idx] ?? null;
          return item ? clonePattern(item) : null;
        });
        set({ patterns: next });
      },
      resetPatterns: () => {
        set({ patterns: createEmptyPatterns() });
      },
    })
  )
);
