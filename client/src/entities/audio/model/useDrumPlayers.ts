// [Model] entities/model - useDrumPlayers.ts
// 役割: ドラム用のサンプルプレイヤ群（Tone.Players）を用意し、発音APIを提供
import { useEffect, useRef, useCallback } from 'react';
import * as Tone from 'tone';

import { useGlobalAudio } from './GlobalAudioContext';

export type DrumType = 'kick' | 'snare' | 'hihat';

const ensureToneContext = (ctx: AudioContext) => {
  if (Tone.getContext().rawContext !== ctx) {
    const toneCtx = new Tone.Context({ context: ctx as any });
    Tone.setContext(toneCtx);
  }
};

export const useDrumPlayers = () => {
  const engine = useGlobalAudio();
  const playersRef = useRef<Tone.Players | null>(null);

  useEffect(() => {
    (async () => {
      await engine.ensureStarted();
      const ctx = engine.audioContext!;
      ensureToneContext(ctx);

      // 既存のPlayersが他Contextなら破棄
      if (playersRef.current && (playersRef.current.context.rawContext !== Tone.getContext().rawContext)) {
        try { playersRef.current.dispose(); } catch {}
        playersRef.current = null;
      }

      if (!playersRef.current) {
        // 既存のサンプルセットを流用
        const urls: Record<DrumType, string> = {
          kick: '/samples/PublicSamples/Drums/kick135.wav',
          hihat: '/samples/PublicSamples/Drums/Half_Open_Hi-Hat.wav',
          snare: '/samples/PublicSamples/Drums/Snare14.wav',
        };
        const players = new Tone.Players(urls, () => {});
        // ルーティング: エンジンの drum チャンネルへ
        try { players.disconnect(); } catch {}
        const input = engine.getChannelInput('drum') as unknown as AudioNode | null;
        if (input) players.connect(input as any);
        playersRef.current = players;
      }
    })();
    return () => {};
  }, [engine]);

  const trigger = useCallback((type: DrumType, time: number) => {
    try {
      const p = playersRef.current?.player(type);
      // Toneでは time は AudioContext 秒基準。Tone.now() ベースの絶対秒を渡す
      p?.start(time);
    } catch {}
  }, []);

  return { playersRef, trigger } as const;
};
