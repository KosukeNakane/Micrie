// 波形表示・再生・ループ・セグメントラベル描画を担うメインUIコンポーネント
// 録音やループ再生、プレイヘッド移動、セグメントの可視化処理を統合
import { useState, useEffect, useRef } from 'react';

import { useAudioBuffer } from '../../../hooks/useAudioBuffer';
import { useSegment } from '../../../context/SegmentContext';

import styled from '@emotion/styled';

import { useTempo } from '../../../context/TempoContext';
import { useAnalyser } from '../../../hooks/useAnalyser';

import { useDrumLoopScheduler } from '../../../hooks/useDrumLoopScheduler';
import { useMelodyLoopScheduler } from '../../../hooks/useMelodyLoopScheduler';
import { useChordLoopScheduler } from '../../../hooks/useChordsLoopScheduler';

import { useRecording } from '../../../context/RecordingContext';
import { useRecordingUI } from '../../../context/RecordingUIContext';
import { useBarCount } from '../../../context/BarCountContext';
import { useCountBarsAndBeats } from '../../../context/CountBarsAndBeatsContext';

import { RecordingBeatIndicator } from './RecordingBeatIndicator';
import { RhythmSegmentEditor } from '../SegmentEditors/RhythmSegmentEditor';
import MelodySegmentEditor from '../SegmentEditors/MelodySegmentEditor';

import { WaveformViewer } from './WaveformViewer';
import { RectButton } from '../../shared/RectButton';
import { StyledArea } from '../../shared/StyledArea';

import TempoControlButton from '../ControlPanel/TempoControlButton';

import { usePlaybackController } from '../../../hooks/usePlaybackController';

import { ChordPatternSelect } from './ChordPatternSelect';
import { DrumPatternSelect } from './DrumPatternSelect';

import * as Tone from "tone";
import { useGlobalAudio } from "../../../context/GlobalAudioContext";

export const CenteredArea = styled(StyledArea)`
  flex-direction: column;
  max-width: 600px;
  margin: 20px auto;
`;

const WaveformArea = styled(StyledArea) <{ isRed: boolean }>`
  position: relative;
  height: 150px;
  overflow: hidden;
  box-sizing: border-box;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  background-color: ${({ isRed }) => (isRed ? 'rgba(255, 0, 0, 0.2)' : 'transparent')};
  transition: none;
`;

const BarWaveformContainer = styled(StyledArea)`
  position: relative;
  height: 180px;
  width: 100%;
  max-width: 600px;
  box-sizing: border-box;
  margin: 0 auto;
  align-items: flex-start;
`;

const SegmentLabel = styled(StyledArea)`
  position: absolute;
  top: 0;
  background: linear-gradient(135deg,rgba(255, 248, 56, 0.76),rgb(255, 210, 97));
  font-family: "brandon-grotesque", sans-serif;
  font-size: 14px;
  padding: 0px 4px;
  border-radius: 4px;
  z-index: 10;
`;

