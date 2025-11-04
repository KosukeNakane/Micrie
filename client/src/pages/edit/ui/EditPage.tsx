// [UI] pages/ui - EditPage.tsx
// 役割: 表示・入力のUIコンポーネント
import { Box } from "@chakra-ui/react";
import styled from "@emotion/styled";
import { useState } from "react";

import { useAudioStore } from "@/entities/audio";
import { ChordsEditor } from "@/features/chords-editor";
import { DrumsEditor } from "@/features/drums-editor";
import { MoodSelect } from "@/features/mood-select";
import { ChordPatternSelect, DrumPatternSelect } from "@/features/pattern-select";
import { TopPlaybackBar } from "@widgets/top-playback-bar";
import { BarWaveformSection, BarWaveformContainer } from "@widgets/waveform";
import { MelodyCards, ChordsCards, DrumsCards } from "@widgets/waveform";
import { ArrangementSlotsSidebar } from "@widgets/arrangement-slots";
import { AudioFileUploader, MelodyReanalysisPanel } from "@/widgets/recording/audio-analysis-tools";

const PageBody = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: 32px;
  padding: 0 32px 32px;
  box-sizing: border-box;
`;

const MainColumn = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
`;

// 旧 RHYTHM / MELODY ページを統合した編集ページ
// 既存の機能はそのままで、上部ナビは NavBar に移行済み
export const EditPage = () => {
  const { audioBlob, setAudioBlob } = useAudioStore();
  const [activeTab, setActiveTab] = useState<"melody" | "chords" | "drums">("melody");

  return (
    <div>
      <TopPlaybackBar />
      <PageBody>
        <MainColumn>
          <BarWaveformContainer
            melody={
              <>
                <Box display="flex" pl={3}>
                  <MoodSelect />
                </Box>
                <BarWaveformSection />
                <MelodyCards />
              </>
            }
            chords={
              <>
                <Box display="flex" pl={3}>
                  <ChordPatternSelect />
                </Box>
                <ChordsEditor />
                <ChordsCards />
              </>
            }
            drums={
              <>
                <Box display="flex" pl={3}>
                  <DrumPatternSelect />
                </Box>
                <DrumsEditor />
                <DrumsCards />
              </>
            }
            onTabChange={setActiveTab}
          />
          {activeTab === "melody" && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                paddingBottom: 16,
                gap: 8,
                marginLeft: "auto",
                marginRight: "auto",
                width: 1050,
              }}
            >
              <AudioFileUploader onAudioFileSelected={(b) => setAudioBlob(b, "uploaded")} />
              <MelodyReanalysisPanel audioBlob={audioBlob} />
            </div>
          )}
        </MainColumn>
        <ArrangementSlotsSidebar />
      </PageBody>
    </div>
  );
};
