// [State] entities/model - arrangementPlayerStore.ts
// 役割: アレンジメントのパフォーマンス再生キューとモードを管理
import { create } from 'zustand';

export const ARRANGEMENT_PERFORMANCE_QUEUE_SIZE = 4 as const;

export type ArrangementPlaybackMode = 'editor' | 'queue';
export type ArrangementPlaybackStatus = 'stopped' | 'playing' | 'paused';

export type ArrangementQueueSlot = {
	slotId: string | null;
	assignedAt: number | null;
};

type ArrangementPlayerState = {
	playbackMode: ArrangementPlaybackMode;
	status: ArrangementPlaybackStatus;
	queue: ArrangementQueueSlot[];
	currentIndex: number | null;
	setPlaybackMode: (mode: ArrangementPlaybackMode) => void;
	setStatus: (status: ArrangementPlaybackStatus) => void;
	assignSlotToQueue: (queueIndex: number, slotId: string | null) => void;
	clearQueueSlot: (queueIndex: number) => void;
	swapQueueSlots: (source: number, target: number) => void;
	setCurrentIndex: (index: number | null) => void;
	clearQueue: () => void;
};

// 初期のキュー状態を生成
const createInitialQueue = (): ArrangementQueueSlot[] =>
	Array.from({ length: ARRANGEMENT_PERFORMANCE_QUEUE_SIZE }, () => ({
		slotId: null,
		assignedAt: null,
	}));

const clampQueueIndex = (index: number): number => {
	if (Number.isNaN(index)) return 0;
	if (index < 0) return 0;
	if (index >= ARRANGEMENT_PERFORMANCE_QUEUE_SIZE) return ARRANGEMENT_PERFORMANCE_QUEUE_SIZE - 1;
	return index;
};

export const useArrangementPlayerStore = create<ArrangementPlayerState>((set) => ({
	playbackMode: 'editor',
	status: 'stopped',
	queue: createInitialQueue(),
	currentIndex: null,
	setPlaybackMode: (mode) =>
		set((state) => {
			if (state.playbackMode === mode) return state;
			return {
				playbackMode: mode,
				status: mode === 'queue' ? state.status : 'stopped',
				currentIndex: mode === 'queue' ? state.currentIndex : null,
			};
		}),
	setStatus: (status) => set({ status }),
	assignSlotToQueue: (queueIndex, slotId) =>
		set((state) => {
			const index = clampQueueIndex(queueIndex);
			const next = state.queue.slice();
			next[index] = {
				slotId,
				assignedAt: slotId ? Date.now() : null, //使っていない説
			};
			return { queue: next };
		}),
	clearQueueSlot: (queueIndex) =>
		set((state) => {
			const index = clampQueueIndex(queueIndex);
			const next = state.queue.slice();
			next[index] = { slotId: null, assignedAt: null };
			return { queue: next };
		}),
	swapQueueSlots: (source, target) =>
		set((state) => {
			const sourceIndex = clampQueueIndex(source);
			const targetIndex = clampQueueIndex(target);
			if (sourceIndex === targetIndex) return state;
			const next = state.queue.slice();
			const temp = next[sourceIndex];
			next[sourceIndex] = next[targetIndex];
			next[targetIndex] = temp;
			return { queue: next };
		}),
	setCurrentIndex: (index) => set({ currentIndex: index }),
	clearQueue: () => set({ queue: createInitialQueue(), currentIndex: null, status: 'stopped' }),
}));

// セレクター関数
export const selectArrangementCurrentIndex = (state: ArrangementPlayerState) => state.currentIndex;
export const selectArrangementQueue = (state: ArrangementPlayerState) => state.queue;
export const selectArrangementPlaybackMode = (state: ArrangementPlayerState) => state.playbackMode;
export const selectArrangementPlaybackStatus = (state: ArrangementPlayerState) => state.status;
