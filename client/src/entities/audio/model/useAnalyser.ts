// マイク入力を取得し、リアルタイムで波形をcanvasに描画するカスタムフック
import { useEffect, useRef } from 'react';

export const useAnalyser = (): React.RefObject<HTMLCanvasElement | null> => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx || !analyserRef.current) return;
    const draw = () => {
      const dataArray = dataArrayRef.current;
      if (!dataArray) return;
      analyserRef.current!.getByteTimeDomainData(dataArray);
      ctx.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
      ctx.beginPath();
      for (let i = 0; i < dataArray.length; i++) {
        const x = (i / dataArray.length) * canvasRef.current!.width;
        const y = (dataArray[i] / 255) * canvasRef.current!.height;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
      requestAnimationFrame(draw);
    };
    draw();
  }, [canvasRef.current]);

  useEffect(() => {
    const init = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioCtx = new AudioContext();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 2048;
      source.connect(analyser);
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      audioCtxRef.current = audioCtx;
      analyserRef.current = analyser;
      dataArrayRef.current = dataArray;
      draw();
    };
    const draw = () => {
      if (!canvasRef.current || !analyserRef.current || !dataArrayRef.current) return;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const analyser = analyserRef.current;
      const dataArray = dataArrayRef.current;
      const bufferLength = analyser.frequencyBinCount;
      const renderFrame = () => {
        requestAnimationFrame(renderFrame);
        analyser.getByteTimeDomainData(dataArray);
        ctx.fillStyle = '#ddd';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#333';
        ctx.beginPath();
        const sliceWidth = canvas.width / bufferLength;
        let x = 0;
        for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 128.0;
          const y = (v * canvas.height) / 2;
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
          x += sliceWidth;
        }
        ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.stroke();
      };
      renderFrame();
    };
    init();
  }, []);

  return canvasRef;
};
