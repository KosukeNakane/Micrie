// [Binder] features/model - DirtyBinder.tsx
// 役割: エンジン/Transportとアプリ状態の接続（副作用）
import { useEffect } from "react";

import { useGlobalAudio } from "@entities/audio/model/GlobalAudioContext";
import { useEffects } from "@entities/effects/model/EffectsContext";

// DIRTY フェーダーを GlobalAudioEngine の Waveshaper 歪みにバインド
export const DirtyBinder: React.FC = () => {
  const engine = useGlobalAudio();
  const { effects } = useEffects();

  useEffect(() => {
    const amt = effects.DIRTY ?? 0;
    (async () => { await engine.setDirtyAmount(amt); })();
  }, [effects.DIRTY, engine]);

  return null;
};

