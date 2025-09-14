import React, { useEffect, useMemo, useRef, useState } from 'react';

import { useScaleMode } from '@entities/scale-mode/model/ScaleModeContext';
import { useSegment } from '@entities/segment/model/SegmentContext';
import { useTempo } from '@entities/tempo/model/TempoContext';

// 旧 useMelodyLoopScheduler のロジックを Binder に移行（発音処理は含まない既存仕様を維持）
export const MelodyPlaybackBinder: React.FC = () => {
  const { scaleMode } = useScaleMode();
  const scaleModeRef = useRef(scaleMode);
  useEffect(() => { scaleModeRef.current = scaleMode; }, [scaleMode]);

  const segmentsRef = useRef<any[] | null>(null);
  const { loopMode, currentSegments } = useSegment();
  const [isLooping, setIsLooping] = useState(false);
  const isLoopingRef = useRef(false);
  const { tempo } = useTempo();

  useEffect(() => { isLoopingRef.current = isLooping; }, [isLooping]);

  const { chunkDuration } = useMemo(() => {
    const beatDuration = 60 / tempo;
    const chunkDuration = beatDuration * 0.5; // 1/2 拍
    return { chunkDuration };
  }, [tempo]);

  useEffect(() => {
    if (loopMode === 'rhythm') {
      return;
    }
    segmentsRef.current = currentSegments.melody;
    setIsLooping(true);
    isLoopingRef.current = true;

    const playableSegments = segmentsRef.current || [];
    let index = 0;
    const total = playableSegments.length;

    const loop = () => {
      if (!isLoopingRef.current || total === 0) return;
      index = (index + 1) % total;
      setTimeout(loop, chunkDuration * 1000);
    };

    setTimeout(loop, chunkDuration * 1000);

    return () => {
      setIsLooping(false);
      isLoopingRef.current = false;
    };
  }, [loopMode, currentSegments.melody, chunkDuration]);

  return null;
};
