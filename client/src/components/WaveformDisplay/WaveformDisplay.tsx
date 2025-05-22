import { useState, useEffect, useRef, useContext } from 'react';
import styled from '@emotion/styled';
import { WaveformViewer } from './WaveformViewer';
import { useAudioBuffer } from '../../hooks/useAudioBuffer';
import { playAudio } from '../../utils/playAudio';
import { TempoContext } from '../../context/TempoContext';
import { useAnalyser } from '../../hooks/useAnalyser';

type Segment = {
  label: string;
  start: number;
  end: number;
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 600px;
  border: 2px solid black;
  margin: 20px auto;
  background: #fff;
`;

const WaveformArea = styled.div`
  position: relative;
  height: 150px;
  background: #eee;
  overflow: hidden;
`;


//　◯◯◯◯◯オレンジ線(Marker)が今要らないので一旦非表示にしてる

// const Marker = styled.div<{ x: number }>`
//   position: absolute;
//   left: ${({ x }) => `${x}px`};
//   top: 0;
//   bottom: 0;
//   width: 4px;
//   background: orange;
//   cursor: ew-resize;
//   z-index: 3;
// `;

const ButtonArea = styled.div`
  padding: 10px;
  text-align: center;
  border-top: 2px solid black;
`;

const PlayButton = styled.button`
  padding: 8px 16px;
  font-weight: bold;
  font-size: 16px;
`;

//再生時刻を表す線
//backgroudが線の色
const Playhead = styled.div<{ x: number }>`
  position: absolute;
  top: 0;
  bottom: 0;
  left: ${({ x }) => `${x}px`};
  width: 2px;
  background: red;
  z-index: 2;
`;

//点線ライン
const GuideLine = styled.div<{ left: number }>`
  position: absolute;
  top: 0;
  bottom: 0;
  left: ${({ left }) => `${left}px`};
  width: 1px;
  border-left: 1px dashed #888;
  pointer-events: none;
  z-index: 1;
`;

type Props = {
  audioBlob: Blob | null;
  isRecording: boolean; // 追加
  segments: Segment[];
};

//再生時刻を表すアニメーション
export const WaveformDisplay = ({audioBlob, isRecording, segments}: Props) => {
  const canvasRef = useAnalyser(); 
  const { tempo } = useContext(TempoContext)!; // tempo context を取得
  const [isPlaying, setIsPlaying] = useState(false);
  
  const togglePlay = () => {

    

    if (!audioBuffer) return;
  
    if (!isPlaying) {
      const canvasWidth = 600;
      const startTime = (startX / canvasWidth) * audioBuffer.duration;
      const endTime = (endX / canvasWidth) * audioBuffer.duration;
  
      playAudio(audioBuffer, startTime, endTime);
    }
  
    setIsPlaying((prev) => !prev);
  };

  
  
  const audioBuffer = useAudioBuffer(audioBlob);

  const [playheadX, setPlayheadX] = useState(0); // 0 〜 幅(px)

  const [startX, setStartX] = useState(0); // px単位の開始位置（例: 150px）
  const [endX, setEndX] = useState(596);     // 終了位置（例: 450px）
  const [dragging, setDragging] = useState<'start' | 'end' | null>(null);
  
  const waveformRef = useRef<HTMLDivElement>(null);
  const waveformLeftRef = useRef(0);
  const [canvasWidth, setCanvasWidth] = useState(600);
  
  const tempoRef = useRef(tempo);
  useEffect(() => {
    if (isPlaying || isRecording) {
      tempoRef.current = tempo; // ← 録音/再生の直前に tempo を保存
    }
  }, [isPlaying, isRecording, tempo]);


  useEffect(() => {
    if (!isPlaying && !isRecording) return;
  
    //　◯◯◯◯◯オレンジ線(Marker)が今要らないので一旦非表示にしてる

    // const startTime = (startX / canvasWidth) * audioBuffer.duration;
    // const endTime = (endX / canvasWidth) * audioBuffer.duration;
    // const duration = (endTime - startTime)  * 1000; // オレンジ線の幅

    const start = performance.now();
  

    // audioBuffer あり: 実際のdurationから計算 / 無し: tempoベースで仮のdurationを計算
    const duration = (240 / tempoRef.current) * 1000; // ← tempoRef で確定したテンポを使う

  

    const animate = (now: number) => {
      const elapsed = now - start; // 再生時間（ms）

      // if (!audioBuffer) return //nullを除外してAudioBufferのみに型を絞る
      
      const progress = elapsed / duration;
      const rangeX = endX - startX;
      const x = startX + progress * rangeX;
      /*canvasサイズ
      rangeXにオレンジ線の範囲を入れる
      xに終了点の座標を入れ込む  
      */
      setPlayheadX(x);
  
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsPlaying(false); // ← 再生が終わったら自動で停止
      }
    };

    requestAnimationFrame(animate);
  }, [isPlaying, isRecording, audioBuffer, tempo]);

  useEffect(() => {
    if (waveformRef.current) {
      const rect = waveformRef.current.getBoundingClientRect();
      setCanvasWidth(rect.width);
      waveformLeftRef.current = rect.left; 
    }
  }, []);
  
    

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragging) return;
  
      const newX = e.clientX - waveformLeftRef.current;; //waveformLeftRef はエリアの左端
      const clampedX = Math.max(0, Math.min(canvasWidth-4, newX)); // 画面外に出ないようにする

      
      if (dragging === 'start') {
        setStartX(Math.min(clampedX, endX - 4)); // 終点より左まで
      } else {
        setEndX(Math.max(clampedX, startX + 4)); // 始点より右まで
      }
    };
  
    const handleMouseUp = () => setDragging(null);
  
    if (dragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
  
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging, startX, endX]);

  useEffect(() => {
    console.log("isRecording 状態:", isRecording);
  }, [isRecording]);

  return (
    <Container>
      <WaveformArea ref={waveformRef}>
        {isRecording && (
          <canvas
            ref={canvasRef}
            width={canvasWidth}
            height={150}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              zIndex: 0,
            }}
          />
        )}
        {audioBuffer && <WaveformViewer audioBuffer={audioBuffer} />}
        {/* ◯◯◯◯◯オレンジ線(Marker)が今要らないので一旦非表示にしてる */}

        {/* <Marker
            x={startX}
            onMouseDown={() => setDragging('start')}
        />
        <Marker
            x={endX}
             onMouseDown={() => setDragging('end')}
        /> */}

        {Array.from({ length: 7 }).map((_, i) => (
         <GuideLine key={i} left={(canvasWidth / 8) * (i + 1)} />
        ))}

        {/* Render segment labels */}
        {segments.map((seg, index) => {
          const durationSec = 240 / tempoRef.current;
          const startX = (seg.start / durationSec) * canvasWidth;
          return (
            <div
              key={index}
              style={{
                position: 'absolute',
                top: 0,
                left: `${startX}px`,
                background: 'rgba(255, 255, 0, 0.8)',
                fontSize: 12,
                padding: '2px 4px',
                borderRadius: '4px',
                zIndex: 4,
              }}
            >
              {seg.label}
            </div>
          );
        })}
        <Playhead x={playheadX}/>
      </WaveformArea>

      <ButtonArea>
        <PlayButton onClick={togglePlay}>
          {isPlaying ? '■ STOP' : '▶ PLAY'}
        </PlayButton>
      </ButtonArea>
    </Container>
  );
};