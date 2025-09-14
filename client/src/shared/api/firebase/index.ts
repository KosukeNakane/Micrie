import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth, GoogleAuthProvider, GithubAuthProvider, setPersistence, browserLocalPersistence, getRedirectResult } from "firebase/auth";
import {
  getFirestore,
  initializeFirestore,
  setLogLevel,
  type Firestore,
} from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

import { runFirebasePostInitDiagnosticsOnce } from "@/shared/api/firebase/postInitDiagnostics";

let app: FirebaseApp | null = null;

export function getFirebaseApp(): FirebaseApp {
  if (app) return app;
  if (!getApps().length) {
    const cfg = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string | undefined,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string | undefined,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string | undefined,
      appId: import.meta.env.VITE_FIREBASE_APP_ID as string | undefined,
    } as const;
    app = initializeApp(cfg as any);
    // Firestore 接続周りの詳細ログ（開発時のみ）
    if (import.meta.env.DEV) {
      try {
        setLogLevel("debug");
        // 実際に使うプロジェクトID等を明示して混在を検知
         
        console.log("[firebase] projectId:", cfg.projectId, "appId:", cfg.appId);
        // 追加のデバッグ出力: storageBucket (env / 実アプリ)
         
        console.log("[firebase] storageBucket (cfg):", cfg.storageBucket);
        try {
           
          console.log("[firebase] storageBucket (app):", getApp().options.storageBucket);
        } catch {}
      } catch {
        // noop
      }
    }
    // 企業プロキシや一部ネットワークでのWebChannel問題に備え、
    // 自動長輪講（long-polling）検出を有効化（挙動・UIは不変）
    try {
      initializeFirestore(app, {
        // ネットワーク環境依存の WebChannel/Fetch ストリーミング問題を回避
        experimentalForceLongPolling: true,
        experimentalAutoDetectLongPolling: true,
        useFetchStreams: false,
        // experimentalLongPollingOptions: { timeoutSeconds: 30 },
      } as any);
    } catch {
      // 既に初期化済みの場合などは無視
    }
    // 初期化後診断ログ（1回だけ）
    runFirebasePostInitDiagnosticsOnce();
  } else {
    app = getApps()[0]!;
  }
  return app!;
}

export function getDb(): Firestore {
  try {
    return getFirestore(getFirebaseApp(), 'default');
  } catch {
    return getFirestore(getFirebaseApp());
  }
}

export function getStorageBucket(): FirebaseStorage {
  return getStorage(getFirebaseApp());
}

let _auth: Auth | null = null;
export async function getFirebaseAuth(): Promise<Auth> {
  if (_auth) return _auth;
  _auth = getAuth(getFirebaseApp());
  try {
    await setPersistence(_auth, browserLocalPersistence);
  } catch {}
  // リダイレクトサインイン結果の回収（ある場合のみ、失敗しても無視）
  try {
    await getRedirectResult(_auth);
  } catch {}
  return _auth;
}

export const providers = {
  google: () => new GoogleAuthProvider(),
  github: () => new GithubAuthProvider(),
};
