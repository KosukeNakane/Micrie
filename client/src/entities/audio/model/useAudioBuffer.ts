import { useEffect, useState } from 'react';

import { useSegment } from '@entities/segment/model/SegmentContext';

export const useAudioBuffer = (audioBlob: Blob | null) => {
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const { setContextAudioBuffer, recMode } = useSegment();
  useEffect(() => {
    if (!audioBlob) {
      setAudioBuffer(null);
      if (recMode === 'melody' || recMode === 'rhythm') setContextAudioBuffer(recMode, null);
      return;
    }
    const decode = async () => {
      const audioCtx = new AudioContext();
      const arrayBuffer = await audioBlob.arrayBuffer();
      const decoded = await audioCtx.decodeAudioData(arrayBuffer);
      setAudioBuffer(decoded);
      if (recMode === 'melody' || recMode === 'rhythm') setContextAudioBuffer(recMode, decoded);
    };
    decode();
  }, [audioBlob]);
  return audioBuffer;
};
