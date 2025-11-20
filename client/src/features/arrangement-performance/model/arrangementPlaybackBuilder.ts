// [Model] features/model - arrangementPlaybackBuilder.ts
// 役割: Saved Pattern から再生用タイムラインを構築
import type { Pattern, PlayType } from '@/entities/pattern/model/patternTypes';

const ORIGINAL_BAR_DURATION_SECONDS = 2; // 旧セグメントは 1 bar = 2s を前提に作成されている
const DEFAULT_MELODY_STEPS_PER_BAR = 16;
const DEFAULT_RHYTHM_STEPS_PER_BAR = 8;
const BEATS_PER_BAR = 4;

export type ArrangementPlaybackEvent =
	| {
			type: 'melody';
			start: number;
			duration: number;
			note: string;
			velocity: number;
	  }
	| {
			type: 'drum';
			start: number;
			duration: number;
			label: 'kick' | 'snare' | 'hihat';
			velocity: number;
	  }
	| {
			type: 'chord';
			start: number;
			duration: number;
			chord: Pattern['chordSlots'][number]['chord'];
			playType: Exclude<PlayType, 'rest'>;
			velocity: number;
	  };

export type ArrangementPlaybackTimeline = {
	events: ArrangementPlaybackEvent[];
	length: number;
};

const DRUM_DEFAULTS: Record<'kick' | 'snare' | 'hihat', { frequency: number; duration: number }> = {
	kick: { frequency: 60, duration: 0.35 },
	snare: { frequency: 180, duration: 0.28 },
	hihat: { frequency: 420, duration: 0.15 },
};

const clampDuration = (value: number, fallback = 0.1) => {
	if (!Number.isFinite(value) || value <= 0) return fallback;
	return value;
};

const toFiniteNumber = (value: number | null | undefined, fallback = 0) =>
	typeof value === 'number' && Number.isFinite(value) ? value : fallback;

const getAverageSegmentLength = (segments: Array<{ start?: number; end?: number }>) => {
	let total = 0;
	let count = 0;
	segments.forEach((segment) => {
		const start = toFiniteNumber(segment.start);
		const end =
			typeof segment.end === 'number' && Number.isFinite(segment.end) ? segment.end : start;
		const diff = end - start;
		if (diff > 0) {
			total += diff;
			count += 1;
		}
	});
	if (!count) return null;
	return total / count;
};
//　秒数／単位を決定する
const pickSecondsPerUnit = (
	avgLength: number | null,
	candidates: Array<{ expectedLength: number; secondsPerUnit: number }>,
	fallback: number
) => {
	if (!avgLength || avgLength <= 0 || !Number.isFinite(avgLength)) {
		return fallback;
	}
	let best = fallback;
	let bestDiff = Number.POSITIVE_INFINITY;
	candidates.forEach(({ expectedLength, secondsPerUnit }) => {
		if (!Number.isFinite(expectedLength) || expectedLength <= 0) return;
		const diff = Math.abs(avgLength - expectedLength);
		if (diff < bestDiff) {
			bestDiff = diff;
			best = secondsPerUnit;
		}
	});
	return best;
};
// 1 bar あたりのステップ数を計算する
const computeStepsPerBar = (segmentCount: number, bars: number, fallback: number) => {
	const safeBars = Math.max(1, Math.round(bars));
	if (!Number.isFinite(segmentCount) || segmentCount <= 0) {
		return fallback;
	}
	const ratio = segmentCount / safeBars;
	const steps = Math.max(1, Math.round(ratio));
	return steps || fallback;
};
// メロディセグメントの秒数／単位を計算する
const computeMelodySecondsPerUnit = (pattern: Pattern, barDuration: number) => {
	const bars = Math.max(pattern.bars ?? 1, 1);
	const segments = pattern.melodySegments ?? [];
	const stepsPerBar = computeStepsPerBar(segments.length, bars, DEFAULT_MELODY_STEPS_PER_BAR);
	const avgLength = getAverageSegmentLength(segments);

	const candidates = [
		{ expectedLength: 1 / stepsPerBar, secondsPerUnit: barDuration }, // units = bars
		{
			expectedLength: ORIGINAL_BAR_DURATION_SECONDS / stepsPerBar,
			secondsPerUnit: barDuration / ORIGINAL_BAR_DURATION_SECONDS,
		}, // legacy seconds (1 bar = 2s)
		{ expectedLength: barDuration / stepsPerBar, secondsPerUnit: 1 }, // already seconds
	];

	return pickSecondsPerUnit(avgLength, candidates, barDuration / ORIGINAL_BAR_DURATION_SECONDS);
};
// リズムセグメントの秒数／単位を計算する
const computeRhythmSecondsPerUnit = (
	pattern: Pattern,
	barDuration: number,
	beatDuration: number
) => {
	const bars = Math.max(pattern.bars ?? 1, 1);
	const segments = pattern.rhythmSegments ?? [];
	const stepsPerBar = computeStepsPerBar(segments.length, bars, DEFAULT_RHYTHM_STEPS_PER_BAR);
	const avgLength = getAverageSegmentLength(segments);

	const candidates = [
		{
			expectedLength: BEATS_PER_BAR / stepsPerBar,
			secondsPerUnit: beatDuration,
		}, // units = beats
		{
			expectedLength: ORIGINAL_BAR_DURATION_SECONDS / stepsPerBar,
			secondsPerUnit: barDuration / ORIGINAL_BAR_DURATION_SECONDS,
		}, // legacy seconds (1 bar = 2s)
		{ expectedLength: barDuration / stepsPerBar, secondsPerUnit: 1 }, // already seconds
	];

	return pickSecondsPerUnit(avgLength, candidates, beatDuration);
};

