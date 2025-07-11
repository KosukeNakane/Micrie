// 渡された audioBlob をデコードして AudioBuffer を取得するカスタムフック
// React コンポーネントで audioBlob の変更を監視し、自動的に AudioBuffer に変換して返す

import { useEffect, useState } from 'react';
import { useSegment } from '../context/SegmentContext';

// デコードされた AudioBuffer を保持するState
export const useAudioBuffer = (audioBlob: Blob | null) => {

  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const { setContextAudioBuffer, recMode } = useSegment();

  // audioBlob の変更を監視し、AudioBuffer にデコードしてStateに格納する
  useEffect(() => {

    if (!audioBlob) {
      setAudioBuffer(null);
      if (recMode === "melody" || recMode === "rhythm") {
        setContextAudioBuffer(recMode, null);
      }
      return;
    }
    
    // 非同期で audioBlob を AudioBuffer に変換する関数
    const decode = async () => {

      const audioCtx = new AudioContext();
      const arrayBuffer = await audioBlob.arrayBuffer();
      const decoded = await audioCtx.decodeAudioData(arrayBuffer);
      
      setAudioBuffer(decoded);
      if (recMode === "melody" || recMode === "rhythm") {
        setContextAudioBuffer(recMode, decoded);
      }
    };
    
    decode();
  }, [audioBlob]);

  return audioBuffer;
};