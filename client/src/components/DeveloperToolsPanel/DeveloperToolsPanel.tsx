import { ModeToggleButtons } from "../ModeToggleButtons/ModeToggleButtons";
import { AudioFileUploader } from "./AudioFileUploader";
import { AnalysisResult } from "../Analysis/AnalysisResult";
import { MelodyRecButton, RhythmRecButton } from "../ModeAndRecGroup/ModeAndRecGroup";
import { PlaybackButton } from "./PlaybackButton";
import { BarSelectDropdown } from "../shared/BarSelectDropdown";
import { TrimmingToggle } from "./TrimmingToggle";
import MelodyReanalysisPanel from "./MelodyReanalysisPanel";

interface DeveloperToolsPanelProps {
  tempo: number;
  isPlaying: boolean;
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
  devAudioBlob: Blob | null;
  setDevAudioBlob: React.Dispatch<React.SetStateAction<Blob | null>>;
  trimmingEnabled: boolean;
  setTrimmingEnabled: (enabled: boolean) => void;
}

export const DeveloperToolsPanel = ({
  tempo,
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
            <TrimmingToggle
                enabled={trimmingEnabled}
                onChange={setTrimmingEnabled}
            />
      </div>
      <div style={{ marginTop: '16px' }}>
            <MelodyRecButton /> <RhythmRecButton />
      </div>
      <div style={{ marginTop: '16px' }}>
            <PlaybackButton
                isPlaying={isPlaying}
                setIsPlaying={setIsPlaying}
                startX={0}
                endX={(60 / tempo) * 2 * 1000}
                audioBlob={devAudioBlob}
            />
      </div>  
      <div style={{ marginTop: '16px' }}>
           <BarSelectDropdown />
      </div>
      <AnalysisResult />
    </div>
  );
};