// 指定された秒数を変換する
const convertTime = (value: number | null | undefined, secondsPerUnit: number) =>
	toFiniteNumber(value) * secondsPerUnit;
// アレンジメント再生用タイムラインを構築する
export const buildArrangementPlayback = (
	pattern: Pattern,
	{ tempo }: { tempo: number }
): ArrangementPlaybackTimeline => {
	const events: ArrangementPlaybackEvent[] = [];
	const barDuration = (60 / Math.max(tempo, 1)) * 4;
	const beatDuration = barDuration / BEATS_PER_BAR;
	const melodySecondsPerUnit = computeMelodySecondsPerUnit(pattern, barDuration);
	const rhythmSecondsPerUnit = computeRhythmSecondsPerUnit(pattern, barDuration, beatDuration);

	let maxEnd = 0;

	// Melody
	pattern.melodySegments.forEach((segment) => {
		const note = typeof segment.note === 'string' ? segment.note : null;
		if (!note || note.toLowerCase() === 'rest') return;
		const start = convertTime(segment.start, melodySecondsPerUnit);
		const end = convertTime(segment.end ?? segment.start, melodySecondsPerUnit);
		const duration = clampDuration(end - start);
		events.push({
			type: 'melody',
			start,
			duration,
			note,
			velocity: 0.85,
		});
		maxEnd = Math.max(maxEnd, start + duration);
	});

	// Drums
	pattern.rhythmSegments.forEach((segment) => {
		const label = typeof segment.label === 'string' ? segment.label : '';
		if (label !== 'kick' && label !== 'snare' && label !== 'hihat') return;
		const config = DRUM_DEFAULTS[label];
		const start = convertTime(segment.start, rhythmSecondsPerUnit);
		const rawDuration = convertTime(segment.end ?? segment.start, rhythmSecondsPerUnit) - start;
		const duration = clampDuration(rawDuration, config.duration);
		events.push({
			type: 'drum',
			start,
			duration,
			label,
			velocity: 1,
		});
		maxEnd = Math.max(maxEnd, start + duration);
	});

	// Chords
	const slots = pattern.chordSlots ?? [];
	const chordsPerBar = Math.max(pattern.chordsPerBar ?? 4, 1);
	const bars = Math.max(pattern.bars ?? 1, 1);
	const slotDuration = barDuration / chordsPerBar;

	slots.forEach((slot, index) => {
		const barIndex = Math.floor(index / chordsPerBar);
		const withinBarIndex = index % chordsPerBar;
		const baseStart = barIndex * barDuration + withinBarIndex * slotDuration;
		const plays = Array.isArray(slot.plays) ? slot.plays : ['chord', 'rest'];
		const subDuration = slotDuration / plays.length;
		plays.forEach((playType, pos) => {
			if (playType === 'rest') return;
			const start = baseStart + pos * subDuration;
			const chord = slot.chord ?? { rootIndex: 0, quality: 'maj', tension: '' };
			const resolvedPlayType: Exclude<PlayType, 'rest'> = playType === 'root' ? 'root' : 'chord';
			events.push({
				type: 'chord',
				start,
				duration: clampDuration(subDuration),
				chord,
				playType: resolvedPlayType,
				velocity: playType === 'root' ? 0.7 : 0.9,
			});
			maxEnd = Math.max(maxEnd, start + subDuration);
		});
	});

	const totalLength = Math.max(maxEnd, bars * barDuration);
	events.sort((a, b) => a.start - b.start);

	return { events, length: totalLength };
};
