// 小節数（bar count）を管理するコンテキスト。
// 楽曲全体の長さや構造を制御するために、アプリ全体で小節数を共有・更新できるようにする。

import React, { createContext, useContext, useState } from 'react';

type BarCountContextType = {
  barCount: number;
  setBarCount: (barCount: number) => void;
};

const BarCountContext = createContext<BarCountContextType | undefined>(undefined);

export function BarCountProvider({children}:{ children : React.ReactNode
    }) { 
  // 小節数をステートとして保持（初期値は2）
  const [barCount, setBarCount] = useState(2);
  return (
    <BarCountContext.Provider value={{ barCount, setBarCount }}>
      {children}
    </BarCountContext.Provider>
  );
};

export const useBarCount = () => {
  const context = useContext(BarCountContext);
  // Provider 外で使われた場合にエラーをスロー
  if (!context) {
    throw new Error('useBarCount must be used within a BarCountProvider');
  }
  return context;
};