// TEMPOの値を調整するためのボタンとドロップダウンUIコンポーネント
// スライダーまたは数値入力によりテンポ（BPM）を変更可能
import { useState, useEffect} from 'react';
import styled from '@emotion/styled';
import { StyledButton } from '../shared/RectButton.tsx';
import { useTempo } from '../../context/TempoContext';

type Props = {
    isOpen: boolean;
    onToggle: () => void;
  };

// ボタンとドロップダウンを包む相対位置のコンテナ
const Wrapper = styled.div`
  position: relative;
  display: inline-block;
`;

// ドロップダウンメニュー本体のスタイル定義
const Dropdown = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  background: white;
  border: 2px solid black;
  border-radius: 6px;
  margin-top: 4px;
  padding: 12px;
  width: 200px;
  z-index: 100;
`;

// TEMPO値のラベル表示スタイル
const Label = styled.label`
  font-size: 14px;
  margin-bottom: 4px;
  display: block;
`;

// テンポを調整するスライダーのスタイル
const Slider = styled.input`
  width: 100%;
  margin: 8px 0;
`;

// 数値入力でテンポを直接設定する入力フィールドのスタイル
const NumberInput = styled.input`
  width: 50%;
  padding: 4px;
  font-size: 16px;
  border: 2px solid black;
  border-radius: 4px;
  text-align: center;
`;

const TempoControlButton = ({ isOpen, onToggle }: Props) => {
  // 現在のテンポ値とその更新関数を取得
  const { tempo, setTempo } = useTempo();
  const [tempoInput, setTempoInput] = useState(String(tempo));
  // スライダー操作時にテンポを更新し、入力欄の表示も同期
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const numeric = Number(e.target.value);
        setTempo(numeric);
        setTempoInput(String(numeric));
      };
  // 数値入力時にバリデーションを行いテンポを更新
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
        setTempoInput(value);
        const numeric = Number(value);
        if (numeric >= 20 && numeric <= 140) {
          setTempo(numeric);
        }
    }
  };

  // 外部でテンポが更新された場合、表示を同期
  useEffect(() => {
    setTempoInput(String(tempo));
  }, [tempo]);

  return (
    <Wrapper>
      {/* TEMPO ドロップダウンの開閉トグルボタン */}
      <StyledButton onClick={onToggle} active={isOpen}>TEMPO</StyledButton>
      {/* ドロップダウンメニューを表示（スライダーと数値入力） */}
      {isOpen && (
        <Dropdown>
          <Label>TEMPO: {tempo} BPM</Label>
          <Slider
            type="range"
            min="20"
            max="140"
            value={tempo}
            onChange={handleSliderChange}
          />
          <NumberInput
            type="text"
            min="20"
            max="140"
            value={tempoInput}
            onChange={handleInputChange}
          />
        </Dropdown>
      )}
    </Wrapper>
  );
};

export default TempoControlButton;