// WhisperまたはTeachableの分析モードを管理するコンテキスト
import React, { createContext, useContext, useState } from 'react';

export type AnalysisMode = 'whisper' | 'keras';

const AnalysisModeContext = createContext<{
  Amode: AnalysisMode;
  setAmode: (mode: AnalysisMode) => void;
} | null>(null);

export const AnalysisModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // デフォルトでkerasモードを使用
  const [Amode, setAmode] = useState<AnalysisMode>('keras');

  return (
    <AnalysisModeContext.Provider value={{ Amode, setAmode }}>
      {children}
    </AnalysisModeContext.Provider>
  );
};

// コンテキストを呼び出すカスタムフック。Provider外で使うとエラーを投げる
export const useAnalysisMode = () => {
  const context = useContext(AnalysisModeContext);
  if (!context) {
    throw new Error('useAnalysisMode must be used within an AnalysisModeProvider');
  }
  return context;
};  