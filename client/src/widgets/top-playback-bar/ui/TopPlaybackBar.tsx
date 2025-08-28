import styled from '@emotion/styled';
import { useEffect, useRef, useState } from 'react';
import * as Tone from 'tone';
import { RectButton } from '@shared/ui/RectButton';
import { usePlaybackController } from '@features/playback/model/usePlaybackController';
import { TempoControl } from '@features/tempo';

const BarWrapper = styled.div`
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 12px;
  margin: 10px auto;
  padding: 10px 12px;
  max-width: 600px;
  background: linear-gradient(135deg, rgba(255,255,255,0.35), rgba(140, 194, 209, 0.843));
  box-shadow: 0 8px 16px 0 rgba(31, 38, 135, 0.37);
`;

const ProgressWrap = styled.div`
  position: relative;
  height: 4px;
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
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #ff2a2a;
  box-shadow: 0 0 0 2px rgba(255, 42, 42, 0.25);
`;

const ControlsRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const TempoRow = styled.div`
  display: flex;
  justify-content: flex-start;
`;

export const TopPlaybackBar = () => {
  const { loopPlay, stop, reset, isLoopPlaying } = usePlaybackController();
  const [ratio, setRatio] = useState(0);
  const rafRef = useRef<number | null>(null);

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
    if (isLoopPlaying) {
      rafRef.current = requestAnimationFrame(tick);
    }
    return () => { if (rafRef.current != null) cancelAnimationFrame(rafRef.current); rafRef.current = null; };
  }, [isLoopPlaying]);

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
    if (isLoopPlaying) stop();
    else await loopPlay();
  };
  const onStop = () => { reset(); setRatio(0); };

  return (
    <BarWrapper>
      <ControlsRow>
        <RectButton onClick={onToggle} label={isLoopPlaying ? '⏸ Pause' : '▶︎ Play'} widthPx={70} />
        <RectButton onClick={onStop} label={'■ Stop'} widthPx={70} />
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
        <div style={{ width: 200 }}>
          <TempoControl />
        </div>
      </TempoRow>
    </BarWrapper>
  );
};
