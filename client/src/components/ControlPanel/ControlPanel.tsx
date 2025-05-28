// テンポと雰囲気（VIBE）の調整ボタンをまとめたコントロールパネルコンポーネント
// 各ボタンはドロップダウンメニューを持ち、トグル動作で開閉を制御
import TempoControlButton from './TempoControlButton';
import ControlButton from './ControlButton';

import { useState } from 'react';

export const ControlPanel = () => {

  // 現在開いているドロップダウンの状態を管理（'tempo' または 'vibe' または null）
  const [openDropdown, setOpenDropdown] = useState<'tempo' | 'vibe' | null>(null);
  
  // 同じボタンを再度クリックすると閉じ、他方をクリックすると切り替える
  const toggleDropdown = (target: 'tempo' | 'vibe') => {
    setOpenDropdown((prev) => (prev === target ? null : target));
  };
  
  // テンポとVIBEのコントロールボタンを横並びで表示
  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
      <TempoControlButton
        onToggle={() => toggleDropdown('tempo')}
        isOpen={openDropdown === 'tempo'}
      />
      <ControlButton
        label="VIBE"
        options={['Happy', 'Dark', 'Chill']}
        onToggle={() => toggleDropdown('vibe')}
        isOpen={openDropdown === 'vibe'}
      />
    </div>
  );
};