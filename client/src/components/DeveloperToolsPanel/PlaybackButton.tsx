// 録音されたメロディの一部を再生・停止するボタンコンポーネント。
// 選択されたキャンバス範囲（startX〜endX）に対応する区間を再生する。

import React from 'react';
import { RectButton } from '../shared/RectButton';
import { useSegment } from '../../context/SegmentContext';

type PlaybackButtonProps = {
  isPlaying: boolean;
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
  startX: number;
  endX: number;
  audioBlob: Blob | null;
};

export const PlaybackButton: React.FC<PlaybackButtonProps> = ({
  isPlaying,
  setIsPlaying,
  startX,
  endX,
  // audioBlob,
}) => {
  // SegmentContextから録音された音声のバッファを取得
  const { audioBuffers } = useSegment();
  const recordedBuffer = audioBuffers.melody;

  // 指定したAudioBufferをstartTimeからendTimeまで再生する関数
  const playAudio = (
    buffer: AudioBuffer,
    startTime: number,
    endTime: number
  ) => {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const source = audioCtx.createBufferSource();
    source.buffer = buffer;
    source.connect(audioCtx.destination);

    const duration = endTime - startTime;
    source.start(0, startTime, duration);
  };

  // 再生・停止を切り替える関数
  const togglePlay = () => {
    if (!recordedBuffer) return;

    if (!isPlaying) {
      // キャンバスの横幅に基づいて再生開始・終了時刻を計算
      const canvasWidth = 600;
      const startTime = (startX / canvasWidth) * recordedBuffer.duration;
      const endTime = (endX / canvasWidth) * recordedBuffer.duration;

      playAudio(recordedBuffer, startTime, endTime);
    }

    setIsPlaying((prev) => !prev);
  };

  return (
    <RectButton
      label={isPlaying ? 'Stop Recorded Audio' : 'Play Recorded Audio'}
      active={isPlaying}
      onClick={togglePlay}
      flexGrow={0}
    />
  );
};