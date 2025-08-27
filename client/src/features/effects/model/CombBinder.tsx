import { useEffect } from "react";
import { useGlobalAudio } from "@entities/audio/model/GlobalAudioContext";
import { useEffects } from "@entities/effects/model/EffectsContext";

// COMB フェーダーを GlobalAudioEngine のコンブフィルタへバインド
export const CombBinder: React.FC = () => {
  const engine = useGlobalAudio();
  const { effects } = useEffects();

  useEffect(() => {
    const amt = effects.COMB ?? 0;
    (async () => { await engine.setCombAmount(amt); })();
  }, [effects.COMB, engine]);

  return null;
};

