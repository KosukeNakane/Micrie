import styled from '@emotion/styled';

type Props = {
  isRecording: boolean;
  onClick: () => void;
};

const Button = styled.button<{ recording: boolean }>`
  background-color: ${({ recording }) => (recording ? '#ff3333' : '#fff')};
  color: ${({ recording }) => (recording ? 'white' : 'black')};
  font-weight: bold;
  border: 3px solid black;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  font-size: 18px;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    transform: scale(1.1);
  }
`;

export const RecButton = ({ isRecording, onClick }: Props) => {
  return (
    <Button recording={isRecording} onClick={onClick}>
      ●
    </Button>
  );
};