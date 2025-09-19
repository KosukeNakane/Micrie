// [Model] entities/audio - useAudioStore.ts
import { create } from 'zustand';

type AudioBlobSource = 'uploaded' | 'recorded' | null;

interface AudioState {
  audioBlob: Blob | null;
  audioBlobSource: AudioBlobSource;
  setAudioBlob: (blob: Blob | null, source?: AudioBlobSource) => void;
  clearAudioBlob: () => void;
}

export const useAudioStore = create<AudioState>((set) => ({
  audioBlob: null,
  audioBlobSource: null,
  setAudioBlob: (blob, source = null) => set({ audioBlob: blob, audioBlobSource: source }),
  clearAudioBlob: () => set({ audioBlob: null, audioBlobSource: null }),
}));
