// ドラムパターン（basic / hiphop / funk など）を管理するコンテキスト。
// アプリ全体で現在のドラムスタイルを共有・更新するために使用する。

import { createContext, useContext, useState } from 'react';

type DrumPattern = 'basic' | 'hiphop' | 'funk' | 'rock' | 'jazz' | 'electro';

const DrumPatternContext = createContext<{
  drumPattern: DrumPattern;
  setDrumPattern: (pattern: DrumPattern) => void;
} | null>(null);

export const DrumPatternProvider = ({ children }: { children: React.ReactNode }) => {
  // ドラムパターンの状態を管理（初期値は 'basic'）
  const [drumPattern, setDrumPattern] = useState<DrumPattern>('basic');
  return (
    <DrumPatternContext.Provider value={{ drumPattern, setDrumPattern }}>
      {children}
    </DrumPatternContext.Provider>
  );
};

export const useDrumPattern = () => {
  const context = useContext(DrumPatternContext);
  // コンテキストが未定義（Provider外で使用）ならエラーをスロー
  if (!context) throw new Error('useDrumPattern must be used within DrumPatternProvider');
  return context;
};