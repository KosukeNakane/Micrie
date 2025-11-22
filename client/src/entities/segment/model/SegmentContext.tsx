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
  loopMode: 'rhythm' | 'melody' | 'both';
  melodyBuffer: AudioBuffer | null;
  rhythmBuffer: AudioBuffer | null;
  recMode: 'melody' | 'rhythm';
  // 事前レンダリングした小節ごとの波形画像（dataURL）
  waveformByBar: Record<number, string>;
  setLoopMode: (mode: 'rhythm' | 'melody' | 'both') => void;
  setContextAudioBuffer: (mode: 'melody' | 'rhythm', buffer: AudioBuffer | null) => void;
  setRecMode: (mode: 'melody' | 'rhythm') => void;
  setWaveformForBar: (barIndex: number, dataUrl: string) => void;
  clearWaveforms: () => void;
};

export const useSegmentStore = create<StoreState>((set) => ({
  loopMode: 'melody',
  melodyBuffer: null,
  rhythmBuffer: null,
  recMode: 'melody',
  waveformByBar: {},
  setLoopMode: (mode) => set({ loopMode: mode }),
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
  return {
    loopMode: state.loopMode,
    setLoopMode: state.setLoopMode,
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
