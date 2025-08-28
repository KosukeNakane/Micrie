import { create } from 'zustand';
import type { EffectKey } from '@/entities/effects/model/EffectsContext';

type EffectsUiState = {
  // 全体の HOLD（HOLD ALL）
  hold: boolean;
  setHold: (v: boolean) => void;
  toggleHold: () => void;

  // 各エフェクトごとの HOLD 状態
  holdByKey: Partial<Record<EffectKey, boolean>>;
  setHoldFor: (key: EffectKey, v: boolean) => void;
  toggleHoldFor: (key: EffectKey) => void;
};

export const useEffectsUiStore = create<EffectsUiState>((set) => ({
  hold: false,
  setHold: (v) => set(() => (v ? { hold: true } : { hold: false, holdByKey: {} })),
  toggleHold: () => set((s) => {
    const next = !s.hold;
    return next ? { hold: true } : { hold: false, holdByKey: {} };
  }),

  holdByKey: {},
  setHoldFor: (key, v) => set((s) => ({ holdByKey: { ...s.holdByKey, [key]: v } })),
  toggleHoldFor: (key) => set((s) => ({ holdByKey: { ...s.holdByKey, [key]: !s.holdByKey[key] } })),
}));
