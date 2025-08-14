// WebAudioFont を使ったシンセサイザーの初期化を行うカスタムフック。
// ただし AudioContext / WebAudioFontPlayer はローカルに作らず、
// グローバル永続エンジン（GlobalAudioEngine）を使って共有する。

import { useEffect, useMemo } from 'react';
import { GlobalAudioEngine } from '../audio/GlobalAudioEngine';

export const useAudioEngine = () => {
  const engine = useMemo(() => GlobalAudioEngine.instance, []);

  useEffect(() => {
    (async () => {
      await engine.ensureStarted();
      await engine.initWebAudioFont();
      // ここでは stop/disconnect は一切しない（遷移しても継続させるため）
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    audioCtx: engine.audioContext,
    player: engine.player,
  } as const;
};