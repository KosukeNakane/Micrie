import { useTempo } from "@/entities/tempo/model/TempoContext";
import { useEffects } from "@/entities/effects/model/EffectsContext";
import { useEffectsUiStore } from "@/features/effects";
import { useChannelsStore } from "@/entities/audio/model/useChannelsStore";
import type { ProjectData } from "@/entities/project";

export function useAssembleProjectData(): () => ProjectData {
  const { tempo } = useTempo();
  const { effects } = useEffects();
  const holdAll = useEffectsUiStore((s) => s.hold);
  const holdByKey = useEffectsUiStore((s) => s.holdByKey);
  const melodyMuted = useChannelsStore((s) => s.melodyMuted);
  const chordMuted = useChannelsStore((s) => s.chordMuted);
  const drumMuted = useChannelsStore((s) => s.drumMuted);

  return () => ({
    tempo: tempo ?? 120,
    effects,
    effectsHold: { holdAll: !!holdAll, holdByKey },
    channelsMuted: { melody: !!melodyMuted, chord: !!chordMuted, drum: !!drumMuted },
  });
}