type Props = {
  audioBlob: Blob | null;
};
export const WaveformDisplay = ({ audioBlob }: Props) => {

  const [tempoControlOpen, setTempoControlOpen] = useState(false);

  const { currentBar, currentBeat } = useCountBarsAndBeats();

  // セグメントとループモードの状態管理
  const {
    currentSegments,
    loopMode,
    // setLoopMode,
    rhythmSegments,
    melodySegments,
    audioBuffers,
  } = useSegment();
  // 録音状態の取得
  const { isRecording } = useRecording();
  const canvasRef = useAnalyser();
  const { tempo } = useTempo();
  const { setIsDrawing, isDrawing } = useRecordingUI();
  // コード進行のループ再生制御
  useChordLoopScheduler(false); // 常にfalse
  useDrumLoopScheduler();
  useMelodyLoopScheduler();

  const { loopPlay, stop, isLoopPlaying } = usePlaybackController();

  const { barCount } = useBarCount();

  const audioBuffer = useAudioBuffer(audioBlob);

  const engine = useGlobalAudio();

  useEffect(() => {
    if (!audioBuffer) return;

    if (loopMode === 'rhythm') {
      audioBuffers.rhythm = audioBuffer;
    } else if (loopMode === 'melody') {
      audioBuffers.melody = audioBuffer;
    }
  }, [audioBuffer, loopMode, audioBuffers]);


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

  // Color toggling effect in sync with tempo
  const [isRed, setIsRed] = useState(false);

  useEffect(() => {
    if (!isRecording) {
      setIsRed(false);
      return;
    }

    setIsRed(true); // Start with red

    const interval = (60 / tempoRef.current) * 1000;
    const timer = setInterval(() => {
      setIsRed(prev => !prev);
    }, interval);

    return () => clearInterval(timer);
  }, [tempo, isRecording]);


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
      const clampedX = Math.max(0, Math.min(canvasWidth - 4, newX));


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
    if (!isRecording) {
      setIsDrawing(false);
    }
  }, [isRecording, setIsDrawing]);

  // currentBuffer更新時に自動で波形描画
  const { currentBuffer } = useSegment();
  useEffect(() => {
    if (canvasRef.current && currentBuffer) {
      setIsDrawing(true);
    }
  }, [currentBuffer]);


  const handleToggleLoop = async () => {
    // ユーザー操作内でのオーディオ解禁（Tone.js と WebAudio の両方）
    if (Tone.context.state !== "running") {
      await Tone.start();
    }
    await engine.ensureStarted();

    if (isLoopPlaying) {
      stop();
    } else {
      loopPlay();
    }
  };

  return (
    <CenteredArea>
      <RecordingBeatIndicator currentBar={currentBar} currentBeat={currentBeat} />






      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>

        <ChordPatternSelect />

        <DrumPatternSelect />

      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', width: '160px' }}>
          <RectButton
            onClick={handleToggleLoop}
            label={isLoopPlaying ? '■ Stop Music' : '▶︎ Play Music'}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', width: '160px' }}>
          <TempoControlButton
            isOpen={tempoControlOpen}
            onToggle={() => setTempoControlOpen((prev) => !prev)}
          />
        </div>
      </div>


      {/* リアルタイム録音の波形表示エリア */}
      <WaveformArea ref={waveformRef} isRed={isRed}>
        {/* リアルタイム録音の波形 */}
        {isDrawing && (
          <canvas
            ref={canvasRef}
            width={canvasWidth}
            height={160}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              zIndex: 0,
            }}
          />
        )}
      </WaveformArea>

      {/* 解析結果を1小節ごとに縦に並べて表示 */}
      {audioBuffer &&
        Array.from({ length: barCount }).map((_, barIndex) => (
          <div style={{ height: '220px' }}>
            <BarWaveformContainer key={barIndex}>
              {/* Labelの描画 */}
              {loopMode === 'both' ? (
                <>
                  {/* 1小節分のラベル表示 (16分割) */}
                  {rhythmSegments
                    .slice(barIndex * 16, barIndex * 16 + 16)
                    .map((seg, i) => {
                      const x = Math.floor((i / 16) * canvasWidth);
                      return (
                        seg.label !== 'rest' && (
                          <SegmentLabel
                            key={`rhythm-${seg.label}-${barIndex * 16 + i}`}
                            style={{ left: `${x}px`, top: `-10px` }}
                          >
                            {seg.label}
                          </SegmentLabel>
                        )
                      );
                    })}
                  {melodySegments
                    .slice(barIndex * 16, barIndex * 16 + 16)
                    .map((seg, i) => {
                      const x = Math.floor((i / 16) * canvasWidth);
                      return (
                        seg.label !== 'rest' && (
                          <SegmentLabel
                            key={`melody-${seg.label}-${barIndex * 16 + i}`}
                            style={{ left: `${x}px`, top: `65px` }}
                          >
                            {seg.label}
                          </SegmentLabel>
                        )
                      );
                    })}
                </>
              ) : (
                <>
                  {currentSegments.rhythm?.slice(barIndex * 16, barIndex * 16 + 16)
                    .map((seg, i) => {
                      const x = Math.floor((i / 16) * canvasWidth);
                      return (
                        seg.label !== 'rest' && (
                          <SegmentLabel
                            key={`rhythm-${seg.label}-${barIndex * 16 + i}`}
                            style={{ left: `${x}px`, top: `-10px` }}
                          >
                            {seg.label}
                          </SegmentLabel>
                        )
                      );
                    })}
                  {currentSegments.melody?.slice(barIndex * 16, barIndex * 16 + 16)
                    .map((seg, i) => {
                      const x = Math.floor((i / 16) * canvasWidth);
                      return (
                        seg.label !== 'rest' && (
                          <SegmentLabel
                            key={`melody-${seg.label}-${barIndex * 16 + i}`}
                            style={{ left: `${x}px`, top: `-10px` }}
                          >
                            {seg.label}
                          </SegmentLabel>
                        )
                      );
                    })}
                </>
              )}

              <WaveformViewer barIndex={barIndex} totalBars={barCount} />
              <div style={{ position: 'absolute', zIndex: 5, top: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {(loopMode === 'rhythm' || loopMode === 'both') && (
                  <RhythmSegmentEditor barIndex={barIndex} />
                )}
                {(loopMode === 'melody' || loopMode === 'both') && (
                  <MelodySegmentEditor barIndex={barIndex} width={canvasWidth} />
                )}
              </div>
            </BarWaveformContainer>
          </div>
        ))}
    </CenteredArea>
  );
};