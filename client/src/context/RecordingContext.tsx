// 録音状態（録音中かどうか）を管理するコンテキスト。
// isRecording フラグをグローバルに共有し、録音の開始・停止状態を制御できる。

import React, { createContext, useContext, useState } from 'react';

const RecordingContext = createContext<{
  isRecording: boolean;
  setIsRecording: (val: boolean) => void;
} | null>(null);

export const RecordingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 録音中かどうかを判定するステート（初期値は false）
  const [isRecording, setIsRecording] = useState(false);
  return (
    <RecordingContext.Provider value={{ isRecording, setIsRecording }}>
      {children}
    </RecordingContext.Provider>
  );
};

export const useRecording = () => {
  const ctx = useContext(RecordingContext);
  // Provider の外で使われた場合にエラーをスローして利用を制限
  if (!ctx) throw new Error('useRecording must be used inside RecordingProvider');
  return ctx;
};