// [UI] pages/ui - EditPage.tsx
// 役割: 表示・入力のUIコンポーネント
import { ChordsEditor } from "@/features/chords-editor";
import { DrumsEditor } from "@/features/drums-editor";
import { MoodSelect } from "@/features/mood-select";
import { ChordPatternSelect, DrumPatternSelect } from "@/features/pattern-select";
import { TopPlaybackBar } from "@widgets/top-playback-bar";
import { BarWaveformSection, BarWaveformContainer } from "@widgets/waveform";
import { MelodyCards, ChordsCards, DrumsCards } from "@widgets/waveform";

// 旧 RHYTHM / MELODY ページを統合した編集ページ
// 既存の機能はそのままで、上部ナビは NavBar に移行済み
export const EditPage = () => {
  return (
    <div>
      <TopPlaybackBar />
      <BarWaveformContainer
        melody={
          <>
            <div style={{ paddingLeft: 12 }}>
              <MoodSelect />
            </div>
            <BarWaveformSection />
            <MelodyCards />
          </>
        }
        chords={
          <>
            <div style={{ paddingLeft: 12 }}>
              <ChordPatternSelect />
            </div>
            <ChordsEditor />
            <ChordsCards />
          </>
        }
        drums={
          <>
            <div style={{ paddingLeft: 12 }}>
              <DrumPatternSelect />
            </div>
            <DrumsEditor />
            <DrumsCards />
          </>
        }
      />
    </div>
  );
};
