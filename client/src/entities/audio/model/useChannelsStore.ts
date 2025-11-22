// [State] entities/model - useChannelsStore.ts
// 役割: グローバル/ローカル状態の保持・提供
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ChannelKind = 'melody' | 'drum' | 'chord' | 'sampler';

type ChannelsState = {
  melodyMuted: boolean;
  drumMuted: boolean;
  chordMuted: boolean;
  samplerMuted: boolean;
  masterMuted: boolean;
  melodyVolume: number; // 0..100
  drumVolume: number;   // 0..100
  chordVolume: number;  // 0..100
  samplerVolume: number; // 0..100
  setMuted: (kind: ChannelKind, muted: boolean) => void;
  toggleMuted: (kind: ChannelKind) => void;
  setVolume: (kind: ChannelKind, volume: number) => void;
  setMasterMuted: (muted: boolean) => void;
  toggleMasterMuted: () => void;
};

export const useChannelsStore = create<ChannelsState>()(
  persist(
    (set, get) => ({
      melodyMuted: false,
      drumMuted: false,
      chordMuted: false,
      samplerMuted: false,
      masterMuted: false,
      melodyVolume: 100,
      drumVolume: 100,
      chordVolume: 100,
      samplerVolume: 100,
      setMuted: (kind, muted) => {
        if (kind === 'melody') set({ melodyMuted: muted });
        else if (kind === 'drum') set({ drumMuted: muted });
        else if (kind === 'chord') set({ chordMuted: muted });
        else set({ samplerMuted: muted });
      },
      toggleMuted: (kind) => {
        const s = get();
        if (kind === 'melody') set({ melodyMuted: !s.melodyMuted });
        else if (kind === 'drum') set({ drumMuted: !s.drumMuted });
        else if (kind === 'chord') set({ chordMuted: !s.chordMuted });
        else set({ samplerMuted: !s.samplerMuted });
      },
      setVolume: (kind, volume) => {
        const v = Math.max(0, Math.min(100, Math.round(volume)));
        if (kind === 'melody') set({ melodyVolume: v });
        else if (kind === 'drum') set({ drumVolume: v });
        else if (kind === 'chord') set({ chordVolume: v });
        else set({ samplerVolume: v });
      },
      setMasterMuted: (muted) => set({ masterMuted: muted }),
      toggleMasterMuted: () => set((s) => ({ masterMuted: !s.masterMuted })),
    }),
    { name: 'micrie:channels' }
  )
);
