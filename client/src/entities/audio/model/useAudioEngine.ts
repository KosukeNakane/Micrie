import { useEffect, useMemo } from 'react';

import { GlobalAudioEngine } from '@entities/audio/lib/GlobalAudioEngine';

export const useAudioEngine = () => {
  const engine = useMemo(() => GlobalAudioEngine.instance, []);
  useEffect(() => {
    (async () => {
      await engine.ensureStarted();
      await engine.initWebAudioFont();
    })();
  }, []);
  return { audioCtx: engine.audioContext, player: engine.player } as const;
};

