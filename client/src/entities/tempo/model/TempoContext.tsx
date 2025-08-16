import React, { createContext, useContext, useState } from 'react';

const TempoContext = createContext<{ tempo: number; setTempo: (tempo: number) => void } | null>(null);

export const TempoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tempo, setTempo] = useState(90);
  return <TempoContext.Provider value={{ tempo, setTempo }}>{children}</TempoContext.Provider>;
};

export const useTempo = () => {
  const context = useContext(TempoContext);
  if (!context) throw new Error('useTempo must be used within a TempoProvider');
  return context;
};
