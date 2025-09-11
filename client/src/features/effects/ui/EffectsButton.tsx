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
  return (
    <RectButtonBase
      active={active}
      onClick={onClick}
      widthPx={widthPx}
      style={{
        height: `${heightPx}px`,
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
