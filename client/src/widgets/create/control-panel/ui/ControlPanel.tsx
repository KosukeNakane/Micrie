// テンポとスケール（VIBE）等のコントロールをまとめたパネル
import { useScaleMode } from '@entities/scale-mode/model/ScaleModeContext';

import { ControlButton } from './ControlButton';
import { NavBar } from '@shared/ui';

export const ControlPanel = () => {
  const { scaleMode, setScaleMode } = useScaleMode();

  const handleScaleSelect = (option: string) => {
    if (option === 'Major') setScaleMode('major');
    else if (option === 'Minor') setScaleMode('minor');
    else if (option === 'Chromatic') setScaleMode('chromatic');
  };

  const value = scaleMode === 'major' ? 'Major' : scaleMode === 'minor' ? 'Minor' : 'Chromatic';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
      {/* 新しいNavBarのプレビュー */}
      <NavBar />
      <ControlButton
        label={"SCALE"}
        options={['Major', 'Minor', 'Chromatic']}
        value={value}
        onSelect={handleScaleSelect}
      />
    </div>
  );
};
