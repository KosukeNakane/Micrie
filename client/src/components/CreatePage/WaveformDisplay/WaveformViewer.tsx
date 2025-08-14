// 音声の AudioBuffer をもとに、canvas に波形を描画するコンポーネント。
// bar単位で分割表示し、ループモードに応じてメロディ・リズムを描画。

import styled from '@emotion/styled';
import { useRef, useEffect } from 'react';
import { useSegment } from '../../../context/SegmentContext';

// 波形描画用のスタイル付きcanvasコンポーネント
const Canvas = styled.canvas`
  position: absolute;
  top: -14px;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0; 
`;

type Props = {
  barIndex: number;
  totalBars: number;
};

export const WaveformViewer = ({ barIndex, totalBars }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 音声バッファやループ状態などを SegmentContext から取得
  const { audioBuffers, loopMode, currentSegments } = useSegment();
  const { melody: melodyBuffer, rhythm: rhythmBuffer } = audioBuffers;

  useEffect(() => {
    console.log("🔄 WaveformViewer useEffect triggered");
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (
      (loopMode === "melody" && !melodyBuffer) ||
      (loopMode === "rhythm" && !rhythmBuffer) ||
      (loopMode === "both" && (!melodyBuffer || !rhythmBuffer))
    ) {
      return; 
    }

    console.log("🎨 あ canvas size:", canvas.width, canvas.height);
    console.log("📊 い melodyBuffer length:", melodyBuffer?.length);
    console.log("📊 う rhythmBuffer length:", rhythmBuffer?.length);
    console.log("📈 え totalBars:", totalBars, "barIndex:", barIndex);
    console.log("🟦 お canvas bounding rect:", canvas.getBoundingClientRect());

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 指定したAudioBufferを、特定のバー範囲に対応する波形としてcanvasに描画
    const drawBuffer = (
      buffer: AudioBuffer,
      offsetY: number = 0,
      heightFraction: number = 1
    ) => {
      const fullData = buffer.getChannelData(0);
      const samplesPerBar = Math.floor(fullData.length / totalBars);
      const startSample = barIndex * samplesPerBar;
      const endSample = startSample + samplesPerBar;
      const data = fullData.subarray(startSample, endSample);

      const width = canvas.width;
      const height = canvas.height * heightFraction;

      ctx.beginPath();
      ctx.moveTo(0, offsetY + height / 2);

      for (let i = 0; i < width; i++) {
        const index = Math.floor((i / width) * data.length);
        const y = offsetY + (1 - data[index]) * (height / 2);
        ctx.lineTo(i, y);
      }

      ctx.strokeStyle = 'black';
      ctx.stroke();
    };

    // loopModeに応じて、描画対象のバッファを切り替える
    if (loopMode === "melody") {
      drawBuffer(melodyBuffer!);
    } else if (loopMode === "rhythm") {
      drawBuffer(rhythmBuffer!);
    } else if (loopMode === "both") {
      drawBuffer(rhythmBuffer!, 0, 0.5);
      drawBuffer(melodyBuffer!, canvas.height / 2, 0.5);
    }
  }, [melodyBuffer, rhythmBuffer, loopMode, barIndex, totalBars, JSON.stringify(currentSegments)]);

  return <Canvas ref={canvasRef} width={600} height={150} />;
};