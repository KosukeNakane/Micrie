import React, { createContext, useContext, useState } from 'react';

type RecordingUIContextType = {
  isDrawing: boolean;
  setIsDrawing: React.Dispatch<React.SetStateAction<boolean>>;
  isPlaying: boolean;
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
};

const RecordingUIContext = createContext<RecordingUIContextType | null>(null);

export const RecordingUIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  return (
    <RecordingUIContext.Provider value={{ isDrawing, setIsDrawing, isPlaying, setIsPlaying }}>
      {children}
    </RecordingUIContext.Provider>
  );
};

export const useRecordingUI = () => {
  const context = useContext(RecordingUIContext);
  if (!context) throw new Error('useRecordingUI must be used within a RecordingUIProvider');
  return context;
};
