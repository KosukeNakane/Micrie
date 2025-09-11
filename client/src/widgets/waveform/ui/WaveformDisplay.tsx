// 波形表示・再生・ループ・セグメントラベル描画を担うメインUIコンポーネント
import styled from '@emotion/styled';
import { useState, useEffect, useRef } from 'react';

import { useAudioBuffer, useAnalyser, useRecording, useRecordingUI } from '@entities/audio';
import { useBarCount } from '@entities/bar-count';
import { useCountBarsAndBeats } from '@entities/count-bars-and-beats';
import { useSegment } from '@entities/segment';
import { useTempo } from '@entities/tempo';
import { ChordPatternSelect, DrumPatternSelect } from '@features/pattern-select';
import { ScaleModeSelect } from '@features/scale-mode';
import { useDrumLoopScheduler, useMelodyLoopScheduler, useChordsLoopScheduler as useChordLoopScheduler } from '@features/playback';
import { RecordingBeatIndicator } from '@features/recording';
import { RecButton } from '@features/recording/ui/RecButton';
import { RhythmSegmentEditor, MelodySegmentEditor } from '@features/segment-edit';
import { WaveformViewer } from '@features/waveform';
import { StyledArea } from '@shared/ui';
import { SimpleSelect } from '@shared/ui/SimpleSelect';

export const CenteredArea = styled(StyledArea)`
  flex-direction: column;
  justify-content: flex-start; /* 余白が広がらないように上寄せ */
  gap: 0; /* StyledAreaの既定gap(約6px)を無効化 */
  /* TopPlaybackBar と同じ幅に合わせる */
  width: 600px;
  height: 715px;
  margin: 20px auto;
`;

const WaveformArea = styled(StyledArea) <{ isRed: boolean }>`
  position: relative;
  /* 波形キャンバス枠の高さ（px）: 既存値(150)の約2/3 */
  height: 100px;
  overflow: hidden;
  box-sizing: border-box;
  width: 424px;
  /* TopPlaybackBar と同じ幅に合わせる */
  margin: 0 auto;
  background-color: ${({ isRed }) => (isRed ? 'rgba(255, 0, 0, 0.2)' : 'transparent')};
  transition: none;
`;

// 2行×4列のグリッドと正方形（StyledAreaベース）
const SquaresGrid = styled(StyledArea)`
  /* StyledAreaの見た目を消してラッパを不可視化 */
  background: transparent;
  border: 0;
  box-shadow: none;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  border-radius: 0;
  padding: 0 32;
  margin: 0 32; /* 上下間隔は直前要素側で統一管理 */

  /* レイアウトのみを担う */
  display: grid;
  grid-template-columns: repeat(4, 100px);
  gap: 8px;
  width: 100%;
  max-width: 600px;
  justify-content: center;
`;

const SquareBox = styled(StyledArea)`
  width: 100px;
  height: 100px;
  padding: 0; /* 正方形比率を崩さないように内側余白を無効化 */
  margin: 0;  /* グリッド間の余白は親のgapで管理 */
  justify-content: center;
  align-items: center;
`;

type Props = { audioBlob: Blob | null; onToggleRecording?: () => void };

