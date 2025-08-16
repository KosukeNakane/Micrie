import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

type ScaleMode = 'major' | 'minor' | 'chromatic';

const ScaleModeContext = createContext<{ scaleMode: ScaleMode; setScaleMode: (mode: ScaleMode) => void } | null>(null);

export const ScaleModeProvider = ({ children }: { children: ReactNode }) => {
  const [scaleMode, setScaleMode] = useState<ScaleMode>('major');
  return <ScaleModeContext.Provider value={{ scaleMode, setScaleMode }}>{children}</ScaleModeContext.Provider>;
};

export const useScaleMode = () => {
  const context = useContext(ScaleModeContext);
  if (!context) throw new Error('useScaleMode must be used within a ScaleModeProvider');
  return context;
};
