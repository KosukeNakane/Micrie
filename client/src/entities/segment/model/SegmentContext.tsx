// [State] entities/model - SegmentContext.tsx
// 役割: グローバル/ローカル状態の保持・提供
import React from 'react';
import { create } from 'zustand';

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

type StoreState = {
  rhythmSegments: Segment[];
  melodySegments: Segment[];
  loopMode: 'rhythm' | 'melody' | 'both';
  melodyBuffer: AudioBuffer | null;
  rhythmBuffer: AudioBuffer | null;
  recMode: 'melody' | 'rhythm';
  // 事前レンダリングした小節ごとの波形画像（dataURL）
  waveformByBar: Record<number, string>;
  setRhythmSegments: (segments: Segment[]) => void;
  setMelodySegments: (segments: Segment[]) => void;
  setLoopMode: (mode: 'rhythm' | 'melody' | 'both') => void;
  updateMelodySegment: (index: number, newData: Partial<Segment>) => void;
  updateRhythmSegment: (index: number, newData: Partial<Segment>) => void;
  setContextAudioBuffer: (mode: 'melody' | 'rhythm', buffer: AudioBuffer | null) => void;
  setRecMode: (mode: 'melody' | 'rhythm') => void;
  setWaveformForBar: (barIndex: number, dataUrl: string) => void;
  clearWaveforms: () => void;
};

export const useSegmentStore = create<StoreState>((set) => ({
  rhythmSegments: [],
  melodySegments: [],
  loopMode: 'melody',
  melodyBuffer: null,
  rhythmBuffer: null,
  recMode: 'melody',
  waveformByBar: {},
  setRhythmSegments: (segments) => set({ rhythmSegments: segments }),
  setMelodySegments: (segments) => set({ melodySegments: segments }),
  setLoopMode: (mode) => set({ loopMode: mode }),
  updateMelodySegment: (index, newData) => set((s) => {
    const next = [...s.melodySegments];
    next[index] = { ...next[index], ...newData } as Segment;
    return { melodySegments: next };
  }),
  updateRhythmSegment: (index, newData) => set((s) => {
    const next = [...s.rhythmSegments];
    next[index] = { ...next[index], ...newData } as Segment;
    return { rhythmSegments: next };
  }),
  setContextAudioBuffer: (mode, buffer) => set((s) => ({
    melodyBuffer: mode === 'melody' ? buffer : s.melodyBuffer,
    rhythmBuffer: mode === 'rhythm' ? buffer : s.rhythmBuffer,
  })),
  setRecMode: (mode) => set({ recMode: mode }),
  setWaveformForBar: (barIndex, dataUrl) => set((s) => ({ waveformByBar: { ...s.waveformByBar, [barIndex]: dataUrl } })),
  clearWaveforms: () => set({ waveformByBar: {} }),
}));

// 互換の Provider（保持のために残すが、Zustand でグローバル保持するため実態はただのパススルー）
export const SegmentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => <>{children}</>;

// 互換の Hook: 既存の SegmentContextType 互換のオブジェクトを返す
export const useSegment = () => {
  const state = useSegmentStore();
  const currentBuffer = state.loopMode === 'melody' ? state.melodyBuffer
    : state.loopMode === 'rhythm' ? state.rhythmBuffer : null;
  const currentSegments = {
    rhythm: state.loopMode === 'melody' ? [] : state.rhythmSegments,
    melody: state.loopMode === 'rhythm' ? [] : state.melodySegments,
  };
  return {
    rhythmSegments: state.rhythmSegments,
    melodySegments: state.melodySegments,
    loopMode: state.loopMode,
    setRhythmSegments: state.setRhythmSegments,
    setMelodySegments: state.setMelodySegments,
    setLoopMode: state.setLoopMode,
    currentSegments,
    updateMelodySegment: state.updateMelodySegment,
    updateRhythmSegment: state.updateRhythmSegment,
    audioBuffers: { melody: state.melodyBuffer, rhythm: state.rhythmBuffer },
    setContextAudioBuffer: state.setContextAudioBuffer,
    currentBuffer,
    recMode: state.recMode,
    setRecMode: state.setRecMode,
    waveformByBar: state.waveformByBar,
    setWaveformForBar: state.setWaveformForBar,
    clearWaveforms: state.clearWaveforms,
  } as const;
};
