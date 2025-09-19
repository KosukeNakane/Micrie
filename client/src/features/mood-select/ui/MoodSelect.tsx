// [UI] features/ui - MoodSelect.tsx
// 役割: 表示・入力のUIコンポーネント
import { useState } from 'react';

import { GlassSelect } from '@/shared/ui';

type Option = { value: string; label: string };

const moodOptions: Option[] = [
  { value: 'happy', label: 'Happy' },
  { value: 'calm', label: 'Calm' },
  { value: 'dark', label: 'Dark' },
];

export const MoodSelect = () => {
  const [value, setValue] = useState<Option>(moodOptions[0]);
  return (
    <GlassSelect options={moodOptions} value={value} onChange={setValue} />
  );
};
