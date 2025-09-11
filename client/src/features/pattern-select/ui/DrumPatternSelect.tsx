import { GlassSelect } from '@/shared/ui/GlassSelect';
import { useDrumPattern } from '@entities/pattern/model/DrumPatternContext';

export type DrumPattern = 'basic' | 'hiphop' | 'funk' | 'rock' | 'jazz' | 'electro';

const drumOptions: { value: DrumPattern; label: string }[] = [
  { value: 'basic', label: 'Basic' },
  { value: 'hiphop', label: 'Hiphop' },
  { value: 'funk', label: 'Funk' },
  { value: 'rock', label: 'Rock' },
  { value: 'jazz', label: 'Jazz' },
  { value: 'electro', label: 'Electro' },
];

export const DrumPatternSelect: React.FC = () => {
  const { drumPattern, setDrumPattern } = useDrumPattern();
  const value = drumOptions.find((opt) => opt.value === drumPattern) ?? null;
  return (
    <GlassSelect options={drumOptions} value={value} onChange={(opt) => setDrumPattern(opt.value)} />
  );
};
