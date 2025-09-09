/** @jsxImportSource @emotion/react */
import styled from '@emotion/styled';
import { useCountBarsAndBeats } from '@entities/count-bars-and-beats';
import { RecordingBeatIndicator } from '@features/recording';

import { RecButton } from '@features/recording/ui/RecButton';

type Props = {
  onToggleRecording: () => void;
};

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  margin: 20px 0;
`;

export const ModeAndRecGroup = ({ onToggleRecording }: Props) => {
  const { currentBar, currentBeat } = useCountBarsAndBeats();
  return (
    <Grid>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginRight: 12 }}>
        <RecordingBeatIndicator currentBar={currentBar} currentBeat={currentBeat} size="sm" />
      </div>
      <RecButton onClick={onToggleRecording} />
      <div />
    </Grid>
  );
};
