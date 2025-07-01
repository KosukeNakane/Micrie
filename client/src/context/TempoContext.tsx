// テンポ（BPM）の状態を管理するコンテキスト
// グローバルにテンポの取得・更新を可能にするためのProviderとHookを提供する

import React, { createContext, useContext, useState } from 'react';

const TempoContext = createContext<{
  tempo: number;
  setTempo: (tempo: number) => void;
} | null>(null);

export const TempoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 初期テンポは90。グローバルで管理される
  const [tempo, setTempo] = useState(90); 

  return (
    <TempoContext.Provider value={{ tempo, setTempo }}>
      {children}
    </TempoContext.Provider>
  );
};

export const useTempo = () => {
  const context = useContext(TempoContext);
  if (!context) {
    throw new Error('useTempo must be used within a TempoProvider');
  }
  return context;
};