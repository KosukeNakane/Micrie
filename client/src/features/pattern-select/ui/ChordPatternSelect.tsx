import Select from 'react-select';
import { scalePx } from '@/shared/lib/scale';

import { useChordPattern } from '@entities/pattern/model/ChordPatternContext';

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
  return (
    <div style={{ width: '150px', marginTop: '4.5px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <label style={{ fontSize: '14px' }}>Chord Pattern:</label>
      <div style={{ width: '90px' }}>
        <Select
          options={chordOptions}
          value={{
            value: chordPattern,
            label: chordOptions.find(o => o.value === chordPattern)?.label || chordPattern,
          }}
          onChange={(selected) => { if (selected) setChordPattern(selected.value); }}
          menuPlacement="auto"
          styles={{
            menu: (base) => ({ ...base, marginTop: '9px', zIndex: 200, borderRadius: scalePx(10), background: 'rgba(255, 255, 255, 0.95)', boxShadow: `0 ${scalePx(6)} ${scalePx(10)} rgba(0, 0, 0, 0.1)` }),
            menuList: (base) => ({ ...base, borderRadius: scalePx(10), overflow: 'auto', padding: 0, maxHeight: scalePx(180) }),
            control: (base, state) => ({
              ...base,
              fontFamily: '"brandon-grotesque", sans-serif', fontWeight: 500, fontStyle: 'normal', fontSize: '14px',
              background: state.isFocused ? 'linear-gradient(135deg, rgba(172, 203, 229, 0.45), rgba(165, 178, 220, 0.74))' : 'linear-gradient(135deg,rgba(255, 255, 255, 0.87),rgb(212, 221, 240))',
              color: 'rgba(5, 4, 69, 0.8)', border: '1px solid rgba(255, 255, 255, 0.18)', borderRadius: '10px',
              boxShadow: state.isFocused ? `inset 0 ${scalePx(2)} ${scalePx(4)} rgba(0, 0, 0, 0.2)` : `0 ${scalePx(6)} ${scalePx(10)} 0 rgba(31, 38, 135, 0.37)`,
              backdropFilter: 'blur(20px)', transition: 'background 0.3s ease', cursor: 'pointer', minHeight: scalePx(30), width: '82.5px',
            }),
            option: (base, state) => ({ ...base, backgroundColor: state.isFocused ? 'rgba(172, 203, 229, 0.45)' : 'rgba(255, 255, 255, 0.87)', color: 'rgba(5, 4, 69, 0.8)', fontSize: '14px', padding: `${scalePx(4)} ${scalePx(8)}`, cursor: 'pointer' }),
            singleValue: (base) => ({ ...base, color: 'rgba(5, 4, 69, 0.8)' }),
            dropdownIndicator: (base) => ({ ...base, paddingRight: 4 }),
          }}
        />
      </div>
    </div>
  );
};
