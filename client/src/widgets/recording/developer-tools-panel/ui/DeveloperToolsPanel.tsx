// [UI] widgets/ui - DeveloperToolsPanel.tsx
// 役割: 表示・入力のUIコンポーネント
import { ScaleModeSelect } from "@features/scale-mode";
import { BarSelectDropdown } from "@shared/ui/BarSelectDropdown";
import { MelodyRecButton, RhythmRecButton } from "@widgets/recording/mode-and-rec-group/";
import { ModeToggleButtons } from "@widgets/recording/mode-toggle-buttons";

import { AnalysisResult } from "./AnalysisResult";
import { TrimmingToggle } from "./TrimmingToggle";

interface DeveloperToolsPanelProps {
  isPlaying: boolean;
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
  trimmingEnabled: boolean;
  setTrimmingEnabled: (enabled: boolean) => void;
}

export const DeveloperToolsPanel = ({
  trimmingEnabled,
  setTrimmingEnabled,
}: DeveloperToolsPanelProps) => {
  return (
    <div style={{ marginTop: '8px' }}>
      <ModeToggleButtons />
      <div style={{ marginTop: '16px' }}>
        <TrimmingToggle enabled={trimmingEnabled} onChange={setTrimmingEnabled} />
      </div>
      <div style={{ marginTop: '16px' }}>
        <MelodyRecButton /> <RhythmRecButton />
      </div>
      <div style={{ marginTop: '16px' }}>
        <BarSelectDropdown />
      </div>
      {/* Temporary: Scale selector for quick testing */}
      <div style={{ marginTop: '16px' }}>
        <div style={{ width: '150px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label style={{ fontSize: '14px' }}>Scale:</label>
          <div style={{ width: '90px' }}>
            <ScaleModeSelect />
          </div>
        </div>
      </div>
      <AnalysisResult />
    </div>
  );
};
