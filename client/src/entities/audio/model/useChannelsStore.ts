// [State] entities/model - useChannelsStore.ts
// 役割: グローバル/ローカル状態の保持・提供
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ChannelKind = 'melody' | 'drum' | 'chord';

type ChannelsState = {
  melodyMuted: boolean;
  drumMuted: boolean;
  chordMuted: boolean;
  masterMuted: boolean;
  melodyVolume: number; // 0..100
  drumVolume: number;   // 0..100
  chordVolume: number;  // 0..100
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
      masterMuted: false,
      melodyVolume: 100,
      drumVolume: 100,
      chordVolume: 100,
      setMuted: (kind, muted) => {
        if (kind === 'melody') set({ melodyMuted: muted });
        else if (kind === 'drum') set({ drumMuted: muted });
        else set({ chordMuted: muted });
      },
      toggleMuted: (kind) => {
        const s = get();
        if (kind === 'melody') set({ melodyMuted: !s.melodyMuted });
        else if (kind === 'drum') set({ drumMuted: !s.drumMuted });
        else set({ chordMuted: !s.chordMuted });
      },
      setVolume: (kind, volume) => {
        const v = Math.max(0, Math.min(100, Math.round(volume)));
        if (kind === 'melody') set({ melodyVolume: v });
        else if (kind === 'drum') set({ drumVolume: v });
        else set({ chordVolume: v });
      },
      setMasterMuted: (muted) => set({ masterMuted: muted }),
      toggleMasterMuted: () => set((s) => ({ masterMuted: !s.masterMuted })),
    }),
    { name: 'micrie:channels' }
  )
);
