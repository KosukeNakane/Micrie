import styled from '@emotion/styled';
import { useRef, useEffect } from 'react';
import { useSegment } from '@entities/segment/model/SegmentContext';

const Canvas = styled.canvas`
  position: absolute; top: -14px; left: 0; width: 100%; height: 100%; z-index: 0;
`;

type Props = { barIndex: number; totalBars: number };

export const WaveformViewer = ({ barIndex, totalBars }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { audioBuffers, loopMode, currentSegments } = useSegment();
  const { melody: melodyBuffer, rhythm: rhythmBuffer } = audioBuffers;

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return; const ctx = canvas.getContext('2d'); if (!ctx) return;
    if ((loopMode === 'melody' && !melodyBuffer) || (loopMode === 'rhythm' && !rhythmBuffer) || (loopMode === 'both' && (!melodyBuffer || !rhythmBuffer))) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const drawBuffer = (buffer: AudioBuffer, offsetY = 0, heightFraction = 1) => {
      const fullData = buffer.getChannelData(0);
      const samplesPerBar = Math.floor(fullData.length / totalBars);
      const startSample = barIndex * samplesPerBar;
      const endSample = startSample + samplesPerBar;
      const data = fullData.subarray(startSample, endSample);
      const width = canvas.width; const height = canvas.height * heightFraction;
      ctx.beginPath(); ctx.moveTo(0, offsetY + height / 2);
      for (let i = 0; i < width; i++) { const index = Math.floor((i / width) * data.length); const y = offsetY + (1 - data[index]) * (height / 2); ctx.lineTo(i, y); }
      ctx.strokeStyle = 'black'; ctx.stroke();
    };

    if (loopMode === 'melody') drawBuffer(melodyBuffer!);
    else if (loopMode === 'rhythm') drawBuffer(rhythmBuffer!);
    else { drawBuffer(rhythmBuffer!, 0, 0.5); drawBuffer(melodyBuffer!, canvas.height / 2, 0.5); }
  }, [melodyBuffer, rhythmBuffer, loopMode, barIndex, totalBars, JSON.stringify(currentSegments)]);

  return <Canvas ref={canvasRef} width={600} height={150} />;
};

