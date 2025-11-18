// [UI] features/ui - ArrangementPlaybackToggle.tsx
// 役割: 再生対象（編集中/キュー）の切り替えトグル
import { Button } from '@chakra-ui/react';

import { useArrangementPlaybackMode } from '../model/useArrangementPlaybackMode';

export const ArrangementPlaybackToggle = () => {
  const { mode, setMode } = useArrangementPlaybackMode();

  return (
    <div style={{ display: 'flex', gap: '12px' }}>
      <Button
        size="sm"
        aria-pressed={mode === 'off'}
        variant={mode === 'off' ? 'solid' : 'outline'}
        colorScheme="blue"
        onClick={() => setMode('off')}
        title="編集中のアレンジを再生"
      >
        Editor
      </Button>
      <Button
        size="sm"
        aria-pressed={mode === 'arrangement'}
        variant={mode === 'arrangement' ? 'solid' : 'outline'}
        colorScheme="purple"
        onClick={() => setMode('arrangement')}
        title="アレンジメントスロットを順番に再生"
      >
        Arrangement
      </Button>
    </div>
  );
};
