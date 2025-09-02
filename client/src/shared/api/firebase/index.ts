import { initializeApp, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  type Auth,
  browserLocalPersistence,
  setPersistence,
  GoogleAuthProvider,
  GithubAuthProvider,
} from 'firebase/auth';
import { getFirebaseEnvConfig } from '@/shared/config/firebase';

let appInstance: FirebaseApp | null = null;
let authInstance: Auth | null = null;

export const getFirebaseApp = (): FirebaseApp => {
  if (!appInstance) {
    appInstance = initializeApp(getFirebaseEnvConfig());
  }
  return appInstance;
};

export const getFirebaseAuth = async (): Promise<Auth> => {
  if (!authInstance) {
    const app = getFirebaseApp();
    const auth = getAuth(app);
    await setPersistence(auth, browserLocalPersistence);
    authInstance = auth;
  }
  return authInstance;
};

// OAuth Providers
export const providers = {
  google: () => new GoogleAuthProvider(),
  github: () => new GithubAuthProvider(),
};
