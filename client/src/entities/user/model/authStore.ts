import { onAuthStateChanged, type User } from 'firebase/auth';
import { useEffect } from 'react';
import { create } from 'zustand';

import { getFirebaseAuth } from '@/shared/api/firebase';

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

type AuthState = {
  status: AuthStatus;
  user: User | null;
  set: (patch: Partial<Pick<AuthState, 'status' | 'user'>>) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  status: 'loading',
  user: null,
  set: (patch) => set(patch),
}));

export const AuthStateListener = () => {
  useEffect(() => {
    let unsub = () => {};
    (async () => {
      const auth = await getFirebaseAuth();
      unsub = onAuthStateChanged(auth, (user) => {
        useAuthStore.getState().set({
          status: user ? 'authenticated' : 'unauthenticated',
          user: user ?? null,
        });
      });
    })();
    return () => unsub();
  }, []);
  return null;
};

export const getDisplayName = (u: User | null | undefined) => {
  if (!u) return '';
  return u.displayName || u.email || u.uid.substring(0, 8);
};

