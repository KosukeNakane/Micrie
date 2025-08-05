// ドラムパターンを選択するセレクトボックスコンポーネント。
// React Select を使用し、選択に応じてドラムパターン状態を更新。

import Select from "react-select";
import { useDrumPattern } from "../../../context/DrumPatternContext";

// 選択肢として表示するドラムパターン一覧（valueとlabelのペア）
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
  // ドラムパターンの状態と更新関数をContextから取得
  const { drumPattern, setDrumPattern } = useDrumPattern();

  return (
    <div style={{ width: '230px', marginTop: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <label style={{ fontSize: '14px' }}>Drum Pattern:</label>
      <div style={{ width: '140px' }}>
        {/* ドラムパターンを選択するためのReact Select UI */}
        <Select
          options={drumOptions}
          value={drumOptions.find((opt) => opt.value === drumPattern)}
          onChange={(selected) => {
            if (selected) setDrumPattern(selected.value);
          }}
          menuPlacement="auto"
          styles={{
            menu: (base) => ({
              ...base,
              marginTop: 12,
              zIndex: 200,
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.95)',
              boxShadow: '0 6px 10px rgba(0, 0, 0, 0.1)',
            }),
            menuList: (base) => ({
              ...base,
              borderRadius: '10px',
              overflow: 'auto',
              padding: 0,
              maxHeight: 180,
            }),
            control: (base, state) => ({
              ...base,
              fontFamily: '"brandon-grotesque", sans-serif',
              fontWeight: 500,
              fontStyle: 'normal',
              fontSize: '14px',
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
              minHeight: '36px',
              width: '125px',
            }),
            option: (base, state) => ({
              ...base,
              backgroundColor: state.isFocused
                ? 'rgba(172, 203, 229, 0.45)'
                : 'rgba(255, 255, 255, 0.87)',
              color: 'rgba(5, 4, 69, 0.8)',
              fontSize: '14px',
              padding: '6px 10px',
              cursor: 'pointer',
            }),
            singleValue: (base) => ({
              ...base,
              color: 'rgba(5, 4, 69, 0.8)',
            }),
            dropdownIndicator: (base) => ({
              ...base,
              paddingRight: 4,
            }),
          }}
        />
      </div>
    </div>
  );
};