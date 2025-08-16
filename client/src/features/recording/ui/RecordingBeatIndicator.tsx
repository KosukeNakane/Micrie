import { StyledArea } from '@shared/ui/StyledArea';

type Props = { currentBar: number; currentBeat: number };

export const RecordingBeatIndicator = ({ currentBar, currentBeat }: Props) => (
  <StyledArea style={{ fontSize: '20px' }}>
    Bar: {currentBar} / Beat: {currentBeat}
  </StyledArea>
);
