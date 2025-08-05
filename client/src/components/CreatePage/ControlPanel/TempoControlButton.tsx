// TEMPOの値を調整するためのボタンとドロップダウンUIコンポーネント
// スライダーまたは数値入力によりテンポ（BPM）を変更可能
import RcSlider from 'rc-slider';
import 'rc-slider/assets/index.css';
import { useState, useEffect} from 'react';
import styled from '@emotion/styled';
import { StyledButton } from '../../shared/RectButton.tsx';
import { useTempo } from '../../../context/TempoContext';

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
  // border: 2px solid black;
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

// 数値入力でテンポを直接設定する入力フィールドのスタイル
const NumberInput = styled.input`
  width: 50%;
  font-size: 16px;
  text-align: center;
`;

const TempoControlButton = ({ isOpen, onToggle }: Props) => {
  // 現在のテンポ値とその更新関数を取得
  const { tempo, setTempo } = useTempo();
  const [tempoInput, setTempoInput] = useState(String(tempo));

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

  // テンポ更新時に入力表示を同期
  useEffect(() => {
    setTempoInput(String(tempo));
  }, [tempo]);

  return (
    <Wrapper>
      {/* TEMPO ドロップダウンの開閉トグルボタン */}
      <StyledButton onClick={onToggle} active={isOpen} style={{ width: '160px', justifyContent: 'center' }}>
        TEMPO: BPM {tempo}
      </StyledButton>
      {/* ドロップダウンメニューを表示（スライダーと数値入力） */}
      {isOpen && (
        <Dropdown>
          <Label>TEMPO: {tempo} BPM</Label>
          <StyledRcSliderWrapper>
            <RcSlider
              min={20}
              max={160}
              value={tempo}
              onChange={(value) => {
                if (typeof value === 'number') {
                  setTempo(value);
                  setTempoInput(String(value));
                }
              }}
            />
          </StyledRcSliderWrapper>
          <NumberInput
            type="text"
            min="20"
            max="160"
            value={tempoInput}
            onChange={handleInputChange}
          />
        </Dropdown>
      )}
    </Wrapper>
  );
};

export default TempoControlButton;

const StyledRcSliderWrapper = styled.div`
  margin: 8px 0;
  .rc-slider-rail {
    background-color: rgba(200, 200, 255, 0.2);
    height: 6px;
    border-radius: 3px;
  }
  .rc-slider-track {
    background: linear-gradient(135deg, rgba(172, 203, 229, 0.45), rgba(165, 178, 220, 0.74));
    height: 6px;
    border-radius: 3px;
  }
  .rc-slider-handle {
    border: none;
    width: 14px;
    height: 14px;
    margin-top: -4px;
    background-color: rgba(5, 4, 69, 0.8);
    box-shadow: 0 0 2px rgba(0, 0, 0, 0.3);
  }
  .rc-slider-handle:focus,
  .rc-slider-handle:active {
    box-shadow: 0 0 0 4px rgba(172, 203, 229, 0.45);
  }
`;