export const WaveformDisplay = ({ audioBlob, onToggleRecording }: Props) => {
  const { currentBar, currentBeat } = useCountBarsAndBeats();
  const { currentSegments, loopMode, rhythmSegments, melodySegments, setContextAudioBuffer } = useSegment();
  const { isRecording } = useRecording();
  const canvasRef = useAnalyser();
  const { tempo } = useTempo();
  const { setIsDrawing, isDrawing } = useRecordingUI();
  useChordLoopScheduler(false); // 常にfalse
  useDrumLoopScheduler();
  useMelodyLoopScheduler();

  // 再生/停止は TopPlaybackBar に移動したため、ここでは未使用
  const { barCount } = useBarCount();
  const audioBuffer = useAudioBuffer(audioBlob);

  useEffect(() => {
    if (!audioBuffer) return;
    setContextAudioBuffer(loopMode === 'rhythm' ? 'rhythm' : 'melody', audioBuffer);
  }, [audioBuffer, loopMode, setContextAudioBuffer]);

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

  // コンテナサイズに追随してcanvas幅とleft位置を更新
  useEffect(() => {
    const el = waveformRef.current;
    if (!el) return;
    const update = () => {
      const rect = el.getBoundingClientRect();
      setCanvasWidth(rect.width);
      waveformLeftRef.current = rect.left;
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener('resize', update);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', update);
    };
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

  // 再生/停止は TopPlaybackBar に移動

  // 分析完了までは選択中アレイのUI全体を非表示にする
  const hasSelectedSegments = loopMode === 'melody'
    ? melodySegments.length > 0
    : loopMode === 'rhythm'
      ? rhythmSegments.length > 0
      : (melodySegments.length > 0 || rhythmSegments.length > 0);

  return (
    <CenteredArea>
      {/* RecButton + BeatIndicator（中央にRec、左にIndicator） */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', marginBottom: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginRight: 9 }}>
          <RecordingBeatIndicator currentBar={currentBar} currentBeat={currentBeat} size="sm" />
        </div>
        <RecButton onClick={() => onToggleRecording && onToggleRecording()} />
        <div />
      </div>
      <WaveformArea ref={waveformRef} isRed={isRed}>
        {isDrawing && (
          /* 波形キャンバスの高さ（px）: 既存値(150)の約2/3 */
          <canvas ref={canvasRef} width={canvasWidth} height={100} style={{ position: 'absolute', top: 0, left: 0, zIndex: 0 }} />
        )}
      </WaveformArea>
      <StyledArea
        style={{
          display: 'grid',
          gridTemplateColumns: '90px 1fr 120px',
          gridAutoRows: 'minmax(27px, auto)',
          alignItems: 'center',
          gap: 6,
          width: 540,
          height: 200,
          padding: '6px 7.5px',
          marginTop: 16,
          marginBottom: 8, // 次のSquaresGridとの間隔を8pxに固定
        }}
      >
        {/* Row 1 */}
        <span style={{ fontSize: 14, color: 'rgba(5,4,69,0.8)' }}>TEXT</span>
        <div><ScaleModeSelect /></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4.5 }}>
          <span style={{ fontSize: 14, color: 'rgba(5,4,69,0.8)' }}>Sound:</span>
          <div style={{ width: 82.5 }}>
            <SimpleSelect
              options={[{ value: 'default', label: 'Default' }, { value: 'bright', label: 'Bright' }, { value: 'warm', label: 'Warm' }]}
              value={{ value: 'default', label: 'Default' }}
              onChange={() => { /* no-op placeholder */ }}
            />
          </div>
        </div>

        {/* Row 2 */}
        <span style={{ fontSize: 14, color: 'rgba(5,4,69,0.8)' }}>TEXT</span>
        <div><ChordPatternSelect /></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4.5 }}>
          <span style={{ fontSize: 14, color: 'rgba(5,4,69,0.8)' }}>Sound:</span>
          <div style={{ width: 82.5 }}>
            <SimpleSelect
              options={[{ value: 'default', label: 'Default' }, { value: 'bright', label: 'Bright' }, { value: 'warm', label: 'Warm' }]}
              value={{ value: 'default', label: 'Default' }}
              onChange={() => { /* no-op placeholder */ }}
            />
          </div>
        </div>

        {/* Row 3 */}
        <span style={{ fontSize: 14, color: 'rgba(5,4,69,0.8)' }}>Sound:</span>
        <div><DrumPatternSelect /></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4.5 }}>
          <span style={{ fontSize: 14, color: 'rgba(5,4,69,0.8)' }}>TEXT</span>
          <div style={{ width: 82.5 }}>
            <SimpleSelect
              options={[{ value: 'default', label: 'Default' }, { value: 'bright', label: 'Bright' }, { value: 'warm', label: 'Warm' }]}
              value={{ value: 'default', label: 'Default' }}
              onChange={() => { /* no-op placeholder */ }}
            />
          </div>
        </div>
      </StyledArea>

      {/* 2行×4列の正方形グリッド */}
      <SquaresGrid>
        {Array.from({ length: 8 }).map((_, i) => (
          <SquareBox key={i} />
        ))}
      </SquaresGrid>
    </CenteredArea >
  );
};
