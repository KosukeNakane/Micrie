// [State] entities/model - arrangementStore.ts
// 役割: プロジェクト内のアレンジメントスロット管理
import { create } from 'zustand';

import type { ArrangementSlot, ArrangementSnapshot } from './types';
import { ARRANGEMENT_SLOT_COUNT } from './types';

const createEmptySlots = (): Array<ArrangementSlot | null> =>
  Array.from({ length: ARRANGEMENT_SLOT_COUNT }, () => null);

const generateSlotId = () => `arr-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const cloneSnapshot = (snapshot: ArrangementSnapshot): ArrangementSnapshot => ({
  chordPattern: snapshot.chordPattern,
  drumPattern: snapshot.drumPattern,
  chords: {
    bars: snapshot.chords?.bars ?? 2,
    chordsPerBar: snapshot.chords?.chordsPerBar ?? 4,
    slots: Array.isArray(snapshot.chords?.slots)
      ? snapshot.chords.slots.map((slot) => ({
          chord: { ...slot.chord },
          plays: [...slot.plays] as typeof slot.plays,
        }))
      : [],
  },
  melody: {
    barCount: snapshot.melody?.barCount ?? 2,
    segments: Array.isArray(snapshot.melody?.segments)
      ? snapshot.melody.segments.map((seg) => ({ ...seg }))
      : [],
  },
  rhythmSegments: Array.isArray(snapshot.rhythmSegments)
    ? snapshot.rhythmSegments.map((seg) => ({ ...seg }))
    : [],
});

const cloneSlot = (slot: ArrangementSlot | null, index: number): ArrangementSlot | null => {
  if (!slot) return null;
  return {
    id: typeof slot.id === 'string' && slot.id.length > 0 ? slot.id : generateSlotId(),
    name: slot.name ?? `スロット ${index + 1}`,
    savedAt: typeof slot.savedAt === 'number' ? slot.savedAt : Date.now(),
    snapshot: cloneSnapshot(slot.snapshot),
  };
};

type ArrangementSlotsState = {
  slots: Array<ArrangementSlot | null>;
  saveSlot: (index: number, payload: { name: string; snapshot: ArrangementSnapshot }) => ArrangementSlot;
  renameSlot: (index: number, name: string) => void;
  clearSlot: (index: number) => void;
  setSlots: (slots: Array<ArrangementSlot | null>) => void;
  resetSlots: () => void;
};

export const useArrangementSlotsStore = create<ArrangementSlotsState>((set, get) => ({
  slots: createEmptySlots(),
  saveSlot: (index, payload) => {
    if (index < 0 || index >= ARRANGEMENT_SLOT_COUNT) {
      throw new Error(`Arrangement slot index out of range: ${index}`);
    }
    const baselineId = get().slots[index]?.id ?? generateSlotId();
    const slot: ArrangementSlot = {
      id: baselineId,
      name: payload.name,
      savedAt: Date.now(),
      snapshot: payload.snapshot,
    };
    set((state) => {
      const next = state.slots.slice();
      next[index] = slot;
      return { slots: next };
    });
    return slot;
  },
  renameSlot: (index, name) => {
    if (index < 0 || index >= ARRANGEMENT_SLOT_COUNT) return;
    set((state) => {
      const current = state.slots[index];
      if (!current) return state;
      const next = state.slots.slice();
      next[index] = { ...current, name };
      return { slots: next };
    });
  },
  clearSlot: (index) => {
    if (index < 0 || index >= ARRANGEMENT_SLOT_COUNT) return;
    set((state) => {
      const next = state.slots.slice();
      next[index] = null;
      return { slots: next };
    });
  },
  setSlots: (slots) => {
    const normalized = Array.from({ length: ARRANGEMENT_SLOT_COUNT }, (_, index) =>
      cloneSlot(slots[index] ?? null, index),
    );
    set({ slots: normalized });
  },
  resetSlots: () => {
    set({ slots: createEmptySlots() });
  },
}));
