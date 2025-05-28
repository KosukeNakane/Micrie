// モード（rhythm / melody）の状態を管理するコンテキスト
import React, { createContext, useContext, useState } from 'react';

export type Mode = 'rhythm' | 'melody';

const ModeContext = createContext<{
  mode: Mode;
  setMode: (mode: Mode) => void;
} | null>(null);

export const ModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // デフォルトでrhythmモードを使用
  const [mode, setMode] = useState<Mode>('rhythm');

  return (
    <ModeContext.Provider value={{ mode, setMode }}>
      {children}
    </ModeContext.Provider>
  );
};

// コンテキストを呼び出すカスタムフック。Provider外で使うとエラーを投げる
export const useMode = () => {
  const context = useContext(ModeContext);
  if (!context) {
    throw new Error('useMode must be used within a ModeProvider');
  }
  return context;
};
