// [UI] pages/ui - EditPage.tsx
// 役割: 表示・入力のUIコンポーネント
import { ChordsEditor } from "@features/chords-editor";
import { TopPlaybackBar } from "@widgets/top-playback-bar";
import { BarWaveformSection, BarWaveformContainer } from "@widgets/waveform";
import { MelodyCards, ChordsCards, DrumsCards } from "@widgets/waveform";
import { DrumsEditor } from "@features/drums-editor";

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
            <ChordsCards />
          </>
        }
        drums={
          <>
            <DrumsEditor />
            <DrumsCards />
          </>
        }
      />
    </div>
  );
};
