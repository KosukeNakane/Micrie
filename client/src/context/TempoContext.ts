import { createContext } from 'react';

//Context作成 Hooks(useState)用の変数の型を指定
export const TempoContext = createContext<{
  tempo: number;
  setTempo: (tempo: number) => void;
} | null>(null);