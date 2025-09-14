// VOLUMEの値を調整するためのボタンと入力・スライダーのUIコンポーネント（UIのみ）
import styled from '@emotion/styled';

import { scalePx } from '@/shared/lib/scale';

import RcSlider from 'rc-slider';
import 'rc-slider/assets/index.css';
import { useState, useEffect } from 'react';

import { useGlobalAudio } from '@entities/audio/model/GlobalAudioContext';
import { useVolume, VOLUME_MIN as MIN, VOLUME_MAX as MAX } from '@entities/volume/model/VolumeContext';

type Props = {};

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

const VolumeControl = (_props: Props) => {
  const engine = useGlobalAudio();
  const { volume, setVolume } = useVolume();
  const clamp = (v: number) => Math.min(MAX, Math.max(MIN, v));
  const [volumeInput, setVolumeInput] = useState<string>(String(volume));

  // AudioGraph が未初期化の場合に備え、最初に起動（ユーザー操作内想定）
  useEffect(() => {
    (async () => { try { await engine.ensureStarted(); } catch { } })();
  }, [engine]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (!/^\d*$/.test(value)) return; // 数字のみ許可
    setVolumeInput(value);
  };

  const commitInput = () => {
    if (volumeInput === '') {
      setVolume(MIN);
      setVolumeInput(String(MIN));
      return;
    }
    const numeric = Number(volumeInput);
    const clamped = clamp(numeric);
    setVolume(clamped);
    setVolumeInput(String(clamped));
  };

  useEffect(() => {
    setVolumeInput(String(volume));
  }, [volume]);

  // エンジン連動は VolumeEngineBinder に委譲

  return (
    <Wrapper>
      <Label>
        VOLUME
        <NumberInput
          type="text"
          min={String(MIN)}
          max={String(MAX)}
          value={volumeInput}
          onChange={handleInputChange}
          onBlur={commitInput}
          onKeyDown={(e) => { if (e.key === 'Enter') commitInput(); }}
        />
      </Label>
      <StyledRcSliderWrapper>
        <RcSlider
          min={MIN}
          max={MAX}
          value={volume}
          onChange={(value) => {
            if (typeof value === 'number') {
              const c = clamp(value);
              setVolume(c);
              setVolumeInput(String(c));
            }
          }}
        />
      </StyledRcSliderWrapper>
    </Wrapper>
  );
};

export default VolumeControl;
