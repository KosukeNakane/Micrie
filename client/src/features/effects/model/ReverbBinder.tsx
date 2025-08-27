import { useEffect } from "react";
import { useGlobalAudio } from "@entities/audio/model/GlobalAudioContext";
import { useEffects } from "@entities/effects/model/EffectsContext";

// アプリ全体で1度だけマウントされ、EffectsContextのREVERB値を
// GlobalAudioEngine のリバーブにブリッジするコンポーネント。
export const ReverbBinder: React.FC = () => {
  const engine = useGlobalAudio();
  const { effects } = useEffects();

  useEffect(() => {
    const wet = effects.REVERB ?? 0;
    const enabled = wet > 0;
    (async () => {
      await engine.setReverbWet(wet);
      await engine.setReverbEnabled(enabled);
    })();
  }, [effects.REVERB, engine]);

  return null;
};

