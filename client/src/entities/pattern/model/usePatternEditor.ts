// [Hook] entities/pattern - usePatternEditor.ts
// 役割: editingPatternStore の state/actions をUI向けAPIに集約
import { useEditingPatternStore } from './editingPatternStore';

import type { Chord, ChordSlot, PlayType, Segment } from './patternTypes';

const EMPTY_CHORD_SLOTS: ChordSlot[] = [];
const EMPTY_SEGMENTS: Segment[] = [];

type PatternEditorApi = {
	bars: number | undefined;
	chordsPerBar: number | undefined;
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
	applyChordPreset: (preset: Array<Chord | { chord: Chord; plays?: [PlayType, PlayType] }>) => void;
	applyProgression: (payload: {
		bars: number;
		chordsPerBar: number;
		chordSlots: ChordSlot[];
	}) => void;
};

export const usePatternEditor = (): PatternEditorApi => {
	const pattern = useEditingPatternStore((s) => s.pattern);
	const setBars = useEditingPatternStore((s) => s.setBars);
	const setChordsPerBar = useEditingPatternStore((s) => s.setChordsPerBar);
	const setChordAt = useEditingPatternStore((s) => s.setChordAt);
	const setSlotPlayType = useEditingPatternStore((s) => s.setSlotPlayType);
	const setMelodySegments = useEditingPatternStore((s) => s.setMelodySegments);
	const updateMelodySegment = useEditingPatternStore((s) => s.updateMelodySegment);
	const setRhythmSegments = useEditingPatternStore((s) => s.setRhythmSegments);
	const updateRhythmSegment = useEditingPatternStore((s) => s.updateRhythmSegment);
	const applyChordPreset = useEditingPatternStore((s) => s.applyChordPreset);
	const applyProgression = useEditingPatternStore((s) => s.applyProgression);

	const bars = pattern ? pattern.bars : undefined;
	const chordsPerBar = pattern ? pattern.chordsPerBar : undefined;
	const chordSlots = pattern?.chordSlots ?? EMPTY_CHORD_SLOTS;
	const melodySegments = pattern?.melodySegments ?? EMPTY_SEGMENTS;
	const rhythmSegments = pattern?.rhythmSegments ?? EMPTY_SEGMENTS;

	return {
		bars,
		chordsPerBar,
		chordSlots,
		setBars,
		setChordsPerBar,
		setChordAt,
		setSlotPlayType,
		melodySegments,
		setMelodySegments,
		updateMelodySegment,
		rhythmSegments,
		setRhythmSegments,
		updateRhythmSegment,
		applyChordPreset,
		applyProgression,
	};
};
