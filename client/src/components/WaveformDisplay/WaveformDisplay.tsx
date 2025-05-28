// 波形表示・再生・ループ・セグメントラベル描画を担うメインUIコンポーネント
// 録音やループ再生、プレイヘッド移動、セグメントの可視化処理を統合
import { useState, useEffect, useRef } from 'react';

import * as Tone from 'tone';
import styled from '@emotion/styled';

import { useAudioBuffer } from '../../hooks/useAudioBuffer';
import { useTempo } from '../../context/TempoContext';
import { useAnalyser } from '../../hooks/useAnalyser';
import { useDrumLoop } from '../../hooks/useDrumLoop';
import { useMelodyLoop } from '../../hooks/useMelodyLoop';

import { useRecording } from '../../context/RecordingContext';
import { useRecordingUI } from '../../context/RecordingUIContext';
import { useSegment } from '../../context/SegmentContext';

import { WaveformViewer } from './WaveformViewer';
import { RectButton } from '../shared/RectButton';
import { StyledArea } from '../shared/StyledArea';

import { playAudio } from '../../utils/playAudio';

export const CenteredArea = styled(StyledArea)`
  flex-direction: column;
  max-width: 600px;
  margin: 20px auto;
`;

const WaveformArea = styled(StyledArea)`
  position: relative;
  height: 150px;
  overflow: hidden;
  width: 90%;
  max-width: 600px;
  margin: 0px auto;
`;

const SegmentLabel = styled(StyledArea)`
  position: absolute;
  top: 0;
  background: linear-gradient(135deg,rgba(255, 248, 56, 0.76),rgb(255, 210, 97));
  font-family: "brandon-grotesque", sans-serif;
  font-size: 16px;
  padding: 0px 4px;
  border-radius: 4px;
  z-index: 4;
`;

const ButtonArea = styled.div`
  height: 40px;
  display: flex;
  padding: 2px;
  text-align: center;
  gap: 8px;
`;

const PlaybackButton = styled(RectButton)`
  padding: 8px 16px;
  font-weight: bold;
  font-size: 14px;
`;

