// 解析モード（whisper / keras）の切替トグル（初期実装）
import { useAnalysisMode } from "@entities/analysis/model/AnalysisModeContext";
import { RectButton } from "@shared/ui/RectButton";

export const ModeToggleButtons = () => {
  const { Amode, setAmode } = useAnalysisMode();
  return (
    <div>
      <RectButton onClick={() => setAmode('keras')} active={Amode === 'keras'} label="Keras Analysis" />
      <RectButton onClick={() => setAmode('whisper')} active={Amode === 'whisper'} label="Whisper Analysis" />
    </div>
  );
};

