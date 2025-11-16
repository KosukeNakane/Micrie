// [Model] features/model - serialize.ts
// 役割: ビジネスロジック/状態操作
import { useChannelsStore } from "@/entities/audio";
import { useBarCount } from "@/entities/bar-count";
import { useChords } from "@/entities/chords";
import { useEffects } from "@/entities/effects";
import { useChordPattern } from "@/entities/pattern";
import { useDrumPattern } from "@/entities/pattern";
import { useArrangementPatternsStore } from "@/entities/arrangement";
import type { ProjectData, MelodyPitchItem, ProjectArrangementPattern } from "@/entities/project";
import { useScaleMode } from "@/entities/scale-mode";
import { useSegment } from "@/entities/segment";
import { useTempo } from "@/entities/tempo";
import { useVolume } from "@/entities/volume";
import { useEffectsUiStore } from "@/features/effects";

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
  const { bars: chordBars, chordsPerBar, slots } = useChords();
  const { drumPattern } = useDrumPattern();
  const arrangementPatterns = useArrangementPatternsStore((state) => state.patterns);
  const { melodySegments } = useSegment();
  const { barCount } = useBarCount();

  const serializeArrangements = (): Array<ProjectArrangementPattern | null> =>
    arrangementPatterns.map((pattern) => {
      if (!pattern) return null;
      return {
        id: pattern.id,
        name: pattern.name,
        savedAt: pattern.savedAt,
        snapshot: {
          chordPattern: pattern.snapshot.chordPattern,
          drumPattern: pattern.snapshot.drumPattern,
          chords: {
            bars: pattern.snapshot.chords.bars,
            chordsPerBar: pattern.snapshot.chords.chordsPerBar,
            slots: pattern.snapshot.chords.slots.map((s) => ({
              chord: { ...s.chord },
              plays: [...s.plays] as ['chord' | 'root' | 'rest', 'chord' | 'root' | 'rest'],
            })),
          },
          melody: {
            barCount: pattern.snapshot.melody.barCount,
            segments: pattern.snapshot.melody.segments.map((seg) => ({ ...seg })),
          },
          rhythmSegments: pattern.snapshot.rhythmSegments.map((seg) => ({ ...seg })),
        },
      } satisfies ProjectArrangementPattern;
    });

  return () => ({
    tempo: tempo ?? 120,
    chordPattern,
    chordsProgression: {
      bars: chordBars,
      chordsPerBar,
      slots: slots.map((slot) => ({ chord: slot.chord, plays: slot.plays })),
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
    channelsMuted: { melody: !!melodyMuted, chord: !!chordMuted, drum: !!drumMuted, sampler: !!samplerMuted },
    // メロディーピッチ: 解析結果がある場合は note のみ保存、無ければ全休符で初期化
    melodyPitch: ((): MelodyPitchItem[] => {
      if (Array.isArray(melodySegments) && melodySegments.length > 0) {
        return melodySegments.map((seg) => ({
          note: (typeof seg.note === 'string' && seg.note) ? seg.note : (seg.label === 'rest' ? 'rest' : 'rest'),
        }));
      }
      const length = Math.max(1, (barCount ?? 2) * 4); // デフォルト2小節 x 4拍
      return Array.from({ length }, (): MelodyPitchItem => ({ note: 'rest' }));
    })(),
    arrangements: serializeArrangements(),
  });
}
