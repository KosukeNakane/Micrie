// [Model] features/model - useArrangementPlaybackMode.ts
// 役割: アレンジメント再生モードの UI 用ヘルパー
import { useCallback } from 'react';

import {
  useArrangementPlayerStore,
  selectArrangementPlaybackMode,
  type ArrangementPlaybackMode,
} from '@/entities/arrangement';

export const useArrangementPlaybackMode = () => {
  const mode = useArrangementPlayerStore(selectArrangementPlaybackMode);
  const setMode = useArrangementPlayerStore((state) => state.setPlaybackMode);

  const handleChange = useCallback((next: ArrangementPlaybackMode) => {
    setMode(next);
  }, [setMode]);

  return { mode, setMode: handleChange } as const;
};
