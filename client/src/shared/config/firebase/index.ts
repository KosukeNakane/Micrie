// [Config] shared - index.ts
// 役割: 設定/ビルド関連
export interface FirebaseEnvConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId: string;
}

export const getFirebaseEnvConfig = (): FirebaseEnvConfig => {
  const env = import.meta.env as any;
  const cfg: FirebaseEnvConfig = {
    apiKey: env.VITE_FIREBASE_API_KEY,
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: env.VITE_FIREBASE_APP_ID,
  };
  if (!cfg.apiKey || !cfg.authDomain || !cfg.projectId || !cfg.appId) {
    // 足りない場合でもビルドは通すが、実行時に明確化
    console.warn('[firebase] Missing env. Check VITE_FIREBASE_* variables.');
  }
  return cfg;
};

