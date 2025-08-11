// アプリの主コンテンツを構成するコンポーネント
// 録音、再生、リアルタイムラベル表示、解析結果表示などの要素を統合

/** @jsxImportSource @emotion/react */
import { glassBackground } from "../../styles/glassBackground.ts";
import { useState } from "react";
import { TopNav } from "../TopNav.tsx";
import { ModeAndRecGroup } from "./ModeAndRecGroup/ModeAndRecGroup.tsx";
import { ControlPanel } from "./ControlPanel/ControlPanel.tsx";
import { WaveformDisplay } from "./WaveformDisplay/WaveformDisplay.tsx";
import { RealtimeLabel } from "./RealtimeLabel/RealtimeLabel.tsx";
import { useAudioRecorder } from "../../hooks/useAudioRecorder.ts";
import { useTempo } from "../../context/TempoContext.tsx";



import { RectButton } from "../shared/RectButton.tsx";

import { useMelodyFileProcessing } from "../../hooks/useMelodyFileProcessing.ts";

import { DeveloperToolsPanel } from "./DeveloperToolsPanel/DeveloperToolsPanel.tsx";

export const CreateContent = () => {

  // 録音状態・音声データ・リアルタイムラベルを管理するカスタムフック
  const {
    toggleRecording,
    audioBlob,
    realtimeLabel,
  } = useAudioRecorder();

  // テンポ（BPM）を取得するカスタムフック
  const { tempo } = useTempo();


  const [trimmingEnabled, setTrimmingEnabled] = useState(false);
  const [showDeveloperTools, setShowDeveloperTools] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [devAudioBlob, setDevAudioBlob] = useState<Blob | null>(null);

  const { trimmedBlob } = useMelodyFileProcessing(devAudioBlob, undefined, trimmingEnabled);

  // 録音の開始・停止をtempoに基づいてトグル
  const handleToggleRecording = () => {
    if (!tempo) return;
    toggleRecording(tempo);
  };

  // 各UIコンポーネントを順にレンダリング
  return (
    <div css={glassBackground}>
      <RealtimeLabel label={realtimeLabel} />
      <TopNav />
      <ModeAndRecGroup
        onToggleRecording={handleToggleRecording}
      />
      <WaveformDisplay
        audioBlob={trimmedBlob ?? devAudioBlob ?? audioBlob}
      />
      <ControlPanel />

      <RectButton
        onClick={() => setShowDeveloperTools((prev) => !prev)}
        label={showDeveloperTools ? "▴ Close Developer Tools" : "▾ Open Developer Tools"}
      />

      {showDeveloperTools && (
        <DeveloperToolsPanel
          tempo={tempo}
          isPlaying={isPlaying}
          setIsPlaying={setIsPlaying}
          devAudioBlob={devAudioBlob}
          setDevAudioBlob={setDevAudioBlob}
          trimmingEnabled={trimmingEnabled}
          setTrimmingEnabled={setTrimmingEnabled}
        />
      )}

      <div style={{
        display: "flex",
        gap: "16px",
        margin: "20px",
      }}>
      </div>

    </div>
  );
};