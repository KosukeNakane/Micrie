import { useEffect, useRef } from 'react';
import { useAnalyser } from '../../hooks/useAnalyser';

const MicVisualizer = () => {
  const canvasRef = useAnalyser(); // useAnalyser から ref を取得
  const xRef = useRef(0); // 現在の描画X位置を保持

  useEffect(() => {
    let animationId: number;

    const draw = () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) {
        animationId = requestAnimationFrame(draw); // canvasができるまでリトライ
        return;
      }

      const analyser = (window as any).analyserNode as AnalyserNode | null;
      if (!analyser) return;

      const dataArray = new Uint8Array(analyser.fftSize);
      analyser.getByteTimeDomainData(dataArray);

      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;

      const x = xRef.current;
      if (x >= width) return;

      const v = dataArray[0] / 128.0;
      const y = (v * height) / 2;

      ctx.beginPath();
      ctx.moveTo(x, centerY);
      ctx.lineTo(x, y);
      ctx.strokeStyle = 'black';
      ctx.stroke();

      if (x % 50 === 0) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.strokeStyle = '#ddd';
        ctx.stroke();
      }

      xRef.current += 1;
      animationId = requestAnimationFrame(draw);
    };

    draw(); // 初回実行

    return () => cancelAnimationFrame(animationId);
  }, [canvasRef]);

  return (
    <canvas
      ref={canvasRef}
      width={600}
      height={150}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 1,
      }}
    />
  );
};

export default MicVisualizer;