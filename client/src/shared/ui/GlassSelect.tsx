// [UI] shared/ui - GlassSelect.tsx
// 役割: 表示・入力のUIコンポーネント
import Select from 'react-select';

import { scalePx } from '@/shared/lib/scale';

import type { SingleValue } from 'react-select';

export type GlassOption<T extends string = string> = { value: T; label: string };

type Props<T extends string = string> = {
  options: GlassOption<T>[];
  value: GlassOption<T> | null;
  onChange: (opt: GlassOption<T>) => void;
  widthPx?: number; // ベース幅（コントロール幅は約0.75倍で従来と同じ見た目）
};

export const GlassSelect = <T extends string = string>({ options, value, onChange, widthPx = 180 }: Props<T>) => {
  return (
    <Select
      options={options as GlassOption[]}
      value={value as GlassOption | null}
      onChange={(selected: SingleValue<GlassOption>) => {
        if (selected) onChange(selected as GlassOption<T>);
      }}
      menuPlacement="auto"
      styles={{
        menu: (base) => ({
          ...base,
          marginTop: '9px',
          zIndex: 200,
          borderRadius: scalePx(10),
          background: 'rgba(255, 255, 255, 0.95)',
          boxShadow: `0 ${scalePx(6)} ${scalePx(10)} rgba(0, 0, 0, 0.1)`
        }),
        menuList: (base) => ({ ...base, borderRadius: scalePx(10), overflow: 'auto', padding: 0, maxHeight: scalePx(180) }),
        control: (base, state) => ({
          ...base,
          fontFamily: '"brandon-grotesque", sans-serif',
          fontWeight: 500,
          fontStyle: 'normal',
          fontSize: '16px',
          background: state.isFocused
            ? 'linear-gradient(135deg, rgba(172, 203, 229, 0.45), rgba(165, 178, 220, 0.74))'
            : 'linear-gradient(135deg,rgba(255, 255, 255, 0.87),rgb(212, 221, 240))',
          color: 'rgba(5, 4, 69, 0.8)',
          border: '1px solid rgba(255, 255, 255, 0.18)',
          borderRadius: scalePx(10),
          boxShadow: state.isFocused
            ? `inset 0 ${scalePx(2)} ${scalePx(4)} rgba(0, 0, 0, 0.2)`
            : `0 ${scalePx(6)} ${scalePx(10)} 0 rgba(31, 38, 135, 0.37)`,
          backdropFilter: 'blur(20px)',
          transition: 'background 0.3s ease',
          cursor: 'pointer',
          minHeight: scalePx(30),
          width: `${widthPx * 0.75}px`,
        }),
        option: (base, state) => ({
          ...base,
          backgroundColor: state.isFocused ? 'rgba(172, 203, 229, 0.45)' : 'rgba(255, 255, 255, 0.87)',
          color: 'rgba(5, 4, 69, 0.8)',
          fontSize: '16px',
          padding: `${scalePx(4)} ${scalePx(8)}`,
          cursor: 'pointer'
        }),
        singleValue: (base) => ({ ...base, color: 'rgba(5, 4, 69, 0.8)' }),
        dropdownIndicator: (base) => ({ ...base, paddingRight: 4 }),
      }}
    />
  );
};
