// 波形表示・再生・ループ・セグメントラベル描画を担うメインUIコンポーネント
import styled from '@emotion/styled';
import { useState, useEffect, useRef } from 'react';

import { useAnalyser, useRecording, useRecordingUI } from '@entities/audio';
// import { useBarCount } from '@entities/bar-count';
import { useCountBarsAndBeats } from '@entities/count-bars-and-beats';
import { useSegment } from '@entities/segment';
import { useTempo } from '@entities/tempo';
import { ChordPatternSelect, DrumPatternSelect } from '@features/pattern-select';
// 旧SchedulerはBinderへ移行。ここでは使用しない。
import { RecordingBeatIndicator } from '@features/recording';
import { RecButton } from '@features/recording/ui/RecButton';
import { StyledArea } from '@shared/ui';
import { MoodSelect } from '@/features/mood-select';
import { SoundSelect } from '@/features/sound-select';

export const CenteredArea = styled(StyledArea)`
  position: relative;
  flex-direction: column;
  justify-content: flex-start; /* 余白が広がらないように上寄せ */
  gap: 0; /* StyledAreaの既定gap(約6px)を無効化 */
  /* TopPlaybackBar と同じ幅に合わせる */
  width: 600px;
  height: 720px;
  margin: 20px auto;
`;

const WaveformArea = styled(StyledArea) <{ isRed: boolean }>`
  position: relative;
  /* 波形キャンバス枠の高さ（px）: 既存値(150)の約2/3 */
  height: 100px;
  overflow: hidden;
  box-sizing: border-box;
  padding: 0; /* 波形キャンバスを枠内（パディングなし）にぴったり合わせる */
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
  grid-template-columns: repeat(5, 100px);
  gap: 8px;
  width: 100%;
  max-width: 600px;
  justify-content: center;
  position: relative;
  z-index: 1; /* CenteredAreaより手前、コントロール群より後ろ */
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

export const WaveformDisplay = ({ audioBlob: _audioBlob, onToggleRecording }: Props) => {
  const { currentBar, currentBeat } = useCountBarsAndBeats();
  // const { currentSegments, loopMode, rhythmSegments, melodySegments, setContextAudioBuffer } = useSegment();
  const { isRecording } = useRecording();
  const canvasRef = useAnalyser();
  const { tempo } = useTempo();
  const { setIsDrawing, isDrawing } = useRecordingUI();
  // ループスケジューリングは各 PlaybackBinder に委譲

  // 再生/停止は TopPlaybackBar に移動したため、ここでは未使用
  // const { barCount } = useBarCount();
  // audioBlob のデコードは録音/解析・ロード側で実施（WaveformDisplay には依存させない）

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
  // const hasSelectedSegments = loopMode === 'melody'
  //   ? melodySegments.length > 0
  //   : loopMode === 'rhythm'
  //     ? rhythmSegments.length > 0
  //     : (melodySegments.length > 0 || rhythmSegments.length > 0);

  return (
    <CenteredArea>
      {/* RecButton + BeatIndicator（中央にRec、左にIndicator） */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginRight: 0 }}>
          <RecordingBeatIndicator currentBar={currentBar} currentBeat={currentBeat} size="sm" />
        </div>
        <RecButton onClick={() => onToggleRecording && onToggleRecording()} />
        <div />
      </div>
      <WaveformArea ref={waveformRef} isRed={isRed} style={{ marginBottom: 8 }}>
        {isDrawing && (
          /* 波形キャンバスの高さ（px）: 既存値(150)の約2/3 */
          <canvas
            ref={canvasRef}
            width={canvasWidth}
            height={100}
            style={{ position: 'absolute', top: 0, left: 0, zIndex: 0, width: '100%', height: '100%' }}
          />
        )}
      </WaveformArea>
      <StyledArea
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gridTemplateRows: 'repeat(3, minmax(24px, auto))',
          alignItems: 'center',
          gap: 6,
          width: 540,
          height: 'auto',
          padding: '6px 7.5px',
          marginTop: 32,
          marginBottom: 32,
          textAlign: 'center',
          position: 'relative',
          zIndex: 2,
        }}
      >
        {/* Row 1: 見出しテキスト（5列） */}
        <span style={{ fontSize: 18, color: 'rgba(5,4,69,0.8)' }}>Melody</span>
        <span style={{ fontSize: 18, color: 'rgba(5,4,69,0.8)' }}>mood</span>
        <div style={{ display: 'flex', justifyContent: 'center' }}><MoodSelect /></div>
        <span style={{ fontSize: 18, color: 'rgba(5,4,69,0.8)' }}>Sound:</span>
        <div style={{ display: 'flex', justifyContent: 'center' }}><SoundSelect /></div>
        {/* Row 2: ラベル（5列） */}
        <span style={{ fontSize: 18, color: 'rgba(5,4,69,0.8)' }}>Chord</span>
        <span style={{ fontSize: 18, color: 'rgba(5,4,69,0.8)' }}>Pattern:</span>
        <div style={{ display: 'flex', justifyContent: 'center' }}><ChordPatternSelect /></div>
        <span style={{ fontSize: 18, color: 'rgba(5,4,69,0.8)' }}>Sound:</span>
        <div style={{ display: 'flex', justifyContent: 'center' }}><SoundSelect /></div>

        {/* Row 3: セレクト（5列） */}
        <span style={{ fontSize: 18, color: 'rgba(5,4,69,0.8)' }}>Drum</span>
        <span style={{ fontSize: 18, color: 'rgba(5,4,69,0.8)' }}>Pattern:</span>
        <div style={{ display: 'flex', justifyContent: 'center' }}><DrumPatternSelect /></div>
        <span style={{ fontSize: 18, color: 'rgba(5,4,69,0.8)' }}>Sound:</span>
        <div style={{ display: 'flex', justifyContent: 'center' }}><SoundSelect /></div>
      </StyledArea>

      {/* 2行×5列の正方形グリッド */}
      <SquaresGrid>
        {Array.from({ length: 10 }).map((_, i) => (
          <SquareBox key={i} />
        ))}
      </SquaresGrid>
    </CenteredArea >
  );
};
