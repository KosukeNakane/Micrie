// コード進行を選択するセレクトボックスコンポーネント。
// React Select を使い、選択内容をグローバルなchordPattern状態に反映する。

import Select from 'react-select';
import { useChordPattern } from '../../context/ChordPatternContext';

// 表示するコードパターンの選択肢（value: 識別子, label: 表示名）
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
  // ChordPatternContextから現在の選択状態と更新関数を取得
  const { chordPattern, setChordPattern } = useChordPattern();
  return (
    <div style={{ width: '230px', marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <label style={{ fontSize: '14px' }}>Chord Pattern:</label>
      <div style={{ width: '140px' }}>
        {/* コードパターンを選択するReact Selectコンポーネント */}
        <Select
          options={chordOptions}
          value={{
            value: chordPattern,
            label: chordOptions.find(o => o.value === chordPattern)?.label || chordPattern,
          }}
          onChange={(selected) => {
            if (selected) setChordPattern(selected.value);
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