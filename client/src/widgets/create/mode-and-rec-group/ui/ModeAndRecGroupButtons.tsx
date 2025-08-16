import { RectButton } from '@shared/ui/RectButton';
import { useMode } from '@entities/mode/model/ModeContext';
import { useSegment } from '@entities/segment/model/SegmentContext';

export const RhythmRecButton = () => {
  const { mode, setMode } = useMode();
  const { setRecMode } = useSegment();
  return (
    <RectButton
      label="RHYTHM REC"
      active={mode === 'rhythm'}
      onClick={() => { setMode('rhythm'); setRecMode('rhythm'); }}
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
      onClick={() => { setMode('melody'); setRecMode('melody'); }}
      flexGrow={0}
    />
  );
};

