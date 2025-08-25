// テンポとスケール（VIBE）等のコントロールをまとめたパネル
import { useScaleMode } from '@entities/scale-mode/model/ScaleModeContext';

import { ControlButton } from './ControlButton';

export const ControlPanel = () => {
  const { scaleMode, setScaleMode } = useScaleMode();

  const handleScaleSelect = (option: string) => {
    if (option === 'Major') setScaleMode('major');
    else if (option === 'Minor') setScaleMode('minor');
    else if (option === 'Chromatic') setScaleMode('chromatic');
  };

  const value = scaleMode === 'major' ? 'Major' : scaleMode === 'minor' ? 'Minor' : 'Chromatic';

  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
      <ControlButton
        label={"SCALE"}
        options={['Major', 'Minor', 'Chromatic']}
        value={value}
        onSelect={handleScaleSelect}
      />
    </div>
  );
};