const CustomDrumButton = styled(PlaybackButton)`
  margin-left: 8px;
`;
const Playhead = styled.div<{ x: number }>`
  position: absolute;
  top: 0;
  bottom: 0;
  left: ${({ x }) => `${x}px`};
  width: 2px;
  background: linear-gradient(135deg,rgba(255, 159, 56, 0.76),rgb(255, 97, 97));
  z-index: 2;
`;

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
};
export const WaveformDisplay = ({audioBlob}: Props) => {
  // セグメントとループモードの状態管理
  const { currentSegments, loopMode, setLoopMode, rhythmSegments, melodySegments } = useSegment();
  // 録音状態の取得
  const { isRecording } = useRecording();
  const canvasRef = useAnalyser(); 
  const { tempo } = useTempo();
  const { isPlaying, setIsPlaying, playheadX, setPlayheadX, setIsDrawing, isDrawing } = useRecordingUI();
  const [isLooping, setIsLooping] = useState(false);

  const { startRhythm, stopRhythm } = useDrumLoop();

  const { playMelody, stopMelody } = useMelodyLoop();

  // PLAY/STOPボタンによる音声再生の切り替え処理
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

  // LOOPボタンによるループ再生の切り替え処理
  const toggleLoop = () => {
    if (!isLooping) {
      if (loopMode === 'rhythm') {
        startRhythm();
        Tone.getTransport().start();
      } else if (loopMode === 'melody') {
        playMelody();
        Tone.getTransport().start();
      } else if (loopMode === 'both') {
        startRhythm();
        playMelody();
        Tone.getTransport().start();
      }
    } else {
      if (loopMode === 'rhythm') {
        stopRhythm();
        Tone.getTransport().stop();   
        Tone.getTransport().cancel(); 
      } else if (loopMode === 'melody') {
        stopMelody();
        Tone.getTransport().stop();   
        Tone.getTransport().cancel(); 
      } else if (loopMode === 'both') {
        stopRhythm();
        stopMelody();
        Tone.getTransport().stop();   
        Tone.getTransport().cancel(); 
      }
    }
    setIsLooping(!isLooping);
  };

  const audioBuffer = useAudioBuffer(audioBlob);


  const [startX, setStartX] = useState(0);
  const [endX, setEndX] = useState(596);
  const [dragging, setDragging] = useState<'start' | 'end' | null>(null);
  
  const waveformRef = useRef<HTMLDivElement>(null);
  const waveformLeftRef = useRef(0);
  const [canvasWidth, setCanvasWidth] = useState(600);
  
  const tempoRef = useRef(tempo);
  useEffect(() => {
    tempoRef.current = tempo;
  }, [tempo]);

  const startTimeRef = useRef<number | null>(null);
  const animationRef = useRef<number | null>(null);

  // 再生・録音中にプレイヘッドをアニメーションさせる処理
  useEffect(() => {
    if (!isPlaying && !isRecording) {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      setPlayheadX(0);
      return;
    }

    startTimeRef.current = performance.now();
    const duration = (240 / tempoRef.current) * 1000;

    const animate = (now: number) => {
      if (!isPlaying && !isRecording) {
        setPlayheadX(0);
        return;
      }

      const elapsed = now - (startTimeRef.current ?? now);
      const progress = elapsed / duration;
      const rangeX = endX - startX;
      const x = startX + progress * rangeX;
      setPlayheadX(x);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setIsPlaying(false);
        setPlayheadX(0);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [isPlaying, isRecording, tempo, audioBuffer, startX, endX]);

  // コンポーネントマウント時にcanvas幅とleft位置を取得
  useEffect(() => {
    if (waveformRef.current) {
      const rect = waveformRef.current.getBoundingClientRect();
      setCanvasWidth(rect.width);
      waveformLeftRef.current = rect.left; 
    }
  }, []);
  
  // 波形範囲選択のドラッグ処理
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragging) return;
  
      const newX = e.clientX - waveformLeftRef.current;; 
      const clampedX = Math.max(0, Math.min(canvasWidth-4, newX)); 

      
      if (dragging === 'start') {
        setStartX(Math.min(clampedX, endX - 4)); 
      } else {
        setEndX(Math.max(clampedX, startX + 4)); 
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

  // 録音停止時に再生状態と描画状態を初期化
  useEffect(() => {
  }, [isRecording]);

// 録音停止時に再生状態と描画状態を初期化
useEffect(() => {
  if (!isRecording) {
    console.log()
    setPlayheadX(0);
    startTimeRef.current = null;
    setIsDrawing(false);
  }
}, [isRecording, setIsDrawing, setPlayheadX]);

  return (
    <CenteredArea>
      <WaveformArea ref={waveformRef}>
        {isDrawing && (
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
       
        {Array.from({ length: 7 }).map((_, i) => (
         <GuideLine key={i} left={(canvasWidth / 8) * (i + 1)} />
        ))}

        {/* Labelの描画 */}
        {loopMode === 'both' ? (
          <>
            {rhythmSegments.map((seg, i) => {
              const x = Math.floor((i / 8) * canvasWidth);
              return (
                <SegmentLabel
                  key={`rhythm-${seg.label}-${i}`}
                  style={{ left: `${x}px`, top: `-10px` }}
                >
                  {seg.label}
                </SegmentLabel>
              );
            })}
            {melodySegments.map((seg, i) => {
              const x = Math.floor((i / 8) * canvasWidth);
              return (
                <SegmentLabel
                  key={`melody-${seg.label}-${i}`}
                  style={{ left: `${x}px`, top: `15px` }}
                >
                  {seg.label}
                </SegmentLabel>
              );
            })}
          </>
        ) : (
          <>
            {currentSegments.rhythm?.map((seg, i) => {
              const x = Math.floor((i / 8) * canvasWidth);
              return (
                <SegmentLabel
                  key={`rhythm-${seg.label}-${i}`}
                  style={{ left: `${x}px`, top: `-10px` }}
                >
                  {seg.label}
                </SegmentLabel>
              );
            })}
            {currentSegments.melody?.map((seg, i) => {
              const x = Math.floor((i / 8) * canvasWidth);
              return (
                <SegmentLabel
                  key={`melody-${seg.label}-${i}`}
                  style={{ left: `${x}px`, top: `-10px` }}
                >
                  {seg.label}
                </SegmentLabel>
              );
            })}
          </>
        )}
        <Playhead x={playheadX}/>
      </WaveformArea>
      <ButtonArea>
        <PlaybackButton
          onClick={togglePlay}
          label={isPlaying ? '■ STOP' : '▶︎ PLAY'}
        />
        <CustomDrumButton
          onClick={toggleLoop}
          label={isLooping ? '■ STOP' : '▶︎ LOOP'}
        />
        
      </ButtonArea>
      <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
        <RectButton onClick={() => setLoopMode('rhythm')} label="RHYTHM LOOP" />
        <RectButton onClick={() => setLoopMode('melody')} label="MELODY LOOP" />
        <CustomDrumButton onClick={() => setLoopMode('both')} label="BOTH LOOP" />
      </div>
    </CenteredArea>
  );
};
