// [Model] entities/model - snapshotHooks.ts
// 役割: 現在の状態からアレンジメントスナップショットの生成・適用ロジックを提供
import { useCallback } from 'react';

import { useBarCount } from '@/entities/bar-count';
import { useChordPattern, useDrumPattern } from '@/entities/pattern';
import { useEditingPatternStore } from '@/entities/pattern/model/editingPatternStore';
import { usePatternEditor } from '@/entities/pattern/model/usePatternEditor';
import { useSegment } from '@/entities/segment';

import type { ArrangementSnapshot } from './types';
import type { Pattern, PlayType, Segment } from '@/entities/pattern/model/patternTypes';

const cloneSegments = (segments: Segment[] | undefined | null): Segment[] =>
	Array.isArray(segments)
		? segments.map((seg) => ({
			...seg,
			label: typeof seg.label === 'string' ? seg.label : '',
		}))
		: [];

export const useBuildArrangementSnapshot = () => {
	const { chordPattern } = useChordPattern();
	const { drumPattern } = useDrumPattern();
	const { bars, chordsPerBar, chordSlots, melodySegments, rhythmSegments } = usePatternEditor();
	const hasPattern = useEditingPatternStore((state) => Boolean(state.pattern));
	const { barCount } = useBarCount();

	return useCallback<() => ArrangementSnapshot>(() => {
		if (!hasPattern || bars == null || chordsPerBar == null) {
			throw new Error('Pattern not ready');
		}
		const effectiveMelodyBars = barCount ?? bars;
		if (effectiveMelodyBars == null) {
			throw new Error('Pattern not ready');
		}
		return {
			chordPattern,
			drumPattern,
			chords: {
				bars,
				chordsPerBar,
				slots: chordSlots.map((slot) => ({
					chord: { ...slot.chord },
					plays: [...slot.plays] as typeof slot.plays,
				})),
			},
			melody: {
				barCount: effectiveMelodyBars,
				segments: cloneSegments(melodySegments),
			},
			rhythmSegments: cloneSegments(rhythmSegments),
		};
	}, [
		barCount,
		bars,
		chordPattern,
		chordsPerBar,
		drumPattern,
		melodySegments,
		rhythmSegments,
		chordSlots,
		hasPattern,
	]);
};

const patternFromSnapshot = (snapshot: ArrangementSnapshot): Pattern => ({
	id: `loaded-${snapshot.chords.bars}-${snapshot.chords.chordsPerBar}-${Date.now()}`,
	name: 'Loaded Pattern',
	bars: snapshot.chords.bars,
	chordsPerBar: snapshot.chords.chordsPerBar,
	chordSlots: snapshot.chords.slots.map((slot) => ({
		chord: { ...slot.chord },
		plays: [...slot.plays] as [PlayType, PlayType],
	})),
	melodySegments: cloneSegments(snapshot.melody.segments),
	rhythmSegments: cloneSegments(snapshot.rhythmSegments),
});

export const useApplyArrangementSnapshot = () => {
	const { setChordPattern } = useChordPattern();
	const { setDrumPattern } = useDrumPattern();
	const { setBarCount } = useBarCount();
	const { applyProgression, setMelodySegments, setRhythmSegments } = usePatternEditor();
	const hasPattern = useEditingPatternStore((state) => Boolean(state.pattern));
	const loadPattern = useEditingPatternStore((state) => state.loadPattern);
	const { clearWaveforms } = useSegment();

	return useCallback(
		(snapshot: ArrangementSnapshot) => {
			if (!hasPattern) {
				loadPattern(patternFromSnapshot(snapshot));
				setChordPattern(snapshot.chordPattern);
				setDrumPattern(snapshot.drumPattern);
				setBarCount(snapshot.melody.barCount);
				clearWaveforms();
				return;
			}
			setChordPattern(snapshot.chordPattern);
			setDrumPattern(snapshot.drumPattern);
			applyProgression({
				bars: snapshot.chords.bars,
				chordsPerBar: snapshot.chords.chordsPerBar,
				chordSlots: snapshot.chords.slots,
			});
			setBarCount(snapshot.melody.barCount);
			setMelodySegments(cloneSegments(snapshot.melody.segments));
			setRhythmSegments(cloneSegments(snapshot.rhythmSegments));
			clearWaveforms();
		},
		[
			clearWaveforms,
			setBarCount,
			setChordPattern,
			setDrumPattern,
			setMelodySegments,
			applyProgression,
			setRhythmSegments,
			hasPattern,
		]
	);
};
