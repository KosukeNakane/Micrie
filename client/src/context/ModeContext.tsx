// モード（rhythm / melody）の状態を管理するコンテキスト。
// 録音・再生処理において現在のモードを共有・更新できるようにする。

import React, { createContext, useContext, useState } from 'react';

export type Mode = 'rhythm' | 'melody';

const ModeContext = createContext<{
  mode: Mode;
  setMode: (mode: Mode) => void;
} | null>(null);

export const ModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 現在のモード（初期値は'melody'）をステートとして管理
  const [mode, setMode] = useState<Mode>('melody');

  // 子コンポーネントに mode と setMode を提供
  return (
    <ModeContext.Provider value={{ mode, setMode }}>
      {children}
    </ModeContext.Provider>
  );
};

export const useMode = () => {
  const context = useContext(ModeContext);
  if (!context) {
    throw new Error('useMode must be used within a ModeProvider');
  }
  return context;
};
