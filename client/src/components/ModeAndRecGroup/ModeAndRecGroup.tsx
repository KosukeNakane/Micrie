/** @jsxImportSource @emotion/react */
import styled from '@emotion/styled';
import { RecButton } from './RecButton'

type Mode = 'rhythm' | 'melody';

type Props = {
  mode: Mode;
  onModeChange: (mode: Mode) => void;
  isRecording: boolean;
  onToggleRecording: () => void;
};

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 24px;
  margin: 20px 0;
`;

const ModeButton = styled.button<{ active?: boolean }>`
  background-color: ${({ active }) => (active ? '#ff9966' : '#fff')};
  color: black;
  font-weight: bold;
  border: 3px solid black;
  border-radius: 10px;
  padding: 8px 16px;
  cursor: pointer;
  transition: background-color 0.2s;
`;

export const ModeAndRecGroup = ({
  mode,
  onModeChange,
  isRecording,
  onToggleRecording,
}: Props) => {
  return (
    <Container>
      <ModeButton active={mode === 'rhythm'} onClick={() => onModeChange('rhythm')}>
        RHYTHM
      </ModeButton>
      <RecButton isRecording={isRecording} onClick={onToggleRecording} />
      <ModeButton active={mode === 'melody'} onClick={() => onModeChange('melody')}>
        MELODY
      </ModeButton>
    </Container>
  );
};