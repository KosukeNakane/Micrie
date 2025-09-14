// [UI] features/ui - EffectsButton.tsx
// 役割: 表示・入力のUIコンポーネント
import React from 'react';

import { RectButtonBase } from '@shared/ui/RectButton';

type Props = {
  label: string;
  size?: number; // default square size (px)
  width?: number; // optional: override width only (px)
  height?: number; // optional: override height only (px)
  active?: boolean;
  onClick?: () => void;
};

export const EffectsButton: React.FC<Props> = ({ label, size = 40, width, height, active, onClick }) => {
  const widthPx = width ?? size;
  const heightPx = height ?? size;
  const scaledHeight = `${heightPx * 0.75}px`;
  return (
    <RectButtonBase
      active={active}
      onClick={onClick}
      widthPx={widthPx}
      style={{
        height: scaledHeight,
        margin: 0,
        padding: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {label}
    </RectButtonBase>
  );
};

export default EffectsButton;
