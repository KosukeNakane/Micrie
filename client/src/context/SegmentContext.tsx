// ドラムやメロディのセグメント情報とループモードを管理するコンテキスト
import React, { createContext, useContext, useState, useMemo } from 'react';

export type Segment = {
  label: string;
  start: number;
  end: number;
  hz?: number;
  note?: string;
  confidence?: number;
  rms?: number;
  confidence_rms?: number;
};

type SegmentContextType = {
  rhythmSegments: Segment[];
  melodySegments: Segment[];
  loopMode: 'rhythm' | 'melody' | 'both';
  setRhythmSegments: (segments: Segment[]) => void;
  setMelodySegments: (segments: Segment[]) => void;
  setLoopMode: (mode: 'rhythm' | 'melody' | 'both') => void;
  currentSegments: { rhythm: Segment[]; melody: Segment[] };
};

const SegmentContext = createContext<SegmentContextType | undefined>(undefined);

export const SegmentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // ドラムセグメントのリストを保持するState
  const [rhythmSegments, setRhythmSegments] = useState<Segment[]>([]);
  // メロディセグメントのリストを保持するState
  const [melodySegments, setMelodySegments] = useState<Segment[]>([]);
  // 現在のループモードを保持するState
  const [loopMode, setLoopMode] = useState<'rhythm' | 'melody' | 'both'>('rhythm');

  // ループモードに応じて現在使用するセグメントを切り替える
  const currentSegments = useMemo(() => {
    return {
      rhythm: loopMode === 'melody' ? [] : rhythmSegments,
      melody: loopMode === 'rhythm' ? [] : melodySegments,
    };
  }, [loopMode, rhythmSegments, melodySegments]);

  return (
    <SegmentContext.Provider
      value={{
        rhythmSegments,
        melodySegments,
        loopMode,
        setRhythmSegments,
        setMelodySegments,
        setLoopMode,
        currentSegments,
      }}
    >
      {children}
    </SegmentContext.Provider>
  );
};

// SegmentContext を取得するカスタムフック。Provider外ではエラーを投げる
export const useSegment = (): SegmentContextType => {
  const context = useContext(SegmentContext);
  if (!context) {
    throw new Error('useSegment must be used within a SegmentProvider');
  }
  return context;
};