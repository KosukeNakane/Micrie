// 録音UIの状態（再生ヘッド位置・描画中・再生中）を管理するコンテキスト
import React, { createContext, useContext, useState } from 'react';

type RecordingUIContextType = {
  playheadX: number;
  setPlayheadX: React.Dispatch<React.SetStateAction<number>>;
  isDrawing: boolean;
  setIsDrawing: React.Dispatch<React.SetStateAction<boolean>>;
  isPlaying: boolean;
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
};

const RecordingUIContext = createContext<RecordingUIContextType | null>(null);

export const RecordingUIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 再生ヘッドのx座標を管理するState
  const [playheadX, setPlayheadX] = useState(0);
  // 現在描画中かどうかを管理するState
  const [isDrawing, setIsDrawing] = useState(false);
  // 現在再生中かどうかを管理するState
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <RecordingUIContext.Provider value={{ playheadX, setPlayheadX, isDrawing, setIsDrawing, isPlaying, setIsPlaying }}>
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