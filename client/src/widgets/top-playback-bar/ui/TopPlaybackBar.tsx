// [UI] widgets/ui - TopPlaybackBar.tsx
// 役割: 表示・入力のUIコンポーネント
import styled from '@emotion/styled';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import { useEffect, useRef, useState } from 'react';
import * as Tone from 'tone';

// import { RectButton } from '@shared/ui/RectButton';
import { usePlaybackController } from '@features/playback';
import { TempoControl } from '@features/tempo';
import { VolumeControl } from '@features/volume';
import { StyledArea } from '@shared/ui';


import { scalePx } from '@/shared/lib/scale';
import { useArrangementPerformer } from '@/features/arrangement-performance';

const BarWrapper = styled(StyledArea)`
  box-sizing: border-box;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;
  gap: ${scalePx(8)}; /* 間隔を少し詰めて全体を上に */
  width: 600px;
  height: 130px;
  margin-top: 20px;
`;

const ProgressWrap = styled.div`
  position: relative;
  height: ${scalePx(4)};
  flex: 1;
  border-radius: 999px;
  background:linear-gradient(90deg, rgb(255, 135, 22), rgb(255, 17, 195));
  overflow: visible;
  user-select: none;
  touch-action: none;
  cursor: pointer;
`;

const ProgressDot = styled.div<{ x: number }>`
  position: absolute;
  left: ${({ x }) => `${x * 100}%`};
  top: 50%;
  transform: translate(-50%, -50%);
  width: ${scalePx(14)};
  height: ${scalePx(14)};
  border-radius: 50%;
  background: #ff2a2a;
  box-shadow: 0 0 0 ${scalePx(2)} rgba(255, 42, 42, 0.25);
`;

const ControlsRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${scalePx(12)};
`;

const TempoRow = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: -6px; /* わずかに上方向へオフセット */
`;

// すりガラス風の円形アイコンボタン（StyledAreaベース）
const IconButton = styled(StyledArea)`
  box-sizing: border-box;
  width: ${scalePx(40)};
  height: ${scalePx(40)};
  padding: 0;
  margin: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  cursor: pointer;
  background: linear-gradient(135deg, rgba(255,255,255,0.6), rgba(115, 175, 224, 0.45));
  transition: background-color 0.2s ease, transform 0.05s ease;
  box-shadow: none;
  &:hover { background-color: rgba(154, 154, 154, 0.663); }
  &:active { transform: translateY(1px); }
  & > svg { font-size: ${scalePx(20)}; color: rgba(5, 4, 69, 0.9); }
`;

