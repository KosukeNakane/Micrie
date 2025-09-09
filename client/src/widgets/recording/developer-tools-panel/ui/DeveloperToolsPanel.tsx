import { BarSelectDropdown } from "@shared/ui/BarSelectDropdown";
import { MelodyRecButton, RhythmRecButton } from "@widgets/recording/mode-and-rec-group/";
import { ModeToggleButtons } from "@widgets/recording/mode-toggle-buttons";

import { AnalysisResult } from "./AnalysisResult";
import { AudioFileUploader } from "./AudioFileUploader";
import { MelodyReanalysisPanel } from "./MelodyReanalysisPanel";
import { PlaybackButton } from "./PlaybackButton";
import { TrimmingToggle } from "./TrimmingToggle";

interface DeveloperToolsPanelProps {
  isPlaying: boolean;
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
  devAudioBlob: Blob | null;
  setDevAudioBlob: React.Dispatch<React.SetStateAction<Blob | null>>;
  trimmingEnabled: boolean;
  setTrimmingEnabled: (enabled: boolean) => void;
}

export const DeveloperToolsPanel = ({
  isPlaying,
  setIsPlaying,
  devAudioBlob,
  setDevAudioBlob,
  trimmingEnabled,
  setTrimmingEnabled,
}: DeveloperToolsPanelProps) => {
  return (
    <div style={{ marginTop: '8px' }}>
      <ModeToggleButtons />
      <AudioFileUploader onAudioFileSelected={setDevAudioBlob} />
      <MelodyReanalysisPanel audioBlob={devAudioBlob} />
      <div style={{ marginTop: '16px' }}>
        <TrimmingToggle enabled={trimmingEnabled} onChange={setTrimmingEnabled} />
      </div>
      <div style={{ marginTop: '16px' }}>
        <MelodyRecButton /> <RhythmRecButton />
      </div>
      <div style={{ marginTop: '16px' }}>
        <PlaybackButton isPlaying={isPlaying} setIsPlaying={setIsPlaying} />
      </div>
      <div style={{ marginTop: '16px' }}>
        <BarSelectDropdown />
      </div>
      <AnalysisResult />
    </div>
  );
};
