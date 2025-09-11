import { StyledArea } from '@shared/ui/StyledArea';

type Props = { currentBar: number; currentBeat: number; size?: 'sm' | 'md' };

export const RecordingBeatIndicator = ({ currentBar, currentBeat, size = 'md' }: Props) => {
  const fontSize = size === 'sm' ? 14 : 20;
  const padding = size === 'sm' ? '3px 6px' : '7.5px 9px';
  return (
    <StyledArea style={{ fontSize: `${fontSize * 0.75}px`, padding }}>
      Bar: {currentBar} / Beat: {currentBeat}
    </StyledArea>
  );
};
