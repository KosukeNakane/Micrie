// テンポ（BPM）の状態を管理するコンテキスト
import React, { createContext, useContext, useState } from 'react';

const TempoContext = createContext<{
  tempo: number;
  setTempo: (tempo: number) => void;
} | null>(null);

export const TempoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 初期値80でテンポ（BPM）を管理するState
  const [tempo, setTempo] = useState(80); 

  return (
    <TempoContext.Provider value={{ tempo, setTempo }}>
      {children}
    </TempoContext.Provider>
  );
};

// テンポコンテキストを取得するカスタムフック。Provider外ではエラーを投げる
export const useTempo = () => {
  const context = useContext(TempoContext);
  if (!context) {
    throw new Error('useTempo must be used within a TempoProvider');
  }
  return context;
};