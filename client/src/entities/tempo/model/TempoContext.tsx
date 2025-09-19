// [State] entities/model - TempoContext.tsx
// 役割: グローバル/ローカル状態の保持・提供
import React, { createContext, useContext, useState } from 'react';

export const TEMPO_MIN = 20;
export const TEMPO_MAX = 160;

const TempoContext = createContext<{ tempo: number; setTempo: (tempo: number) => void } | null>(null);

export const TempoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tempo, setTempoState] = useState(90);

  const clamp = (v: number) => Math.min(TEMPO_MAX, Math.max(TEMPO_MIN, v));
  const setTempo = (v: number) => setTempoState(clamp(v));

  return <TempoContext.Provider value={{ tempo, setTempo }}>{children}</TempoContext.Provider>;
};

export const useTempo = () => {
  const context = useContext(TempoContext);
  if (!context) throw new Error('useTempo must be used within a TempoProvider');
  return context;
};
