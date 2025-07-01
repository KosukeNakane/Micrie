// コードパターン（pattern1〜pattern7）を管理するコンテキスト。
// 楽曲の構成を切り替えるために、選択されたコード進行パターンをグローバルに共有する。

import { createContext, useContext, useState } from 'react';

type ChordPattern = 'pattern1' | 'pattern2' | 'pattern3' | 'pattern4' | 'pattern5' | 'pattern6' | 'pattern7' ;

const ChordPatternContext = createContext<{
  chordPattern: ChordPattern;
  setChordPattern: (pattern: ChordPattern) => void;
} | null>(null);

export const ChordPatternProvider = ({ children }: { children: React.ReactNode }) => {
  // 現在のコードパターンを保持（初期値は 'pattern1'）
  const [chordPattern, setChordPattern] = useState<ChordPattern>('pattern1');
  return (
    <ChordPatternContext.Provider value={{ chordPattern, setChordPattern }}>
      {children}
    </ChordPatternContext.Provider>
  );
};

export const useChordPattern = () => {
  const context = useContext(ChordPatternContext);
  if (!context) throw new Error('useChordPattern must be used within ChordPatternProvider');
  return context;
};