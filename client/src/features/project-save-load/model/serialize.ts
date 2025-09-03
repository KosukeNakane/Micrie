import { useTempo } from "@/entities/tempo/model/TempoContext";
import { useEffects } from "@/entities/effects/model/EffectsContext";
import { useEffectsUiStore } from "@/features/effects";
import { useChannelsStore } from "@/entities/audio/model/useChannelsStore";
import type { ProjectData, MelodyPitchItem } from "@/entities/project";
import { useVolume } from "@/entities/volume/model/VolumeContext";
import { useScaleMode } from "@/entities/scale-mode/model/ScaleModeContext";
import { useChordPattern } from "@/entities/pattern/model/ChordPatternContext";
import { useDrumPattern } from "@/entities/pattern/model/DrumPatternContext";
import { useSegment } from "@/entities/segment/model/SegmentContext";
import { useBarCount } from "@/entities/bar-count/model/BarCountContext";

export function useAssembleProjectData(): () => ProjectData {
  const { tempo } = useTempo();
  const { effects } = useEffects();
  const holdAll = useEffectsUiStore((s) => s.hold);
  const holdByKey = useEffectsUiStore((s) => s.holdByKey);
  const melodyMuted = useChannelsStore((s) => s.melodyMuted);
  const chordMuted = useChannelsStore((s) => s.chordMuted);
  const drumMuted = useChannelsStore((s) => s.drumMuted);
  const { volume } = useVolume();
  const { scaleMode } = useScaleMode();
  const { chordPattern } = useChordPattern();
  const { drumPattern } = useDrumPattern();
  const { melodySegments } = useSegment();
  const { barCount } = useBarCount();

  return () => ({
    tempo: tempo ?? 120,
    chordPattern,
    drumPattern,
    volume: { master: volume },
    scale: { root: 'C', mode: scaleMode },
    effects,
    effectsHold: { holdAll: !!holdAll, holdByKey },
    channelsMuted: { melody: !!melodyMuted, chord: !!chordMuted, drum: !!drumMuted },
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
  });
}
