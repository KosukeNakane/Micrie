import { create } from "zustand";

type ProjectState = {
  currentProjectId: string | null;
  currentProjectName: string | null;
  setProject: (id: string, name: string) => void;
  clear: () => void;
};

export const useProjectState = create<ProjectState>((set) => ({
  currentProjectId: null,
  currentProjectName: null,
  setProject: (id, name) => set({ currentProjectId: id, currentProjectName: name }),
  clear: () => set({ currentProjectId: null, currentProjectName: null }),
}));

