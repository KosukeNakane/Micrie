// TEMPOの値を調整するためのボタンとドロップダウンUIコンポーネント（初期実装）
import styled from '@emotion/styled';
import RcSlider from 'rc-slider';
import 'rc-slider/assets/index.css';
import { useState, useEffect } from 'react';

import { useTempo } from '@entities/tempo/model/TempoContext';
import { StyledButton } from '@shared/ui/RectButton';

type Props = {
  isOpen: boolean;
  onToggle: () => void;
};

const Wrapper = styled.div`
  position: relative;
  display: inline-block;
`;

const Dropdown = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  background: white;
  border-radius: 6px;
  margin-top: 4px;
  padding: 12px;
  width: 200px;
  z-index: 100;
`;

const Label = styled.label`
  font-size: 14px;
  margin-bottom: 4px;
  display: block;
`;

const NumberInput = styled.input`
  width: 50%;
  font-size: 16px;
  text-align: center;
`;

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

const TempoControlButton = ({ isOpen, onToggle }: Props) => {
  const { tempo, setTempo } = useTempo();
  const [tempoInput, setTempoInput] = useState(String(tempo));

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setTempoInput(value);
      const numeric = Number(value);
      if (numeric >= 20 && numeric <= 160) setTempo(numeric);
    }
  };

  useEffect(() => {
    setTempoInput(String(tempo));
  }, [tempo]);

  return (
    <Wrapper>
      <StyledButton onClick={onToggle} active={isOpen} style={{ width: '160px', justifyContent: 'center' }}>
        TEMPO: BPM {tempo}
      </StyledButton>
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
          <NumberInput type="text" min="20" max="160" value={tempoInput} onChange={handleInputChange} />
        </Dropdown>
      )}
    </Wrapper>
  );
};

export default TempoControlButton;