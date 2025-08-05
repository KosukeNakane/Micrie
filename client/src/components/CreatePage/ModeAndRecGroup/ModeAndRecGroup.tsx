// 録音ボタンとモード切り替え（RHYTHM / MELODY）ボタンをまとめたUIグループコンポーネント

/** @jsxImportSource @emotion/react */
import styled from '@emotion/styled';
import { RecButton } from './RecButton'
import { RectButton } from '../../shared/RectButton';
import { useMode } from '../../../context/ModeContext';
import { useSegment } from '../../../context/SegmentContext';
// import { BarSelectDropdown } from '../shared/BarSelectDropdown';

type Props = {
  onToggleRecording: () => void;
};

export const RhythmRecButton = () => {
  const { mode, setMode } = useMode();
  const { setRecMode } = useSegment();
  return (
    <RectButton
      label="RHYTHM REC"
      active={mode === 'rhythm'}
      onClick={() => {
        setMode('rhythm');
        setRecMode('rhythm');
      }}
      flexGrow={0}
    />
  );
};

export const MelodyRecButton = () => {
  const { mode, setMode } = useMode();
  const { setRecMode } = useSegment();
  return (
    <RectButton
      label="MELODY REC"
      active={mode === 'melody'}
      onClick={() => {
        setMode('melody');
        setRecMode('melody');
      }}
      flexGrow={0}
    />
  );
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
  return (
    <Container>
      <RecButton onClick={onToggleRecording} />
    </Container>
  );
};