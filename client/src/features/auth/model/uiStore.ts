import { create } from 'zustand';

type AuthUiState = {
  loginOpen: boolean;
  setLoginOpen: (open: boolean) => void;
};

export const useAuthUiStore = create<AuthUiState>((set) => ({
  loginOpen: false,
  setLoginOpen: (open) => set({ loginOpen: open }),
}));

export function openLoginModal() {
  try {
    useAuthUiStore.getState().setLoginOpen(true);
  } catch {}
}

export function closeLoginModal() {
  try {
    useAuthUiStore.getState().setLoginOpen(false);
  } catch {}
}

