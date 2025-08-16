import { createContext, useContext, useState } from 'react';

type DrumPattern = 'basic' | 'hiphop' | 'funk' | 'rock' | 'jazz' | 'electro';

const DrumPatternContext = createContext<{
  drumPattern: DrumPattern;
  setDrumPattern: (pattern: DrumPattern) => void;
} | null>(null);

export const DrumPatternProvider = ({ children }: { children: React.ReactNode }) => {
  const [drumPattern, setDrumPattern] = useState<DrumPattern>('basic');
  return (
    <DrumPatternContext.Provider value={{ drumPattern, setDrumPattern }}>
      {children}
    </DrumPatternContext.Provider>
  );
};

export const useDrumPattern = () => {
  const context = useContext(DrumPatternContext);
  if (!context) throw new Error('useDrumPattern must be used within DrumPatternProvider');
  return context;
};
