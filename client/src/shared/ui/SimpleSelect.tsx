import Select from 'react-select';

type Option = { value: string; label: string };

type Props = {
  options: Option[];
  value: Option | null;
  onChange: (opt: Option) => void;
  widthPx?: number;
};

export const SimpleSelect = ({ options, value, onChange, widthPx = 110 }: Props) => {
  return (
    <Select
      options={options}
      value={value}
      onChange={(selected) => {
        if (selected) onChange(selected as Option);
      }}
      menuPlacement="auto"
      styles={{
        menu: (base) => ({
          ...base,
          marginTop: 12,
          zIndex: 200,
          borderRadius: '10px',
          background: 'rgba(255, 255, 255, 0.95)',
          boxShadow: '0 6px 10px rgba(0, 0, 0, 0.1)'
        }),
        menuList: (base) => ({ ...base, borderRadius: '10px', overflow: 'auto', padding: 0, maxHeight: 180 }),
        control: (base, state) => ({
          ...base,
          fontFamily: '"brandon-grotesque", sans-serif',
          fontWeight: 500,
          fontStyle: 'normal',
          fontSize: '13px',
          background: state.isFocused
            ? 'linear-gradient(135deg, rgba(172, 203, 229, 0.45), rgba(165, 178, 220, 0.74))'
            : 'linear-gradient(135deg,rgba(255, 255, 255, 0.87),rgb(212, 221, 240))',
          color: 'rgba(5, 4, 69, 0.8)',
          border: '1px solid rgba(255, 255, 255, 0.18)',
          borderRadius: '10px',
          boxShadow: state.isFocused
            ? 'inset 0 2px 4px rgba(0, 0, 0, 0.2)'
            : '0 6px 10px 0 rgba(31, 38, 135, 0.37)',
          backdropFilter: 'blur(20px)',
          transition: 'background 0.3s ease',
          cursor: 'pointer',
          minHeight: '30px',
          width: `${widthPx}px`,
        }),
        option: (base, state) => ({
          ...base,
          backgroundColor: state.isFocused ? 'rgba(172, 203, 229, 0.45)' : 'rgba(255, 255, 255, 0.87)',
          color: 'rgba(5, 4, 69, 0.8)',
          fontSize: '13px',
          padding: '4px 8px',
          cursor: 'pointer'
        }),
        singleValue: (base) => ({ ...base, color: 'rgba(5, 4, 69, 0.8)' }),
        dropdownIndicator: (base) => ({ ...base, paddingRight: 4 }),
      }}
    />
  );
};