export const TopPlaybackBar = () => {
  const { loopPlay, stop, reset, isLoopPlaying } = usePlaybackController();
  const {
    playbackMode,
    status: arrangementStatus,
    playArrangement,
    stopArrangement,
    pauseArrangement,
  } = useArrangementPerformer();
  const [ratio, setRatio] = useState(0);
  const rafRef = useRef<number | null>(null);
  const isArrangementMode = playbackMode === 'arrangement';
  const isArrangementPlaying = isArrangementMode && arrangementStatus === 'playing';

  // スクラブ中はrAFからの上書きを止める
  const [isScrubbing, setIsScrubbing] = useState(false);
  const isScrubbingRef = useRef(false);
  useEffect(() => { isScrubbingRef.current = isScrubbing; }, [isScrubbing]);

  const progressRef = useRef<HTMLDivElement | null>(null);

  const getBeatsPerBar = () => {
    // @ts-ignore
    const ts = (Tone.getTransport().timeSignature ?? 4) as number | [number, number];
    return Array.isArray(ts) ? ts[0] : ts;
  };

  const ratioToPositionString = (r: number) => {
    const beatsPerBar = getBeatsPerBar();
    const loopBeats = beatsPerBar * 2; // 2小節ループ
    // 末端で1ちょうどにならないようにクランプ
    const totalBeats = Math.max(0, Math.min(loopBeats - 1e-6, r * loopBeats));
    const bars = Math.floor(totalBeats / beatsPerBar);
    const beatInBar = totalBeats - bars * beatsPerBar; // 0..(<beatsPerBar)
    const beats = Math.floor(beatInBar);
    const six = Math.round((beatInBar - beats) * 4); // 16分単位（0..3）
    return `${bars}:${beats}:${six}`;
  };

  const updateRatioFromClientX = (clientX: number) => {
    const el = progressRef.current;
    if (!el) return 0;
    const rect = el.getBoundingClientRect();
    const r = rect.width > 0 ? (clientX - rect.left) / rect.width : 0;
    const clamped = Math.max(0, Math.min(1, r));
    setRatio(clamped);
    return clamped;
  };

  useEffect(() => {
    const tick = () => {
      if (!isScrubbingRef.current) {
        // 進捗は楽譜時間ベースで算出（テンポ変更に頑強）
        const pos = Tone.getTransport().position as unknown as string; // "bars:beats:sixteenths"
        const [barsStr, beatsStr, sixStr] = (pos || '0:0:0').split(':');
        const bars = Number(barsStr) || 0;
        const beats = Number(beatsStr) || 0;
        const six = Number(sixStr) || 0;
        // timeSignature（拍子）
        const beatsPerBar = getBeatsPerBar();
        const totalBeats = bars * beatsPerBar + beats + six / 4;
        const loopBeats = beatsPerBar * 2; // 2小節ループ
        const r = loopBeats > 0 ? ((totalBeats % loopBeats) / loopBeats) : 0;
        setRatio(r);
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    if (isArrangementPlaying || isLoopPlaying) {
      rafRef.current = requestAnimationFrame(tick);
    }
    return () => { if (rafRef.current != null) cancelAnimationFrame(rafRef.current); rafRef.current = null; };
  }, [isArrangementPlaying, isLoopPlaying]);

  // Pointer handlers for scrubbing
  function onPointerDown(e: any) {
    setIsScrubbing(true);
    e.currentTarget?.setPointerCapture?.(e.pointerId);
    updateRatioFromClientX(e.clientX);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  }

  function onPointerMove(e: PointerEvent) {
    if (!isScrubbingRef.current) return;
    updateRatioFromClientX(e.clientX);
  }

  function onPointerUp(e: PointerEvent) {
    if (!isScrubbingRef.current) return;
    setIsScrubbing(false);
    const r = updateRatioFromClientX(e.clientX);
    const posString = ratioToPositionString(r);
    // @ts-ignore: Tone typings
    (Tone.getTransport() as any).position = posString; // 再生中/停止中どちらでもシーク
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', onPointerUp);
  }

  const onToggle = async () => {
    if (isArrangementMode) {
      if (isArrangementPlaying) {
        pauseArrangement();
      } else {
        await playArrangement();
      }
    } else if (isLoopPlaying) {
      stop();
    } else {
      await loopPlay();
    }
  };
  const onStop = () => {
    if (isArrangementMode) {
      stopArrangement();
      setRatio(0);
    } else {
      reset();
      setRatio(0);
    }
  };

  return (
    <BarWrapper>
      <ControlsRow>
        <IconButton
          as="button"
          aria-label={isArrangementMode ? (isArrangementPlaying ? 'Pause Arrangement' : 'Play Arrangement') : (isLoopPlaying ? 'Pause' : 'Play')}
          onClick={onToggle}
        >
          {(isArrangementMode ? isArrangementPlaying : isLoopPlaying) ? <PauseIcon /> : <PlayArrowIcon />}
        </IconButton>
        <IconButton as="button" aria-label={'Stop'} onClick={onStop}>
          <StopIcon />
        </IconButton>
        <ProgressWrap
          ref={progressRef}
          aria-label="loop progress"
          role="slider"
          aria-valuemin={0}
          aria-valuemax={1}
          aria-valuenow={Number(ratio.toFixed(3))}
          onPointerDown={onPointerDown}
        >
          <ProgressDot x={ratio} />
        </ProgressWrap>
      </ControlsRow>
      <TempoRow>
        <div style={{ width: 180 }}>
          <TempoControl />
        </div>
        <div style={{ width: 160 }}>
          <VolumeControl />
        </div>
      </TempoRow>
    </BarWrapper>
  );
};
