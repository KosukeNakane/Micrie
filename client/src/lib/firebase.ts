import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeFirestore, setLogLevel, getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { runFirebasePostInitDiagnosticsOnce } from '@/shared/api/firebase/postInitDiagnostics';

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = getApps().length ? getApp() : initializeApp(config);

// ノイズ抑制（必要に応じて 'debug' に変更）
setLogLevel('error');

let _db: Firestore;
try {
  _db = initializeFirestore(app, {
    experimentalForceLongPolling: true,
    experimentalAutoDetectLongPolling: true,
    experimentalLongPollingOptions: { timeoutSeconds: 10 },
    useFetchStreams: false,
  } as any);
} catch {
  // 既に Firestore が初期化されている場合は既存インスタンスを取得
  try {
    _db = getFirestore(app, 'default');
  } catch {
    _db = getFirestore(app);
  }
}

export const db = _db;

export const storage = getStorage(app);

// 開発時の軽いデバッグ出力
if (import.meta.env.DEV) {
  try {
    // eslint-disable-next-line no-console
    console.log('[firebase] storageBucket (app):', getApp().options.storageBucket);
  } catch {}
}

// 初期化後診断ログ（必ず1回のみ実行）
runFirebasePostInitDiagnosticsOnce();
