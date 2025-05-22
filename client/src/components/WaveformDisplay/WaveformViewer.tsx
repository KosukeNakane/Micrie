import styled from '@emotion/styled';
import { useRef, useEffect } from 'react';

const Canvas = styled.canvas`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0; // 波形を下に
`;

type Props = {
  audioBuffer: AudioBuffer;
};

export const WaveformViewer = ({ audioBuffer }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!audioBuffer || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const data = audioBuffer.getChannelData(0);
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);
    ctx.beginPath();
    ctx.moveTo(0, height / 2);

    for (let i = 0; i < width; i++) {
      const index = Math.floor((i / width) * data.length);
      const y = (1 - data[index]) * (height / 2);
      ctx.lineTo(i, y);
    }

    ctx.strokeStyle = 'black';
    ctx.stroke();
  }, [audioBuffer]);

  return <Canvas ref={canvasRef} width={600} height={150} />;
};