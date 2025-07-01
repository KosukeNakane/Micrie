// ドラムやメロディのセグメント情報、ループ再生モード、録音対象などを管理するグローバルコンテキスト。
// 各種セグメント配列・AudioBuffer・録音モードなどを一元管理し、ループ再生や解析処理に用いる。

import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';

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
  updateMelodySegment: (index: number, newData: Partial<Segment>) => void;
  updateRhythmSegment: (index: number, newData: Partial<Segment>) => void;
  audioBuffers: {
    melody: AudioBuffer | null;
    rhythm: AudioBuffer | null;
  };
  setContextAudioBuffer: (mode: 'melody' | 'rhythm', buffer: AudioBuffer | null) => void;
  currentBuffer: AudioBuffer | null;
  recMode: 'melody' | 'rhythm';
  setRecMode: (mode: 'melody' | 'rhythm') => void;
};

const SegmentContext = createContext<SegmentContextType | undefined>(undefined);

export const SegmentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // ドラムセグメントを保持
  const [rhythmSegments, setRhythmSegments] = useState<Segment[]>([]);
  // メロディセグメントを保持
  const [melodySegments, setMelodySegments] = useState<Segment[]>([]);
  // 現在のループ再生モード（デフォルトは'melody'）
  const [loopMode, setLoopMode] = useState<'rhythm' | 'melody' | 'both'>('melody');

  const [melodyBuffer, setMelodyBuffer] = useState<AudioBuffer | null>(null);
  const [rhythmBuffer, setRhythmBuffer] = useState<AudioBuffer | null>(null);

  // 現在の録音モード（melody または rhythm）
  const [recMode, setRecMode] = useState<'melody' | 'rhythm'>('melody');

  // AudioBufferをセグメント種別に応じて保存
  const setContextAudioBuffer = (mode: 'melody' | 'rhythm', buffer: AudioBuffer | null) => {
    if (mode === 'melody') {
      setMelodyBuffer(buffer);
    } else {
      setRhythmBuffer(buffer);
    }
  };

  // 現在のループモードに対応するAudioBufferを返す
  const currentBuffer = useMemo(() => {
    if (loopMode === 'melody') return melodyBuffer;
    if (loopMode === 'rhythm') return rhythmBuffer;
    if (loopMode === 'both') return null;
    return null;
  }, [loopMode, melodyBuffer, rhythmBuffer]);

  // 現在のループモードに応じて、melody/rhythm どちらかのセグメント配列を空にする
  const currentSegments = useMemo(() => {
    return {
      rhythm: loopMode === 'melody' ? [] : rhythmSegments,
      melody: loopMode === 'rhythm' ? [] : melodySegments,
    };
  }, [loopMode, rhythmSegments, melodySegments]);

  // melodySegments の指定インデックスを更新
  const updateMelodySegment = (index: number, newData: Partial<Segment>) => {
    setMelodySegments(prev => {
      const newSegments = [...prev];
      newSegments[index] = { ...newSegments[index], ...newData };
      return newSegments;
    });
  };

  // rhythmSegments の指定インデックスを更新
  const updateRhythmSegment = (index: number, newData: Partial<Segment>) => {
    setRhythmSegments(prev => {
      const newSegments = [...prev];
      newSegments[index] = { ...newSegments[index], ...newData };
      return newSegments;
    });
  };

  // デバッグ用：loopMode, 各AudioBufferの状態、currentBufferをログ出力
  useEffect(() => {
    console.log("🎛 loopMode:", loopMode);
    console.log("🎧 melodyBuffer:", melodyBuffer);
    console.log("🥁 rhythmBuffer:", rhythmBuffer);
    console.log("📦 currentBuffer:", currentBuffer);
  }, [loopMode, melodyBuffer, rhythmBuffer, currentBuffer]);

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
        updateMelodySegment,
        updateRhythmSegment,
        audioBuffers: {
          melody: melodyBuffer,
          rhythm: rhythmBuffer,
        },
        setContextAudioBuffer,
        currentBuffer,
        recMode,
        setRecMode,
      }}
    >
      {children}
    </SegmentContext.Provider>
  );
};

export const useSegment = (): SegmentContextType => {
  const context = useContext(SegmentContext);
  if (!context) {
    throw new Error('useSegment must be used within a SegmentProvider');
  }
  return context;
};
