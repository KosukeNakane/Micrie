// 小節数と拍数を管理するコンテキスト。
// 楽曲の現在位置を把握し、再生・録音などの同期制御に用いる。

import React, { createContext, useContext, useState } from 'react';

type CountBarsAndBeatsContextType = {
  currentBar: number;
  setCurrentBar: (bar: number) => void;
  currentBeat: number;
  setCurrentBeat: (beat: number) => void;
};

const CountBarsAndBeatsContext = createContext<CountBarsAndBeatsContextType | undefined>(undefined);

export const CountBarsAndBeatsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 現在の小節数を保持（初期値は0）
  const [currentBar, setCurrentBar] = useState<number>(0);
  // 現在の拍数を保持（初期値は0）
  const [currentBeat, setCurrentBeat] = useState<number>(0);

  return (
    <CountBarsAndBeatsContext.Provider value={{ currentBar, setCurrentBar, currentBeat, setCurrentBeat }}>
      {children}
    </CountBarsAndBeatsContext.Provider>
  );
};

export const useCountBarsAndBeats = (): CountBarsAndBeatsContextType => {
  const context = useContext(CountBarsAndBeatsContext);
  if (!context) {
    throw new Error('useCountBarsAndBeats must be used within a CountBarsAndBeatsProvider');
  }
  return context;
};
