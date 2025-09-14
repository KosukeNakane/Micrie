import { useScaleMode } from '@entities/scale-mode/model/ScaleModeContext';

import { GlassSelect } from '@/shared/ui/GlassSelect';

type ScaleValue = 'major' | 'minor' | 'chromatic';

const options: { value: ScaleValue; label: string }[] = [
  { value: 'major', label: 'Major' },
  { value: 'minor', label: 'Minor' },
  { value: 'chromatic', label: 'Chromatic' },
];

export const ScaleModeSelect = () => {
  const { scaleMode, setScaleMode } = useScaleMode();
  const value = options.find((opt) => opt.value === scaleMode) ?? null;
  return (
    <GlassSelect options={options} value={value} onChange={(opt) => setScaleMode(opt.value as ScaleValue)} />
  );
};
