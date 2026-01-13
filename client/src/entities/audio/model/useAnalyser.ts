// [Model] entities/model - useAnalyser.ts
// 役割: ビジネスロジック/状態操作
// マイク入力を取得し、リアルタイムで波形をcanvasに描画するカスタムフック
import { useEffect, useRef } from 'react';

export const useAnalyser = (): React.RefObject<HTMLCanvasElement | null> => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  // null安全のため、常に Uint8Array を保持（初期は長さ0）
  const dataArrayRef = useRef<Uint8Array>(new Uint8Array(0));
  const rafIdRef = useRef<number | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    const init = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 2048;
        source.connect(analyser);
        const bufferLength = analyser.frequencyBinCount;
        audioCtxRef.current = audioCtx;
        analyserRef.current = analyser;
        dataArrayRef.current = new Uint8Array(bufferLength);
      } catch (e) {
        console.error('[useAnalyser] init failed', e);
      }
    };
    init();

    // 単一のRAFループで常時監視し、準備が整っていれば描画する
    const tick = () => {
      const canvas = canvasRef.current;
      const analyser = analyserRef.current;
      const dataArray = dataArrayRef.current; // 常に Uint8Array
      if (canvas && analyser) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          try {
            analyser.getByteTimeDomainData(dataArray as Uint8Array<ArrayBuffer>);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.lineWidth = 2;
            ctx.strokeStyle = '#333';
            ctx.beginPath();
            const bufferLength = dataArray.length;
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
          } catch {
            // Safari などで一時的に取得に失敗するケースを安全にスキップ
            // 次フレームで再試行する
          }
        }
      }
      rafIdRef.current = requestAnimationFrame(tick);
    };
    rafIdRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
      }
      if (audioCtxRef.current) {
        try { audioCtxRef.current.close(); } catch { }
        audioCtxRef.current = null;
      }
      analyserRef.current = null;
      dataArrayRef.current = new Uint8Array(0);
    };
  }, []);

  // 追加の副作用は不要（単一ループで管理）

  return canvasRef;
};
