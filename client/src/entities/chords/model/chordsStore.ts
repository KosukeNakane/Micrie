// [State] entities/model - chordsStore.ts
// 役割: グローバル/ローカル状態の保持・提供
import { create } from 'zustand';

export type ChordQuality = 'maj' | 'min' | 'dim' | 'aug';
export type ChordTension = '' | 'maj7' | '7' | '6' | '9' | '11' | '13';

export interface Chord {
  rootIndex: number; // 0..11 (C..B)
  quality: ChordQuality;
  tension: ChordTension;
}

export type PlayType = 'chord' | 'root' | 'rest';

export interface ChordSlot {
  chord: Chord;
  plays: [PlayType, PlayType]; // two triggers per slot (8 triggers per bar, 4 slots)
}

type State = {
  bars: number; // number of bars (default 2)
  chordsPerBar: number; // fixed at 4 by spec
  slots: ChordSlot[]; // length = bars * chordsPerBar
  setBars: (bars: number) => void;
  setChordAt: (index: number, partial: Partial<Chord>) => void;
  setSlotPlayType: (index: number, pos: 0 | 1, type: PlayType) => void;
  // Apply preset: can accept chords only or chord+plays per slot
  applyPreset: (preset: Array<Chord | { chord: Chord; plays?: [PlayType, PlayType] }>) => void;
  setProgression: (payload: { bars: number; chordsPerBar: number; slots: ChordSlot[] }) => void;
};

const DEFAULT_CHORD: Chord = { rootIndex: 0, quality: 'maj', tension: '' };

function makeInitialSlots(bars: number, chordsPerBar: number): ChordSlot[] {
  const total = bars * chordsPerBar;
  return Array.from({ length: total }, () => ({ chord: { ...DEFAULT_CHORD }, plays: ['chord', 'rest'] }));
}

export const useChordsStore = create<State>((set, _get) => {
  void _get;
  return {
  bars: 2,
  chordsPerBar: 4,
  slots: makeInitialSlots(2, 4),
  setBars: (bars) => set((s) => {
    const total = bars * s.chordsPerBar;
    const next = [...s.slots];
    if (total > next.length) {
      next.push(...makeInitialSlots(bars, s.chordsPerBar).slice(s.slots.length));
    } else if (total < next.length) {
      next.length = total;
    }
    return { bars, slots: next };
  }),
  setChordAt: (index, partial) => set((s) => {
    if (index < 0 || index >= s.slots.length) return {} as any;
    const next = [...s.slots];
    next[index] = { ...next[index], chord: { ...next[index].chord, ...partial } };
    return { slots: next };
  }),
  setSlotPlayType: (index, pos, type) => set((s) => {
    if (index < 0 || index >= s.slots.length) return {} as any;
    const next = [...s.slots];
    const plays = [...next[index].plays] as [PlayType, PlayType];
    plays[pos] = type;
    next[index] = { ...next[index], plays };
    return { slots: next };
  }),
  applyPreset: (preset) => set((s) => {
    const next = [...s.slots];
    for (let i = 0; i < Math.min(next.length, preset.length); i++) {
      const item = preset[i] as any;
      if (item && item.chord) {
        next[i] = {
          ...next[i],
          chord: { ...next[i].chord, ...item.chord },
          plays: item.plays ? item.plays : next[i].plays,
        };
      } else {
        next[i] = { ...next[i], chord: { ...next[i].chord, ...(item as Chord) } };
      }
    }
    return { slots: next };
  }),
  setProgression: (payload) => set(() => ({
    bars: payload.bars,
    chordsPerBar: payload.chordsPerBar,
    slots: payload.slots.map((slot) => ({
      chord: { ...slot.chord },
      plays: [...slot.plays] as [PlayType, PlayType],
    })),
  })),
  };
});

// Derived helpers for selectors
export const useChords = () => {
  const bars = useChordsStore((s) => s.bars);
  const chordsPerBar = useChordsStore((s) => s.chordsPerBar);
  const slots = useChordsStore((s) => s.slots);
  const setBars = useChordsStore((s) => s.setBars);
  const setChordAt = useChordsStore((s) => s.setChordAt);
  const setSlotPlayType = useChordsStore((s) => s.setSlotPlayType);
  const applyPreset = useChordsStore((s) => s.applyPreset);
  const setProgression = useChordsStore((s) => s.setProgression);
  return { bars, chordsPerBar, slots, setBars, setChordAt, setSlotPlayType, applyPreset, setProgression } as const;
};
