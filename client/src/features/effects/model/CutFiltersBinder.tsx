// [Binder] features/model - CutFiltersBinder.tsx
// 役割: エンジン/Transportとアプリ状態の接続（副作用）
import { useEffect } from "react";

import { useGlobalAudio } from "@entities/audio/model/GlobalAudioContext";
import { useEffects } from "@entities/effects/model/EffectsContext";

// アプリ全体で1度だけマウントされ、EffectsContextのHICUT/LOWCUT値を
// GlobalAudioEngine のマスター・カットフィルタへ橋渡しするコンポーネント。
export const CutFiltersBinder: React.FC = () => {
  const engine = useGlobalAudio();
  const { effects } = useEffects();

  // LOWCUT: 値が大きいほど高いカットオフ（= 低域をより多くカット）
  useEffect(() => {
    const amt = effects.LOWCUT ?? 0;
    (async () => { await engine.setLowcutAmount(amt); })();
  }, [effects.LOWCUT, engine]);

  // HICUT: 値が大きいほど低いカットオフ（= 高域をより多くカット）
  useEffect(() => {
    const amt = effects.HICUT ?? 0;
    (async () => { await engine.setHicutAmount(amt); })();
  }, [effects.HICUT, engine]);

  return null;
};

