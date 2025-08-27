import React from 'react';

import { useSegment } from '@entities/segment/model/SegmentContext';
import { useGlobalAudio } from '@entities/audio/model/GlobalAudioContext';
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
  const engine = useGlobalAudio();
  const playAudio = (buffer: AudioBuffer, startTime: number, endTime: number) => {
    const duration = Math.max(0, endTime - startTime);
    engine.playBufferSegment(buffer, startTime, startTime + duration);
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
