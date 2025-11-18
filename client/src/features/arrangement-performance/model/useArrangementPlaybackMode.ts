// [Model] features/model - useArrangementPlaybackMode.ts
// 役割: アレンジメント再生モードの UI 用ヘルパー
import { useCallback } from 'react';

import { useArrangementStore } from '@/entities/pattern/model/arrangementStore';

type ArrangementPlaybackMode = 'arrangement' | 'off';

export const useArrangementPlaybackMode = () => {
  const mode = useArrangementStore((state) => state.playbackMode);
  const setMode = useArrangementStore((state) => state.setPlaybackMode);

  const handleChange = useCallback((next: ArrangementPlaybackMode) => {
    setMode(next);
  }, [setMode]);

  return { mode, setMode: handleChange } as const;
};
