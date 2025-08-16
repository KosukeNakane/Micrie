import React, { createContext, useContext, useState } from 'react';

type BarCountContextType = {
  barCount: number;
  setBarCount: (barCount: number) => void;
};

const BarCountContext = createContext<BarCountContextType | undefined>(undefined);

export function BarCountProvider({ children }: { children: React.ReactNode }) {
  const [barCount, setBarCount] = useState(2);
  return (
    <BarCountContext.Provider value={{ barCount, setBarCount }}>
      {children}
    </BarCountContext.Provider>
  );
}

export const useBarCount = () => {
  const context = useContext(BarCountContext);
  if (!context) {
    throw new Error('useBarCount must be used within a BarCountProvider');
  }
  return context;
};
