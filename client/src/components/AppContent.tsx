//import///////////////////////////////////////////////////

//Componet
import { TopNav } from "./shared/TopNav.tsx";
import { ModeAndRecGroup } from "./ModeAndRecGroup/ModeAndRecGroup.tsx";
import { ControlPanel } from "./ControlPanel/ControlPanel.tsx";
import { WaveformDisplay } from "./WaveformDisplay/WaveformDisplay.tsx";

//自作Hooks
import { useAudioRecorder } from "../hooks/useAudioRecorder";

//組み込みHooks
import { useContext } from "react";

//Context グローバル変数)
import { TempoContext } from "../context/TempoContext.ts";

/////////////////////////////////////////////
export const AppContent = ({
  mode,
  setMode,
}: {
  mode: 'rhythm' | 'melody';
  setMode: (mode: 'rhythm' | 'melody') => void;
}) => {
  
  // Hooks(useAudioRecorder)の返り値を定数として定義　定数名は各プロパティ名を使用(分割代入)
  const {
    isRecording,
    startRecording,
    stopRecording,
    audioBlob,
    segments,
  } = useAudioRecorder();
  
  //　AppのuseStateで取得した最新のテンポ情報を持つような定数tempoを定義
  const tempoContext = useContext(TempoContext); //Context(tempoContext)呼び出してtempoContextに代入　tempoContextの方はTempoContextの型を基に型推論が行われる
  if (!tempoContext) return null; //tempoContextがnullならnullを返却
  const { tempo } = tempoContext; //App.tsx内でテンポ情報を扱うための定数tempoを定義 定数tempoにはtempoContext内のプロパティtempoを代入(分割代入)

  //  録音ボタン用トグル関数
  const handleToggleRecording = () => {
    if (!tempoContext) return; //tempoContextがnullなら即時終了
    isRecording ? stopRecording() : startRecording(tempo); //関数実行時にisRecordnigがtrueなら録音停止　falseなら録音開始(tempoも渡す)
  };

  return (
      
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <TopNav />
        <ModeAndRecGroup
          mode={mode}
          onModeChange={setMode}
          isRecording={isRecording}
          onToggleRecording={handleToggleRecording}
        />
        <WaveformDisplay 
          audioBlob={audioBlob} 
          isRecording={isRecording}
          segments={segments} // 👈 追加
        />
        <ControlPanel />
      </div>
  );
};