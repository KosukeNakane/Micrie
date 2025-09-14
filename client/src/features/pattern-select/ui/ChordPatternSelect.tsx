import { useChordPattern } from '@entities/pattern/model/ChordPatternContext';

import { GlassSelect } from '@/shared/ui/GlassSelect';


type ChordPattern = 'pattern1' | 'pattern2' | 'pattern3' | 'pattern4' | 'pattern5' | 'pattern6' | 'pattern7';

const chordOptions: { value: ChordPattern; label: string }[] = [
  { value: 'pattern3', label: 'Calm Tune' },
  { value: 'pattern1', label: 'Cool City' },
  { value: 'pattern5', label: 'Cry Chorus' },
  { value: 'pattern7', label: 'Emo Canon' },
  { value: 'pattern2', label: 'Happy Pop' },
  { value: 'pattern4', label: 'Soft Sad' },
  { value: 'pattern6', label: 'Trendy Emo' },
];

export const ChordPatternSelect = () => {
  const { chordPattern, setChordPattern } = useChordPattern();
  const value = {
    value: chordPattern,
    label: chordOptions.find(o => o.value === chordPattern)?.label || chordPattern,
  };
  return (
    <GlassSelect options={chordOptions} value={value} onChange={(opt) => setChordPattern(opt.value)} />
  );
};
