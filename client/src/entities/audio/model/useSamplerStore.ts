// [State] entities/model - useSamplerStore.ts
// 役割: サンプラーパッドの録音データをグローバルに保持
import { create } from 'zustand';

export type SamplerPadStatus = 'empty' | 'recording' | 'ready' | 'error';

export type SamplerPad = {
  status: SamplerPadStatus;
  buffer: AudioBuffer | null;
  blob: Blob | null;
  error?: string;
  updatedAt?: number;
};

export const SAMPLER_PAD_COUNT = 10;

const createInitialPad = (): SamplerPad => ({
  status: 'empty',
  buffer: null,
  blob: null,
  error: undefined,
  updatedAt: undefined,
});

type SamplerState = {
  pads: SamplerPad[];
  setPad: (index: number, updater: (prev: SamplerPad) => SamplerPad) => void;
  resetPad: (index: number) => void;
  clearAll: () => void;
};

export const useSamplerStore = create<SamplerState>((set) => ({
  pads: Array.from({ length: SAMPLER_PAD_COUNT }, () => createInitialPad()),
  setPad: (index, updater) => set((state) => {
    if (index < 0 || index >= state.pads.length) return state;
    const next = state.pads.slice();
    next[index] = updater(next[index]);
    return { pads: next };
  }),
  resetPad: (index) => set((state) => {
    if (index < 0 || index >= state.pads.length) return state;
    const next = state.pads.slice();
    next[index] = createInitialPad();
    return { pads: next };
  }),
  clearAll: () => set({ pads: Array.from({ length: SAMPLER_PAD_COUNT }, () => createInitialPad()) }),
}));

