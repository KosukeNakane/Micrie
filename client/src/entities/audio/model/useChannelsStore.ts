import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ChannelKind = 'melody' | 'drum' | 'chord';

type ChannelsState = {
  melodyMuted: boolean;
  drumMuted: boolean;
  chordMuted: boolean;
  setMuted: (kind: ChannelKind, muted: boolean) => void;
  toggleMuted: (kind: ChannelKind) => void;
};

export const useChannelsStore = create<ChannelsState>()(
  persist(
    (set, get) => ({
      melodyMuted: false,
      drumMuted: false,
      chordMuted: false,
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
    }),
    { name: 'micrie:channels' }
  )
);

