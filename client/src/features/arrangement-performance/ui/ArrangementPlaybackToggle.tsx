// [UI] features/ui - ArrangementPlaybackToggle.tsx
// 役割: 再生対象（編集中/キュー）の切り替えトグル
import { Button } from '@chakra-ui/react';

import { usePlaybackController } from '@/features/playback';

import { useArrangementPlaybackMode } from '../model/useArrangementPlaybackMode';

export const ArrangementPlaybackToggle = () => {
  const { mode, setMode } = useArrangementPlaybackMode();
  const { reset } = usePlaybackController();

  const handleSelect = (next: 'off' | 'arrangement') => {
    if (next === mode) return;
    if (next === 'arrangement') {
      reset();
    }
    setMode(next);
  };

  return (
    <div style={{ display: 'flex', gap: '12px' }}>
      <Button
        size="sm"
        aria-pressed={mode === 'off'}
        variant={mode === 'off' ? 'solid' : 'outline'}
        colorScheme="blue"
        onClick={() => handleSelect('off')}
        title="編集中のアレンジを再生"
      >
        Editor
      </Button>
      <Button
        size="sm"
        aria-pressed={mode === 'arrangement'}
        variant={mode === 'arrangement' ? 'solid' : 'outline'}
        colorScheme="purple"
        onClick={() => handleSelect('arrangement')}
        title="アレンジメントスロットを順番に再生"
      >
        Arrangement
      </Button>
    </div>
  );
};
