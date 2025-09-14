import { TopPlaybackBar } from "@widgets/top-playback-bar";
import { BarWaveformSection, BarWaveformContainer } from "@widgets/waveform";
import { MelodyCards } from "@widgets/waveform";
import { ChordsEditor } from "@features/chords-editor";

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


