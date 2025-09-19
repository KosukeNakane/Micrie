// [State] entities/model - RecordingContext.tsx
// 役割: グローバル/ローカル状態の保持・提供
import React, { createContext, useContext, useState } from 'react';

const RecordingContext = createContext<{ isRecording: boolean; setIsRecording: (val: boolean) => void } | null>(null);

export const RecordingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isRecording, setIsRecording] = useState(false);
  return <RecordingContext.Provider value={{ isRecording, setIsRecording }}>{children}</RecordingContext.Provider>;
};

export const useRecording = () => {
  const ctx = useContext(RecordingContext);
  if (!ctx) throw new Error('useRecording must be used inside RecordingProvider');
  return ctx;
};
