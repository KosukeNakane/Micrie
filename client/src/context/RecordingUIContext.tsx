// 録音UIの状態（描画中・再生中）を管理するコンテキスト。

import React, { createContext, useContext, useState } from 'react';

type RecordingUIContextType = {
  isDrawing: boolean;
  setIsDrawing: React.Dispatch<React.SetStateAction<boolean>>;
  isPlaying: boolean;
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
};

const RecordingUIContext = createContext<RecordingUIContextType | null>(null);

export const RecordingUIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 描画中かどうかの状態を管理
  const [isDrawing, setIsDrawing] = useState(false);
  // 再生中かどうかの状態を管理
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <RecordingUIContext.Provider value={{ isDrawing, setIsDrawing, isPlaying, setIsPlaying }}>
      {children}
    </RecordingUIContext.Provider>
  );
};

// 録音UIコンテキストを取得するカスタムフック。Provider外ではエラーを投げる
export const useRecordingUI = () => {
  const context = useContext(RecordingUIContext);
  if (!context) {
    throw new Error('useRecordingUI must be used within a RecordingUIProvider');
  }
  return context;
};