// [UI] widgets/ui - ModeSelectArea.tsx
// 役割: 波形画面内の各種モード／サウンド選択UIのレイアウト

import styled from "@emotion/styled";

import { StyledArea } from "@/shared/ui";

import { MoodSelect } from "@/features/mood-select";
import { SoundSelect } from "@/features/sound-select";
import { ChordPatternSelect, DrumPatternSelect } from "@/features/pattern-select";

const Container = styled(StyledArea)`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  grid-template-rows: repeat(3, minmax(24px, auto));
  align-items: center;
  gap: 6px;
  width: 540px;
  height: auto;
  padding: 6px 7.5px;
  margin-top: 32px;
  margin-bottom: 32px;
  text-align: center;
  position: relative;
  z-index: 2;
`;

const Label = styled.span`
  font-size: 18px;
  color: rgba(5, 4, 69, 0.8);
`;

const SelectCell = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const ModeSelectArea = () => (
  <Container>
    <Label>Melody</Label>
    <Label>mood</Label>
    <SelectCell>
      <MoodSelect />
    </SelectCell>
    <Label>Sound:</Label>
    <SelectCell>
      <SoundSelect />
    </SelectCell>

    <Label>Chord</Label>
    <Label>Pattern:</Label>
    <SelectCell>
      <ChordPatternSelect />
    </SelectCell>
    <Label>Sound:</Label>
    <SelectCell>
      <SoundSelect />
    </SelectCell>

    <Label>Drum</Label>
    <Label>Pattern:</Label>
    <SelectCell>
      <DrumPatternSelect />
    </SelectCell>
    <Label>Sound:</Label>
    <SelectCell>
      <SoundSelect />
    </SelectCell>
  </Container>
);
