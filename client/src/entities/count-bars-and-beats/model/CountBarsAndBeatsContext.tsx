import React, { createContext, useContext, useState } from 'react';

type CountBarsAndBeatsContextType = {
  currentBar: number;
  setCurrentBar: (bar: number) => void;
  currentBeat: number;
  setCurrentBeat: (beat: number) => void;
};

const CountBarsAndBeatsContext = createContext<CountBarsAndBeatsContextType | undefined>(undefined);

export const CountBarsAndBeatsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentBar, setCurrentBar] = useState<number>(0);
  const [currentBeat, setCurrentBeat] = useState<number>(0);

  return (
    <CountBarsAndBeatsContext.Provider value={{ currentBar, setCurrentBar, currentBeat, setCurrentBeat }}>
      {children}
    </CountBarsAndBeatsContext.Provider>
  );
};

export const useCountBarsAndBeats = (): CountBarsAndBeatsContextType => {
  const context = useContext(CountBarsAndBeatsContext);
  if (!context) {
    throw new Error('useCountBarsAndBeats must be used within a CountBarsAndBeatsProvider');
  }
  return context;
};
