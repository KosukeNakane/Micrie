// [State] entities/model - ModeContext.tsx
// 役割: グローバル/ローカル状態の保持・提供
import React, { createContext, useContext, useState } from 'react';

export type Mode = 'rhythm' | 'melody';

const ModeContext = createContext<{ mode: Mode; setMode: (mode: Mode) => void } | null>(null);

export const ModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<Mode>('melody');
  return <ModeContext.Provider value={{ mode, setMode }}>{children}</ModeContext.Provider>;
};

export const useMode = () => {
  const context = useContext(ModeContext);
  if (!context) throw new Error('useMode must be used within a ModeProvider');
  return context;
};
