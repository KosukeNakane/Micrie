// 録音状態（録音中かどうか）を管理するコンテキスト
import React, { createContext, useContext, useState } from 'react';

const RecordingContext = createContext<{
  isRecording: boolean;
  setIsRecording: (val: boolean) => void;
} | null>(null);

export const RecordingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 録音中かどうかの状態を管理するステート
  const [isRecording, setIsRecording] = useState(false);
  return (
    <RecordingContext.Provider value={{ isRecording, setIsRecording }}>
      {children}
    </RecordingContext.Provider>
  );
};

// 録音状態コンテキストを取得するカスタムフック。Provider外ではエラーを投げる
export const useRecording = () => {
  const ctx = useContext(RecordingContext);
  if (!ctx) throw new Error('useRecording must be used inside RecordingProvider');
  return ctx;
};