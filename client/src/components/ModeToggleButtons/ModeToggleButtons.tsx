
// 分析モード（whisper または keras）を切り替えるトグルボタンコンポーネント
import { RectButton } from "../shared/RectButton";
import { useAnalysisMode } from "../../context/AnalysisModeContext";

export const ModeToggleButtons = () => {
  // 現在の分析モードとその更新関数を取得
  const { Amode, setAmode } = useAnalysisMode();

  return (
    <div>
      {/* // モードに応じて分析方式を切り替えるボタンを表示 */}
      <RectButton
        onClick={() => setAmode('whisper')}
        active={Amode === 'whisper'}
        label="Whisper Analysis"
      />
      <RectButton
        onClick={() => setAmode('keras')}
        active={Amode === 'keras'}
        label="Keras Analysis"
      />
    </div>
  );
};