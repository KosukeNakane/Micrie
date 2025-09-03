import { useTempo } from "@/entities/tempo/model/TempoContext";
import { useEffects } from "@/entities/effects/model/EffectsContext";
import { useEffectsUiStore } from "@/features/effects";
import { useChannelsStore } from "@/entities/audio/model/useChannelsStore";
import type { ProjectData } from "@/entities/project";
import { useVolume } from "@/entities/volume/model/VolumeContext";
import { useScaleMode } from "@/entities/scale-mode/model/ScaleModeContext";
import { useChordPattern } from "@/entities/pattern/model/ChordPatternContext";
import { useDrumPattern } from "@/entities/pattern/model/DrumPatternContext";

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

  return () => ({
    tempo: tempo ?? 120,
    chordPattern,
    drumPattern,
    volume: { master: volume },
    scale: { root: 'C', mode: scaleMode },
    effects,
    effectsHold: { holdAll: !!holdAll, holdByKey },
    channelsMuted: { melody: !!melodyMuted, chord: !!chordMuted, drum: !!drumMuted },
  });
}
