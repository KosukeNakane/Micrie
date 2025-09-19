// [UI] features/ui - SplitHoldResetButton.tsx
// 役割: 表示・入力のUIコンポーネント
import styled from '@emotion/styled';
import React from 'react';

import { scalePx } from '@/shared/lib/scale';

type Props = {
  width?: number; // default 60px
  height?: number; // total height; default 64px
  holdActive?: boolean;
  onToggleHold?: () => void;
  onReset?: () => void;
};

export const SplitHoldResetButton: React.FC<Props> = ({
  width = 60,
  height = 64,
  holdActive,
  onToggleHold,
  onReset,
}) => {
  const halfHeight = Math.floor((height - 1) / 2); // 1px divider
  const bottomHeight = height - (halfHeight + 1);
  return (
    <Container style={{ width: `${width * 0.75}px` }}>
      <HalfShell active={!!holdActive} round="top" style={{ height: `${halfHeight * 0.75}px` }} onClick={onToggleHold} aria-label="Hold">
        HOLD
      </HalfShell>
      <Divider />
      <HalfShell active={false} round="bottom" style={{ height: `${bottomHeight * 0.75}px` }} onClick={onReset} aria-label="Reset">
        RESET
      </HalfShell>
    </Container>
  );
};

export default SplitHoldResetButton;

// 見た目は StyledButton と同等（単一のボタン）だが、内部で2つの半分ボタンを配置
const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

const HalfShell = styled.button<{ active: boolean; round: 'top' | 'bottom' }>`
  appearance: none;
  cursor: pointer;
  box-sizing: border-box;
  font-family: "brandon-grotesque", sans-serif;
  font-weight: 500;
  font-style: normal;
  font-size:${scalePx(14)};
  /* Frosted glass-like background to match vertical fader aesthetics */
  background: ${({ active }) =>
    active
      ? 'linear-gradient(135deg, rgb(156, 244, 220), rgb(72, 255, 151))'
      : 'linear-gradient(135deg, rgba(255,255,255,0.35), rgba(140,194,209,0.25))'};
  color: rgba(5, 4, 69, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: ${({ round }) => (round === 'top' ? `${scalePx(10)} ${scalePx(10)} 0 0` : `0 0 ${scalePx(10)} ${scalePx(10)}`)};
  padding: 0;
  /* RectButton と同様の凹み具合（active時はinset） */
  box-shadow: ${({ active }) =>
    active
      ? 'inset 0 1.5px 3px rgba(0, 0, 0, 0.2)'
      : '0 6px 12px 0 rgba(31, 38, 135, 0.28)'};
  transition: box-shadow 0.2s ease, transform 0.08s ease;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);

  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;

  &:active {
    transform: scale(0.96);
  }
`;

const Divider = styled.div`
  height: 0.75px;
  background: rgba(255, 255, 255, 0.35);
  width: 100%;
`;

// removed separate HalfButton; each half is a real button (HalfShell)
