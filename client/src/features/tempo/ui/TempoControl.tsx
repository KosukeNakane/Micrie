// [UI] features/ui - TempoControl.tsx
// 役割: 表示・入力のUIコンポーネント
// TEMPOの値を調整するためのボタンとドロップダウンUIコンポーネント（初期実装）
import styled from '@emotion/styled';

import { scalePx } from '@/shared/lib/scale';

import RcSlider from 'rc-slider';
import 'rc-slider/assets/index.css';
import { useState, useEffect } from 'react';

import { useTempo, TEMPO_MIN, TEMPO_MAX } from '@entities/tempo/model/TempoContext';

type Props = {
  // Legacy props kept for compatibility; ignored now
  isOpen?: boolean;
  onToggle?: () => void;
};

const Wrapper = styled.div`
  display: inline-block;
`;

const Label = styled.label`
  font-family: "brandon-grotesque", sans-serif;
  font-weight: 500;
  font-style: normal;
  font-size: ${scalePx(18)};
  color: rgba(5, 4, 69, 0.8);
  margin-bottom: 4px;
  display: block;
`;

const NumberInput = styled.input`
  font-family: "brandon-grotesque", sans-serif;
  font-weight: 500;
  font-style: normal;
  font-size: ${scalePx(22)};
  color: rgba(5, 4, 69, 0.8);
  text-align: center;
  background: transparent;
  border: none;
  outline: none;
  width: ${scalePx(34)};
`;

const StyledRcSliderWrapper = styled.div`
  width: ${scalePx(160)};
  margin: ${scalePx(8)} 0;
  .rc-slider-rail {
    background-color: rgba(115, 178, 249, 0.707);
    height: ${scalePx(6)};
    border-radius: ${scalePx(3)};
  }
  .rc-slider-track {
    background: linear-gradient(135deg, rgb(88, 180, 255), rgb(12, 68, 255));
    height: ${scalePx(6)};
    border-radius: ${scalePx(3)};
  }
  .rc-slider-handle {
    border: none;
    width: ${scalePx(14)};
    height: ${scalePx(14)};
    margin-top: -3px;
    background-color: rgb(4, 0, 255);
    box-shadow: 0 0 2px rgba(0, 0, 0, 0.3);
  }
  .rc-slider-handle:focus,
  .rc-slider-handle:active {
    box-shadow: 0 0 0 2px rgb(140, 194, 255);
  }
`;

const TempoControlButton = (_props: Props) => {
  const { tempo, setTempo } = useTempo();
  const [tempoInput, setTempoInput] = useState(String(tempo));

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // 途中入力は自由（数字のみ許可）。コンテキストは更新しない。
    if (!/^\d*$/.test(value)) return; // ignore non-digits
    setTempoInput(value);
  };

  const commitInput = () => {
    if (tempoInput === '') {
      setTempo(TEMPO_MIN);
      setTempoInput(String(TEMPO_MIN));
      return;
    }
    const numeric = Number(tempoInput);
    const clamped = Math.min(TEMPO_MAX, Math.max(TEMPO_MIN, numeric));
    setTempo(clamped);
    setTempoInput(String(clamped));
  };

  useEffect(() => {
    setTempoInput(String(tempo));
  }, [tempo]);

  return (
    <Wrapper>
      <Label>
        TEMPO
        <NumberInput
          type="text"
          min={String(TEMPO_MIN)}
          max={String(TEMPO_MAX)}
          value={tempoInput}
          onChange={handleInputChange}
          onBlur={commitInput}
          onKeyDown={(e) => { if (e.key === 'Enter') commitInput(); }}
        />
        BPM
      </Label>
      <StyledRcSliderWrapper>
        <RcSlider
          min={TEMPO_MIN}
          max={TEMPO_MAX}
          value={tempo}
          onChange={(value) => {
            if (typeof value === 'number') {
              setTempo(value);
              setTempoInput(String(value));
            }
          }}
        />
      </StyledRcSliderWrapper>

    </Wrapper>
  );
};

export default TempoControlButton;
