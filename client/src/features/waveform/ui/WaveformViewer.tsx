// [UI] features/ui - WaveformViewer.tsx
// 役割: 表示・入力のUIコンポーネント
import styled from '@emotion/styled';
import { useEffect, useRef } from 'react';

import { useSegment } from '@entities/segment/model/SegmentContext';

const Canvas = styled.canvas`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1; /* 背景より前・ラベル/エディタより後ろは呼び出し側で管理 */
`;

type Props = { barIndex: number; totalBars: number; buffer?: AudioBuffer | null; width?: number; height?: number };

export const WaveformViewer = ({ barIndex, totalBars, buffer, width = 600, height = 150 }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { audioBuffers, loopMode, setWaveformForBar } = useSegment();
  const { melody: melodyBuffer, rhythm: rhythmBuffer } = audioBuffers;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const sourceBuffer = buffer ?? (loopMode === 'melody' ? melodyBuffer : loopMode === 'rhythm' ? rhythmBuffer : null);
    if (!sourceBuffer) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const drawBuffer = (buf: AudioBuffer, offsetY = 0, heightFraction = 1) => {
      const fullData = buf.getChannelData(0);
      const samplesPerBar = Math.max(1, Math.floor(fullData.length / Math.max(totalBars, 1)));
      const startSample = barIndex * samplesPerBar;
      const endSample = Math.min(fullData.length, startSample + samplesPerBar);
      const data = fullData.subarray(startSample, endSample);
      const width = canvas.width;
      const height = canvas.height * heightFraction;
      ctx.beginPath();
      ctx.moveTo(0, offsetY + height / 2);
      for (let i = 0; i < width; i++) {
        const index = Math.floor((i / width) * data.length);
        const sample = data[index] ?? 0;
        const y = offsetY + (1 - sample) * (height / 2);
        ctx.lineTo(i, y);
      }
      ctx.strokeStyle = 'black';
      ctx.stroke();
    };

    if (buffer) {
      drawBuffer(buffer);
    } else if (loopMode === 'both' && rhythmBuffer && melodyBuffer) {
      drawBuffer(rhythmBuffer, 0, 0.5);
      drawBuffer(melodyBuffer, canvas.height / 2, 0.5);
    } else if (loopMode === 'melody' && melodyBuffer) {
      drawBuffer(melodyBuffer);
    } else if (loopMode === 'rhythm' && rhythmBuffer) {
      drawBuffer(rhythmBuffer);
    }

    try { const url = canvas.toDataURL('image/png'); setWaveformForBar(barIndex, url); } catch {}
  }, [melodyBuffer, rhythmBuffer, loopMode, barIndex, totalBars, setWaveformForBar, buffer, width, height]);

  return <Canvas ref={canvasRef} width={width} height={height} />;
};
