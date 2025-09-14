// [Model] features/model - ToneMasterBridge.tsx
// 役割: ビジネスロジック/状態操作
import { useEffect } from 'react';
import * as Tone from 'tone';

import { useGlobalAudio } from '@entities/audio/model/GlobalAudioContext';

// Tone.js のコンテキストを GlobalAudioEngine に統一し、
// Tone.Destination をエンジンの master にブリッジする。
export const ToneMasterBridge: React.FC = () => {
  const engine = useGlobalAudio();

  useEffect(() => {
    (async () => {
      await engine.ensureStarted();
      const ctx = engine.audioContext;
      const input = engine.getChannelInput('melody') as unknown as AudioNode | null;
      if (!ctx || !input) return;

      // Tone の Context をエンジンの AudioContext に統一
      try {
        if (Tone.getContext().rawContext !== ctx) {
          const toneCtx = new Tone.Context({ context: ctx as any });
          Tone.setContext(toneCtx);
        }
      } catch {}

      // Tone.Destination をエンジンの master に接続
      try {
        // 既存の出力接続を解除してから master へ
        // @ts-ignore
        Tone.Destination.disconnect();
        // @ts-ignore
        Tone.Destination.connect(input);
      } catch {}
    })();
  }, [engine]);

  return null;
};
