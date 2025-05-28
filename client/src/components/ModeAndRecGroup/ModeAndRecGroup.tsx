// 録音ボタンとモード切り替え（RHYTHM / MELODY）ボタンをまとめたUIグループコンポーネント
/** @jsxImportSource @emotion/react */
import styled from '@emotion/styled';
import { RecButton } from './RecButton'
import { RectButton } from '../shared/RectButton';

import { useMode } from '../../context/ModeContext';

type Props = {
  onToggleRecording: () => void;
};

// ボタン配置用の中央寄せフレックスコンテナ
const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 24px;
  margin: 20px 0;
`;

export const ModeAndRecGroup = ({
  onToggleRecording,
}: Props) => {
  // 現在のモードとモード更新関数を取得
  const { mode, setMode } = useMode();
  return (
    <Container>
      {/* RHYTHMモードへの切り替えボタン */}
      <RectButton
         label="RHYTHM REC"
         active={mode === 'rhythm'}
         onClick={() => setMode('rhythm')}
         flexGrow={0}
      />
      {/* 録音開始・停止トグル用ボタン */}
      <RecButton onClick={onToggleRecording} />
      {/* MELODYモードへの切り替えボタン */}
      <RectButton
        label="MELODY REC"
        active={mode === 'melody'}
        onClick={() => setMode('melody')}
        flexGrow={0}
      />
    </Container>
  );
};