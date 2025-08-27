import styled from '@emotion/styled';
import { useEffect, useRef, useState } from 'react';
import * as Tone from 'tone';
import { RectButton } from '@shared/ui/RectButton';
import { usePlaybackController } from '@features/playback/model/usePlaybackController';

const BarWrapper = styled.div`
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 10px auto;
  padding: 10px 12px;
  max-width: 600px;
  background: linear-gradient(135deg, rgba(255,255,255,0.35), rgba(140,194,209,0.25));
  box-shadow: 0 8px 16px 0 rgba(31, 38, 135, 0.37);
`;

const ProgressWrap = styled.div`
  position: relative;
  height: 4px;
  flex: 1;
  border-radius: 999px;
  background:linear-gradient(90deg, rgb(255, 135, 22), rgb(255, 17, 195));
  overflow: visible;
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

export const TopPlaybackBar = () => {
  const { loopPlay, stop, isLoopPlaying } = usePlaybackController();
  const [ratio, setRatio] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const loopLen = Tone.Time('2m').toSeconds();
    const tick = () => {
      const t = Tone.getTransport().seconds;
      const r = loopLen > 0 ? ((t % loopLen) / loopLen) : 0;
      setRatio(r);
      rafRef.current = requestAnimationFrame(tick);
    };
    if (isLoopPlaying) {
      rafRef.current = requestAnimationFrame(tick);
    }
    return () => { if (rafRef.current != null) cancelAnimationFrame(rafRef.current); rafRef.current = null; };
  }, [isLoopPlaying]);

  const onToggle = async () => {
    if (isLoopPlaying) stop();
    else await loopPlay();
  };

  return (
    <BarWrapper>
      <RectButton onClick={onToggle} label={isLoopPlaying ? '■ Stop' : '▶︎ Play'} />
      <ProgressWrap aria-label="loop progress">
        <ProgressDot x={ratio} />
      </ProgressWrap>
    </BarWrapper>
  );
};
