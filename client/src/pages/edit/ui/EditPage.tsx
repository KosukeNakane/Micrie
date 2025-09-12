/** @jsxImportSource @emotion/react */
import styled from "@emotion/styled";
import { TopPlaybackBar } from "@widgets/top-playback-bar";
import { BarWaveformSection, BarWaveformContainer } from "@widgets/waveform";
import { MelodyCards } from "@widgets/waveform";
import { ChordsEditor } from "@features/chords-editor";
import { StyledArea, GlassSelect } from "@shared/ui";
import { ScaleModeSelect } from "@features/scale-mode";
import { ChordPatternSelect, DrumPatternSelect } from "@features/pattern-select";

// レイアウト用のStyledArea派生コンポーネント
const ControlsPanel = styled(StyledArea)`
  display: grid;
  grid-template-columns: 120px 1fr 160px;
  grid-auto-rows: minmax(36px, auto);
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  max-width: 600px;
`;

// 旧 RHYTHM / MELODY ページを統合した編集ページ
// 既存の機能はそのままで、上部ナビは NavBar に移行済み
export const EditPage = () => {
  return (
    <div>
      <TopPlaybackBar />
      <BarWaveformContainer
        melody={
          <>
            <BarWaveformSection />
            <MelodyCards />
          </>
        }
        chords={
          <>
            <ChordsEditor />
          </>
        }
      />
    </div>
  );
};


