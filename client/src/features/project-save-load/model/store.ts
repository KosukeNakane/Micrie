// [State] features/model - store.ts
// 役割: グローバル/ローカル状態の保持・提供
import { create } from "zustand";

type ProjectState = {
  currentProjectId: string | null;
  currentProjectName: string | null;
  lastSavedHash: string | null;
  setProject: (id: string | null, name: string) => void;
  setLastSavedHash: (hash: string | null) => void;
  clear: () => void;
};

export const useProjectState = create<ProjectState>((set) => ({
  currentProjectId: null,
  currentProjectName: null,
  lastSavedHash: null,
  setProject: (id, name) => set({ currentProjectId: id, currentProjectName: name }),
  setLastSavedHash: (hash) => set({ lastSavedHash: hash }),
  clear: () => set({ currentProjectId: null, currentProjectName: null, lastSavedHash: null }),
}));
