// 波形表示・再生・ループ・セグメントラベル描画を担うメインUIコンポーネント
import styled from '@emotion/styled';
import { useState, useEffect, useRef } from 'react';

import { useAudioBuffer, useAnalyser, useRecording, useRecordingUI } from '@entities/audio';
import { useBarCount } from '@entities/bar-count';
import { useCountBarsAndBeats } from '@entities/count-bars-and-beats';
import { useSegment } from '@entities/segment';
import { useTempo } from '@entities/tempo';
import { ChordPatternSelect, DrumPatternSelect } from '@features/pattern-select';
import { useDrumLoopScheduler, useMelodyLoopScheduler, useChordsLoopScheduler as useChordLoopScheduler, usePlaybackController } from '@features/playback';
import { RecordingBeatIndicator } from '@features/recording';
import { RhythmSegmentEditor, MelodySegmentEditor } from '@features/segment-edit';
import { TempoControlButton } from '@features/tempo';
import { WaveformViewer } from '@features/waveform';
import { RectButton, StyledArea } from '@shared/ui';

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

type Props = { audioBlob: Blob | null };

export const WaveformDisplay = ({ audioBlob }: Props) => {
  const [tempoControlOpen, setTempoControlOpen] = useState(false);
  const { currentBar, currentBeat } = useCountBarsAndBeats();
  const { currentSegments, loopMode, rhythmSegments, melodySegments, audioBuffers } = useSegment();
  const { isRecording } = useRecording();
  const canvasRef = useAnalyser();
  const { tempo } = useTempo();
  const { setIsDrawing, isDrawing } = useRecordingUI();
  useChordLoopScheduler(false); // 常にfalse
  useDrumLoopScheduler();
  useMelodyLoopScheduler();

  const { loopPlay, stop, isLoopPlaying } = usePlaybackController();
  const { barCount } = useBarCount();
  const audioBuffer = useAudioBuffer(audioBlob);

  useEffect(() => {
    if (!audioBuffer) return;
    if (loopMode === 'rhythm') audioBuffers.rhythm = audioBuffer;
    else if (loopMode === 'melody') audioBuffers.melody = audioBuffer;
  }, [audioBuffer, loopMode, audioBuffers]);

  const waveformRef = useRef<HTMLDivElement>(null);
  const waveformLeftRef = useRef(0);
  const [canvasWidth, setCanvasWidth] = useState(600);
  const tempoRef = useRef(tempo);
  useEffect(() => { tempoRef.current = tempo; }, [tempo]);

  const [isRed, setIsRed] = useState(false);
  useEffect(() => {
    if (!isRecording) { setIsRed(false); return; }
    setIsRed(true);
    const interval = (60 / tempoRef.current) * 1000;
    const timer = setInterval(() => setIsRed(prev => !prev), interval);
    return () => clearInterval(timer);
  }, [isRecording, setIsDrawing]);

  // コンポーネントマウント時にcanvas幅とleft位置を取得（初期実装準拠）
  useEffect(() => {
    if (waveformRef.current) {
      const rect = waveformRef.current.getBoundingClientRect();
      setCanvasWidth(rect.width);
      waveformLeftRef.current = rect.left;
    }
  }, []);

  // 録音停止時に描画状態を初期化（初期実装）
  useEffect(() => {
    if (!isRecording) {
      setIsDrawing(false);
    }
  }, [isRecording, setIsDrawing]);

  // currentBuffer更新時に自動で波形描画（初期実装）
  const { currentBuffer } = useSegment();
  useEffect(() => {
    if (canvasRef.current && currentBuffer) {
      setIsDrawing(true);
    }
  }, [currentBuffer]);

  const handleToggleLoop = async () => { if (isLoopPlaying) { stop(); } else { await loopPlay(); } };

  return (
    <CenteredArea>
      <RecordingBeatIndicator currentBar={currentBar} currentBeat={currentBeat} />

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
        <ChordPatternSelect />
        <DrumPatternSelect />
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', width: '160px' }}>
          <RectButton onClick={handleToggleLoop} label={isLoopPlaying ? '■ Stop Music' : '▶︎ Play Music'} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', width: '160px' }}>
          <TempoControlButton isOpen={tempoControlOpen} onToggle={() => setTempoControlOpen((prev) => !prev)} />
        </div>
      </div>

      <WaveformArea ref={waveformRef} isRed={isRed}>
        {isDrawing && (
          <canvas ref={canvasRef} width={canvasWidth} height={160} style={{ position: 'absolute', top: 0, left: 0, zIndex: 0 }} />
        )}
      </WaveformArea>

      {audioBuffer && Array.from({ length: barCount }).map((_, barIndex) => (
        <div style={{ height: '220px' }} key={barIndex}>
          <BarWaveformContainer>
            {loopMode === 'both' ? (
              <>
                {rhythmSegments.slice(barIndex * 16, barIndex * 16 + 16).map((seg, i) => {
                  const x = Math.floor(((i + 0.5) / 16) * canvasWidth);
                  return seg.label !== 'rest' && (
                    <SegmentLabel key={`rhythm-${seg.label}-${barIndex * 16 + i}`} style={{ left: `${x}px`, top: `-10px`, transform: 'translateX(-50%)' }}>
                      {seg.label}
                    </SegmentLabel>
                  );
                })}
                {melodySegments.slice(barIndex * 16, barIndex * 16 + 16).map((seg, i) => {
                  const x = Math.floor(((i + 0.5) / 16) * canvasWidth);
                  return seg.label !== 'rest' && (
                    <SegmentLabel key={`melody-${seg.label}-${barIndex * 16 + i}`} style={{ left: `${x}px`, top: `65px`, transform: 'translateX(-50%)' }}>
                      {seg.label}
                    </SegmentLabel>
                  );
                })}
              </>
            ) : (
              <>
                {currentSegments.rhythm?.slice(barIndex * 16, barIndex * 16 + 16).map((seg, i) => {
                  const x = Math.floor(((i + 0.5) / 16) * canvasWidth);
                  return seg.label !== 'rest' && (
                    <SegmentLabel key={`rhythm-${seg.label}-${barIndex * 16 + i}`} style={{ left: `${x}px`, top: `-10px`, transform: 'translateX(-50%)' }}>
                      {seg.label}
                    </SegmentLabel>
                  );
                })}
                {currentSegments.melody?.slice(barIndex * 16, barIndex * 16 + 16).map((seg, i) => {
                  const x = Math.floor(((i + 0.5) / 16) * canvasWidth);
                  return seg.label !== 'rest' && (
                    <SegmentLabel key={`melody-${seg.label}-${barIndex * 16 + i}`} style={{ left: `${x}px`, top: `-10px`, transform: 'translateX(-50%)' }}>
                      {seg.label}
                    </SegmentLabel>
                  );
                })}
              </>
            )}
            <WaveformViewer barIndex={barIndex} totalBars={barCount} />
            <div style={{ position: 'absolute', zIndex: 5, top: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {(loopMode === 'rhythm' || loopMode === 'both') && (<RhythmSegmentEditor barIndex={barIndex} />)}
              {(loopMode === 'melody' || loopMode === 'both') && (<MelodySegmentEditor barIndex={barIndex} width={canvasWidth} />)}
            </div>
          </BarWaveformContainer>
        </div>
      ))}
    </CenteredArea>
  );
};
