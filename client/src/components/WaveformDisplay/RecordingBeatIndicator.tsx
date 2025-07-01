// 現在の録音中のバーとビートの数を表示するコンポーネント。
// UI上に「Bar: X / Beat: Y」の形式で現在位置を表示する。

import React from 'react';
import { StyledArea } from '../shared/StyledArea';

// コンポーネントが受け取るpropsの型定義（現在のバーとビート）
type Props = {
  currentBar: number;
  currentBeat: number;
};

export const RecordingBeatIndicator: React.FC<Props> = ({ currentBar, currentBeat }) => {
  // 現在のバーとビートを表示するエリア（フォントサイズ20pxで表示）
  return (
    <StyledArea 
      style={{ fontSize: '20px' }}
    >
      Bar: {currentBar} / Beat: {currentBeat}
    </StyledArea>
  );
};