import { useEffect } from "react";

import { useGlobalAudio } from "@entities/audio/model/GlobalAudioContext";
import { useEffects } from "@entities/effects/model/EffectsContext";

// CRUSH フェーダーを GlobalAudioEngine のディストーションへ橋渡し
export const CrushBinder: React.FC = () => {
  const engine = useGlobalAudio();
  const { effects } = useEffects();

  useEffect(() => {
    const amt = effects.CRUSH ?? 0;
    (async () => { await engine.setCrushAmount(amt); })();
  }, [effects.CRUSH, engine]);

  return null;
};

