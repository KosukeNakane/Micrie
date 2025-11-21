import { useEditingPatternStore } from '@/entities/pattern/model/editingPatternStore';
import { useSavedPatternStore, type SavedPatternSlot } from '@/entities/pattern/model/savedPatternStore';
import type { ProjectArrangementPattern, ProjectData, ProjectSegment } from '@/entities/project';
import type { Pattern, Segment, ChordSlot, PlayType } from '@/types/pattern';
import { PRESETS } from '@/shared/lib/chord-presets';
import { PATTERNS as DRUM_PATTERNS } from '@/features/drums-playback/lib/patterns';
import {
	normalizePlayType,
	normalizeQuality,
	normalizeRootIndex,
	normalizeTension,
} from '@/utils/normalizers';

export const STEP_BEAT = 0.5;

export const cloneSegments = (segments: Array<Segment | ProjectSegment> | undefined | null): Segment[] =>
	Array.isArray(segments)
		? segments.map((seg) => ({
				...(seg as Segment),
				label: typeof seg.label === 'string' ? seg.label : '',
		  }))
		: [];

export const createChordSlotsFromPreset = (
	bars: number,
	chordsPerBar: number,
	presetId: string
): ChordSlot[] => {
	const preset = PRESETS[presetId] ?? PRESETS.pattern1;
	const total = Math.max(1, bars * chordsPerBar);
	return Array.from({ length: total }, (_, index) => {
		const source = preset[index % preset.length];
		const plays: [PlayType, PlayType] = [
			(source.plays?.[0] as PlayType) ?? 'root',
			(source.plays?.[1] as PlayType) ?? 'chord',
		];
		return {
			chord: { ...source.chord },
			plays,
		};
	});
};

export const createRhythmSegmentsFromPattern = (patternKey: keyof typeof DRUM_PATTERNS): Segment[] => {
	const pattern = DRUM_PATTERNS[patternKey] ?? DRUM_PATTERNS.basic;
	const segments: Segment[] = Array.from({ length: 16 }, (_, i) => ({
		label: '',
		start: i * STEP_BEAT,
		end: (i + 1) * STEP_BEAT,
	}));
	pattern.forEach((event) => {
		const index = Math.round(event.time / STEP_BEAT);
		if (index >= 0 && index < segments.length) {
			segments[index] = { ...segments[index], label: event.type };
		}
	});
	return segments;
};

export const createPatternFromLegacyProgression = (
	data: ProjectData
): { pattern: Pattern; name: string } | null => {
	const progression = data.chordsProgression;
	if (
		!progression ||
		typeof progression.bars !== 'number' ||
		typeof progression.chordsPerBar !== 'number'
	) {
		return null;
	}
	const bars = Math.max(1, Math.floor(progression.bars));
	const chordsPerBar = Math.max(1, Math.floor(progression.chordsPerBar));
	const total = Math.max(1, bars * chordsPerBar);
	const slots = Array.isArray(progression.slots) ? progression.slots : [];
	const chordSlots: ChordSlot[] = Array.from({ length: total }, (_, idx) => {
		const src = slots[idx] ?? {};
		const chord = src?.chord ?? {};
		const plays = Array.isArray(src?.plays) ? src.plays : [];
		return {
			chord: {
				rootIndex: normalizeRootIndex(chord.rootIndex),
				quality: normalizeQuality(chord.quality),
				tension: normalizeTension(chord.tension),
			},
			plays: [normalizePlayType(plays[0], 0), normalizePlayType(plays[1], 1)],
		};
	});
	const legacyId =
		typeof data.lastEditingPatternId === 'string'
			? data.lastEditingPatternId
			: 'chords-progression';
	const legacyName =
		typeof (data as any)?.meta?.name === 'string'
			? `${(data as any).meta.name} Progression`
			: 'Imported Progression';
	return {
		name: legacyName,
		pattern: {
			id: legacyId,
			bars,
			chordsPerBar,
			chordSlots,
			melodySegments: [],
			rhythmSegments: [],
		},
	};
};

export const makeDefaultPattern = (): Pattern => {
	const bars = 2;
	const chordsPerBar = 4;
	return {
		id: `default-${Date.now()}`,
		bars,
		chordsPerBar,
		chordSlots: createChordSlotsFromPreset(bars, chordsPerBar, 'pattern1'),
		melodySegments: [],
		rhythmSegments: createRhythmSegmentsFromPattern('basic'),
	};
};

