// [State] entities/pattern - arrangementStore.ts
// 役割: Pattern 再生順序（アレンジメント）の管理
import { create } from 'zustand';
import { combine } from 'zustand/middleware';

type ArrangementSlot = { patternId: string | null };
type PlaybackMode = 'arrangement' | 'off';

const SLOT_COUNT = 4;

const createEmptySlots = (): ArrangementSlot[] =>
	Array.from({ length: SLOT_COUNT }, () => ({ patternId: null }));

export const useArrangementStore = create(
	combine(
		{
			slots: createEmptySlots(),
			currentIndex: null as number | null,
			playbackMode: 'off' as PlaybackMode,
		},
		(set, get) => ({
			setSlot: (index: number, patternId: string | null) => {
				if (index < 0 || index >= SLOT_COUNT) {
					throw new Error(`arrangement slot index out of range: ${index}`);
				}
				set((state) => {
					const next = state.slots.slice();
					next[index] = { patternId };
					return { slots: next };
				});
			},
			swapSlots: (a: number, b: number) => {
				if (a < 0 || a >= SLOT_COUNT || b < 0 || b >= SLOT_COUNT) return;
				if (a === b) return;
				set((state) => {
					const next = state.slots.slice();
					const temp = next[a];
					next[a] = next[b];
					next[b] = temp;
					return { slots: next };
				});
			},
			clearSlot: (index: number) => {
				if (index < 0 || index >= SLOT_COUNT) return;
				set((state) => {
					const next = state.slots.slice();
					next[index] = { patternId: null };
					return { slots: next };
				});
			},
			resetArrangement: () => {
				set({
					slots: createEmptySlots(),
					currentIndex: null,
					playbackMode: 'off',
				});
			},
			setCurrentIndex: (index: number | null) => {
				if (index !== null && (index < 0 || index >= SLOT_COUNT)) return;
				set({ currentIndex: index });
			},
			setPlaybackMode: (mode: PlaybackMode) => {
				set({ playbackMode: mode });
			},
			isSlotEmpty: (index: number): boolean => {
				if (index < 0 || index >= SLOT_COUNT) return true;
				return get().slots[index].patternId === null;
			},
			getPatternId: (index: number): string | null => {
				if (index < 0 || index >= SLOT_COUNT) return null;
				return get().slots[index].patternId;
			},
		})
	)
);
