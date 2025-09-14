// [UI] widgets/ui - MelodyReanalysisPanel.tsx
// 役割: 表示・入力のUIコンポーネント
import { Button } from "@chakra-ui/react";
import React, { useState } from "react";

import { useMelodyFileProcessing } from "@features/analysis/model/useMelodyFileProcessing";

import { toaster } from "@/shared/ui/toaster";

type Props = { audioBlob: Blob | null };

export const MelodyReanalysisPanel: React.FC<Props> = ({ audioBlob }) => {
  const [trigger, setTrigger] = useState<number>(0);
  useMelodyFileProcessing(audioBlob, trigger);
  const handleReanalyze = () => {
    if (!audioBlob) {
      toaster.warning({ title: '音声ファイルが読み込まれていません。' });
      return;
    }
    setTrigger((prev) => prev + 1);
  };
  return (
    <div>
      <Button onClick={handleReanalyze} colorScheme="blue">再解析（BPM反映）</Button>
    </div>
  );
};

