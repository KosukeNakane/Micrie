// テンポと雰囲気（VIBE）の調整ボタンをまとめたコントロールパネルコンポーネント
// 各ボタンはドロップダウンメニューを持ち、トグル動作で開閉を制御
import ControlButton from './ControlButton';
import { useScaleMode } from '../../../context/ScaleModeContext';
import { useState } from 'react';

export const ControlPanel = () => {
  const [openDropdown, setOpenDropdown] = useState<'tempo' | 'scale' | null>(null);
  const { setScaleMode } = useScaleMode();

  const toggleDropdown = (target: 'tempo' | 'scale') => {
    setOpenDropdown((prev) => (prev === target ? null : target));
  };

  const handleScaleSelect = (option: string) => {
    if (option === 'Major') {
      setScaleMode('major');
    } else if (option === 'Minor') {
      setScaleMode('minor');
    } else if (option === 'Chromatic') {
      setScaleMode('chromatic');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
      {/* <TempoControlButton
        onToggle={() => toggleDropdown('tempo')}
        isOpen={openDropdown === 'tempo'}
      /> */}
      <ControlButton
        label="SCALE"
        options={['Major', 'Minor', 'Chromatic']}
        onToggle={() => toggleDropdown('scale')}
        isOpen={openDropdown === 'scale'}
        onSelect={handleScaleSelect}
      />
      {/* <div>Current Scale Mode: {scaleMode}</div> */}
    </div>
  );
};