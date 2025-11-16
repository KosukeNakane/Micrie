// [State] entities/model - arrangementStore.ts
// 役割: プロジェクト内のアレンジメントパターン管理
import { create } from 'zustand';
import { combine } from 'zustand/middleware';

import type { ArrangementPattern, ArrangementSnapshot } from './types';
import { ARRANGEMENT_PATTERN_COUNT } from './types';

const createEmptyPatterns = (): Array<ArrangementPattern | null> =>
	Array.from({ length: ARRANGEMENT_PATTERN_COUNT }, () => null);

const generatePatternId = () => `arr-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

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

const clonePattern = (
	pattern: ArrangementPattern | null,
	index: number
): ArrangementPattern | null => {
	if (!pattern) return null;
	return {
		id: typeof pattern.id === 'string' && pattern.id.length > 0 ? pattern.id : generatePatternId(),
		name: pattern.name ?? `パターン ${index + 1}`,
		savedAt: typeof pattern.savedAt === 'number' ? pattern.savedAt : Date.now(),
		snapshot: cloneSnapshot(pattern.snapshot),
	};
};

type ArrangementPatternsState = {
	patterns: Array<ArrangementPattern | null>;
	savePattern: (
		index: number,
		payload: { name: string; snapshot: ArrangementSnapshot }
	) => ArrangementPattern;
	renamePattern: (index: number, name: string) => void;
	clearPattern: (index: number) => void;
	setPatterns: (patterns: Array<ArrangementPattern | null>) => void;
	resetPatterns: () => void;
};

export const useArrangementPatternsStore = create<ArrangementPatternsState>((set, get) => ({
	patterns: createEmptyPatterns(),
	savePattern: (index, payload) => {
		if (index < 0 || index >= ARRANGEMENT_PATTERN_COUNT) {
			throw new Error(`Arrangement pattern index out of range: ${index}`);
		}
		const baselineId = get().patterns[index]?.id ?? generatePatternId();
		const pattern: ArrangementPattern = {
			id: baselineId,
			name: payload.name,
			savedAt: Date.now(),
			snapshot: payload.snapshot,
		};
		set((state) => {
			const next = state.patterns.slice();
			next[index] = pattern;
			return { patterns: next };
		});
		return pattern;
	},
	renamePattern: (index, name) => {
		if (index < 0 || index >= ARRANGEMENT_PATTERN_COUNT) return;
		set((state) => {
			const current = state.patterns[index];
			if (!current) return state;
			const next = state.patterns.slice();
			next[index] = { ...current, name };
			return { patterns: next };
		});
	},
	clearPattern: (index) => {
		if (index < 0 || index >= ARRANGEMENT_PATTERN_COUNT) return;
		set((state) => {
			const next = state.patterns.slice();
			next[index] = null;
			return { patterns: next };
		});
	},
	setPatterns: (patterns) => {
		const normalized = Array.from({ length: ARRANGEMENT_PATTERN_COUNT }, (_, index) =>
			clonePattern(patterns[index] ?? null, index)
		);
		set({ patterns: normalized });
	},
	resetPatterns: () => {
		set({ patterns: createEmptyPatterns() });
	},
}));
