// [Model] features/model - serialize.ts
// 役割: ビジネスロジック/状態操作
import { useChannelsStore } from '@/entities/audio';
import { useBarCount } from '@/entities/bar-count';
import { useEffects } from '@/entities/effects';
import { useChordPattern } from '@/entities/pattern';
import { useDrumPattern } from '@/entities/pattern';
import { useArrangementStore } from '@/entities/pattern/model/arrangementStore';
import { useEditingPatternStore } from '@/entities/pattern/model/editingPatternStore';
import { useSavedPatternStore } from '@/entities/pattern/model/savedPatternStore';
import { usePatternEditor } from '@/entities/pattern/model/usePatternEditor';
import type { ProjectData, MelodyPitchItem } from '@/entities/project';
import { useScaleMode } from '@/entities/scale-mode';
import { useTempo } from '@/entities/tempo';
import { useVolume } from '@/entities/volume';
import { useEffectsUiStore } from '@/features/effects';

const cloneSegments = (segments: any[] | undefined | null) =>
	Array.isArray(segments) ? segments.map((seg) => ({ ...seg })) : [];

export function useAssembleProjectData(): () => ProjectData {
	const { tempo } = useTempo();
	const { effects } = useEffects();
	const holdAll = useEffectsUiStore((s) => s.hold);
	const holdByKey = useEffectsUiStore((s) => s.holdByKey);
	const melodyMuted = useChannelsStore((s) => s.melodyMuted);
	const chordMuted = useChannelsStore((s) => s.chordMuted);
	const drumMuted = useChannelsStore((s) => s.drumMuted);
	const samplerMuted = useChannelsStore((s) => s.samplerMuted);
	const samplerVolume = useChannelsStore((s) => s.samplerVolume);
	const melodyVolume = useChannelsStore((s) => s.melodyVolume);
	const chordVolume = useChannelsStore((s) => s.chordVolume);
	const drumVolume = useChannelsStore((s) => s.drumVolume);
	const { volume } = useVolume();
	const { scaleMode } = useScaleMode();
	const { chordPattern } = useChordPattern();
	const { bars: chordBars, chordsPerBar, chordSlots, melodySegments } = usePatternEditor();
	const { drumPattern } = useDrumPattern();
	const arrangementSlots = useArrangementStore((state) => state.slots);
	const { barCount } = useBarCount();

	const serializeSavedPatterns = () => {
		const { patterns } = useSavedPatternStore.getState();
		return patterns.map((slot) => {
			if (!slot.pattern) return null;
			return {
				id: slot.pattern.id,
				name: slot.name,
				bars: slot.pattern.bars,
				chordsPerBar: slot.pattern.chordsPerBar,
				chordSlots: slot.pattern.chordSlots.map((entry) => ({
					chord: { ...entry.chord },
					plays: [...entry.plays] as ['chord' | 'root' | 'rest', 'chord' | 'root' | 'rest'],
				})),
				melodySegments: cloneSegments(slot.pattern.melodySegments),
				rhythmSegments: cloneSegments(slot.pattern.rhythmSegments),
			};
		});
	};

	return () => {
		if (chordBars == null || chordsPerBar == null) {
			throw new Error('Pattern not ready');
		}
		const editingPattern = useEditingPatternStore.getState().pattern;
		return {
			tempo: tempo ?? 120,
			chordPattern,
			chordsProgression: {
				bars: chordBars,
				chordsPerBar,
				slots: chordSlots.map((slot) => ({ chord: slot.chord, plays: slot.plays })),
			},
			drumPattern,
			volume: {
				master: volume,
				melody: melodyVolume,
				chord: chordVolume,
				drum: drumVolume,
				sampler: samplerVolume,
			},
			scale: { root: 'C', mode: scaleMode },
			effects,
			effectsHold: { holdAll: !!holdAll, holdByKey },
			channelsMuted: {
				melody: !!melodyMuted,
				chord: !!chordMuted,
				drum: !!drumMuted,
				sampler: !!samplerMuted,
			},
			// メロディーピッチ: 解析結果がある場合は note のみ保存、無ければ全休符で初期化
			melodyPitch: ((): MelodyPitchItem[] => {
				if (Array.isArray(melodySegments) && melodySegments.length > 0) {
					return melodySegments.map((seg) => ({
						note:
							typeof seg.note === 'string' && seg.note
								? seg.note
								: seg.label === 'rest'
								? 'rest'
								: 'rest',
					}));
				}
				const length = Math.max(1, (barCount ?? 2) * 4); // デフォルト2小節 x 4拍
				return Array.from({ length }, (): MelodyPitchItem => ({ note: 'rest' }));
			})(),
			arrangementSlots: arrangementSlots.map((slot) => slot.patternId),
			savedPatterns: serializeSavedPatterns(),
			lastEditingPatternId: editingPattern?.id ?? null,
		};
	};
}
