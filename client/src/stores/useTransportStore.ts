// /client/src/stores/useTransportStore.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

type TransportState = {
    isLoopPlaying: boolean;
    setLoopPlaying: (v: boolean) => void;
    toggleLoopPlaying: () => void;
};

export const useTransportStore = create<TransportState>()(
    devtools((set, get) => ({
        isLoopPlaying: false,
        setLoopPlaying: (v) => set({ isLoopPlaying: v }),
        toggleLoopPlaying: () => set({ isLoopPlaying: !get().isLoopPlaying }),
    }))
);