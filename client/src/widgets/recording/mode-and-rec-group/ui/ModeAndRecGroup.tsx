/** @jsxImportSource @emotion/react */
import styled from '@emotion/styled';

import { RecButton } from '@features/recording/ui/RecButton';

type Props = {
  onToggleRecording: () => void;
};

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 24px;
  margin: 20px 0;
`;

export const ModeAndRecGroup = ({ onToggleRecording }: Props) => {
  return (
    <Container>
      <RecButton onClick={onToggleRecording} />
    </Container>
  );
};

