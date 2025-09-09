import { StyledArea } from '@shared/ui/StyledArea';

type Props = { currentBar: number; currentBeat: number; size?: 'sm' | 'md' };

export const RecordingBeatIndicator = ({ currentBar, currentBeat, size = 'md' }: Props) => {
  const fontSize = size === 'sm' ? 14 : 20;
  const padding = size === 'sm' ? '4px 8px' : '10px 12px';
  return (
    <StyledArea style={{ fontSize: `${fontSize}px`, padding }}>
      Bar: {currentBar} / Beat: {currentBeat}
    </StyledArea>
  );
};
