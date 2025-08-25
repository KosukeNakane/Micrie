import React from 'react';

import { useSegment } from '@entities/segment/model/SegmentContext';
import { RectButton } from '@shared/ui/RectButton';

type PlaybackButtonProps = {
  isPlaying: boolean;
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
  startX: number;
  endX: number;
  audioBlob: Blob | null;
};

export const PlaybackButton: React.FC<PlaybackButtonProps> = ({ isPlaying, setIsPlaying, startX, endX }) => {
  const { audioBuffers } = useSegment();
  const recordedBuffer = audioBuffers.melody;
  const playAudio = (buffer: AudioBuffer, startTime: number, endTime: number) => {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const source = audioCtx.createBufferSource();
    source.buffer = buffer; source.connect(audioCtx.destination);
    const duration = endTime - startTime; source.start(0, startTime, duration);
  };
  const togglePlay = () => {
    if (!recordedBuffer) return;
    if (!isPlaying) {
      const canvasWidth = 600;
      const startTime = (startX / canvasWidth) * recordedBuffer.duration;
      const endTime = (endX / canvasWidth) * recordedBuffer.duration;
      playAudio(recordedBuffer, startTime, endTime);
    }
    setIsPlaying((prev) => !prev);
  };
  return (
    <RectButton label={isPlaying ? 'Stop Recorded Audio' : 'Play Recorded Audio'} active={isPlaying} onClick={togglePlay} flexGrow={0} />
  );
};
