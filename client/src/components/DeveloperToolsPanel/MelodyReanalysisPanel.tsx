// 音声ファイル（audioBlob）をもとに、再解析処理をトリガーするボタンを提供する。
// ユーザーがボタンを押すことで、BPMなどの再解析が実行される。

import React, { useState } from "react";
import { useMelodyFileProcessing } from "../../hooks/useMelodyFileProcessing";
import { Button } from "@chakra-ui/react";

type Props = {
  audioBlob: Blob | null;
};

const MelodyReanalysisPanel: React.FC<Props> = ({ audioBlob }) => {
  const [trigger, setTrigger] = useState<number>(0);

  // trigger によって解析を再実行（audioBlobを変更せずに再発火させる）
  useMelodyFileProcessing(audioBlob, trigger);

  const handleReanalyze = () => {
    // audioBlobがnullのときはアラートを表示して処理を中断
    if (!audioBlob) {
      alert("音声ファイルが読み込まれていません。");
      return;
    }
    // triggerを更新してuseMelodyFileProcessingの再実行を促す
    setTrigger(prev => prev + 1);
  };

  return (
    <div>
      <Button onClick={handleReanalyze} colorScheme="blue">
        再解析（BPM反映）
      </Button>
    </div>
  );
};

export default MelodyReanalysisPanel;