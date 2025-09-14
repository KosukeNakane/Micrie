// [UI] features/ui - SoundSelect.tsx
// 役割: 表示・入力のUIコンポーネント
import { useState } from 'react';

import { GlassSelect } from '@/shared/ui';

type Option = { value: string; label: string };

const soundOptions: Option[] = [
  { value: 'default', label: 'Default' },
  { value: 'bright', label: 'Bright' },
  { value: 'warm', label: 'Warm' },
];

export const SoundSelect = () => {
  const [value, setValue] = useState<Option>(soundOptions[0]);
  return (
    <GlassSelect options={soundOptions} value={value} onChange={setValue} />
  );
};
