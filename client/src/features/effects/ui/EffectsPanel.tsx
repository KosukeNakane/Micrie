/** @jsxImportSource @emotion/react */
import React from 'react';

import { StyledArea } from '@shared/ui';

type Props = {
  children: React.ReactNode;
  width?: number;
};

// Glassy outer frame for effects controls
export const EffectsPanel: React.FC<Props> = ({ children, width = 600 }) => {
  return (
    <StyledArea
      css={{
        display: 'block',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.35), rgba(140,194,209,0.25))',
        width: '100%',
        maxWidth: width,
        margin: '12px auto 0',
      }}
    >
      {children}
    </StyledArea>
  );
};

export default EffectsPanel;
