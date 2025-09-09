import Select from 'react-select';

import { useScaleMode } from '@entities/scale-mode/model/ScaleModeContext';

type ScaleValue = 'major' | 'minor' | 'chromatic';

const options: { value: ScaleValue; label: string }[] = [
  { value: 'major', label: 'Major' },
  { value: 'minor', label: 'Minor' },
  { value: 'chromatic', label: 'Chromatic' },
];

export const ScaleModeSelect = () => {
  const { scaleMode, setScaleMode } = useScaleMode();
  return (
    <div style={{ width: '200px', marginTop: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <label style={{ fontSize: '14px' }}>Scale:</label>
      <div style={{ width: '120px' }}>
        <Select
          options={options}
          value={options.find((opt) => opt.value === scaleMode)}
          onChange={(selected) => { if (selected) setScaleMode(selected.value as ScaleValue); }}
          menuPlacement="auto"
          isSearchable
          styles={{
            menu: (base) => ({ ...base, marginTop: 12, zIndex: 200, borderRadius: '10px', background: 'rgba(255, 255, 255, 0.95)', boxShadow: '0 6px 10px rgba(0, 0, 0, 0.1)' }),
            menuList: (base) => ({ ...base, borderRadius: '10px', overflow: 'auto', padding: 0, maxHeight: 180 }),
            control: (base, state) => ({
              ...base,
              fontFamily: '"brandon-grotesque", sans-serif', fontWeight: 500, fontStyle: 'normal', fontSize: '13px',
              background: state.isFocused ? 'linear-gradient(135deg, rgba(172, 203, 229, 0.45), rgba(165, 178, 220, 0.74))' : 'linear-gradient(135deg,rgba(255, 255, 255, 0.87),rgb(212, 221, 240))',
              color: 'rgba(5, 4, 69, 0.8)', border: '1px solid rgba(255, 255, 255, 0.18)', borderRadius: '10px',
              boxShadow: state.isFocused ? 'inset 0 2px 4px rgba(0, 0, 0, 0.2)' : '0 6px 10px 0 rgba(31, 38, 135, 0.37)',
              backdropFilter: 'blur(20px)', transition: 'background 0.3s ease', cursor: 'pointer', minHeight: '30px', width: '110px',
            }),
            option: (base, state) => ({ ...base, backgroundColor: state.isFocused ? 'rgba(172, 203, 229, 0.45)' : 'rgba(255, 255, 255, 0.87)', color: 'rgba(5, 4, 69, 0.8)', fontSize: '13px', padding: '4px 8px', cursor: 'pointer' }),
            singleValue: (base) => ({ ...base, color: 'rgba(5, 4, 69, 0.8)' }),
            dropdownIndicator: (base) => ({ ...base, paddingRight: 4 }),
          }}
        />
      </div>
    </div>
  );
};