export const patternFromArrangement = (item: ProjectArrangementPattern, index: number): Pattern => ({
	id: typeof item.id === 'string' ? item.id : `arr-${index}`,
	bars: item.snapshot.chords.bars,
	chordsPerBar: item.snapshot.chords.chordsPerBar,
	chordSlots: item.snapshot.chords.slots.map((slot) => ({
		chord: { ...slot.chord },
		plays: [...slot.plays] as [PlayType, PlayType],
	})),
	melodySegments: cloneSegments(item.snapshot.melody.segments),
	rhythmSegments: cloneSegments(item.snapshot.rhythmSegments),
});

export const extractPatternsFromArrangements = (data: ProjectData): SavedPatternSlot[] => {
	if (!Array.isArray(data.arrangements)) return [];
	return data.arrangements.reduce<SavedPatternSlot[]>((acc, item, index) => {
		if (!item) return acc;
		acc.push({
			name:
				typeof item.name === 'string' && item.name.trim().length > 0
					? item.name
					: `Pattern ${index + 1}`,
			pattern: patternFromArrangement(item, index),
		});
		return acc;
	}, []);
};

type SerializedSavedPattern = NonNullable<ProjectData['savedPatterns']>[number];

const patternFromSavedEntry = (entry: SerializedSavedPattern, index: number): Pattern | null => {
	if (!entry) return null;
	if (
		typeof entry.bars !== 'number' ||
		typeof entry.chordsPerBar !== 'number' ||
		!Array.isArray(entry.chordSlots)
	) {
		return null;
	}
	return {
		id: typeof entry.id === 'string' ? entry.id : `saved-${index}`,
		bars: entry.bars,
		chordsPerBar: entry.chordsPerBar,
		chordSlots: entry.chordSlots.map((slot) => ({
			chord: { ...slot.chord },
			plays: [...slot.plays] as [PlayType, PlayType],
		})),
		melodySegments: cloneSegments(entry.melodySegments),
		rhythmSegments: cloneSegments(entry.rhythmSegments),
	};
};

const slotNameFrom = (value: unknown, index: number) =>
	typeof value === 'string' && value.trim().length > 0 ? value : `Pattern ${index + 1}`;

export const convertSavedPatterns = (data: ProjectData): SavedPatternSlot[] | null => {
	if (!Array.isArray(data.savedPatterns)) return null;
	const mapped: SavedPatternSlot[] = data.savedPatterns.map((entry, index) => {
		if (!entry) {
			return { name: slotNameFrom(null, index), pattern: null };
		}
		return {
			name: slotNameFrom(entry.name, index),
			pattern: patternFromSavedEntry(entry, index),
		};
	});
	return mapped.some((slot) => Boolean(slot.pattern)) ? mapped : null;
};

export const applyEditingPatternFromProjectData = (data: ProjectData) => {
	const savedStore = useSavedPatternStore.getState();
	const editingStore = useEditingPatternStore.getState();
	const savedList = convertSavedPatterns(data);
	let availablePatterns: Pattern[] = [];
	if (savedList) {
		savedStore.setSlots(savedList);
		availablePatterns = savedList
			.map((slot) => slot.pattern)
			.filter((p): p is Pattern => Boolean(p));
	} else {
		const arrPatterns = extractPatternsFromArrangements(data);
		if (arrPatterns.length > 0) {
			savedStore.setSlots(arrPatterns);
			availablePatterns = arrPatterns
				.map((slot) => slot.pattern)
				.filter((p): p is Pattern => Boolean(p));
		} else {
			const legacyPattern = createPatternFromLegacyProgression(data);
			if (legacyPattern) {
				savedStore.setSlots([{ name: legacyPattern.name, pattern: legacyPattern.pattern }]);
				availablePatterns = [legacyPattern.pattern];
			} else {
				savedStore.resetPatterns();
			}
		}
	}
	const lastId = typeof data.lastEditingPatternId === 'string' ? data.lastEditingPatternId : null;
	let targetPattern: Pattern | null = null;
	if (lastId) {
		targetPattern = availablePatterns.find((p) => p.id === lastId) ?? null;
	}
	if (!targetPattern) {
		targetPattern = availablePatterns[0] ?? makeDefaultPattern();
	}
	editingStore.resetPattern();
	editingStore.loadPattern(targetPattern);
};
