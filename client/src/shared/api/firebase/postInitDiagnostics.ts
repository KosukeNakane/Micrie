import { getApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

declare global {
  interface Window {
    __FIREBASE_POST_INIT_LOG_DONE__?: boolean;
  }
}

export function runFirebasePostInitDiagnosticsOnce() {
  try {
    // ブラウザのみ対象。SSR/ビルド時は何もしない
    if (typeof window === 'undefined') return;
    if (window.__FIREBASE_POST_INIT_LOG_DONE__) return;
    window.__FIREBASE_POST_INIT_LOG_DONE__ = true;

    // 実行は非同期で行い、呼び出し元のフローをブロックしない
    // 1) Firebase Web 設定値（ビルド後の実際の値）
     
    console.log('app.options:', getApp().options);

    // 2) 認証トークンの aud/iss を確認（サインイン後に1回だけ）
    const auth = getAuth();
    const unsub = onAuthStateChanged(auth, async (u) => {
      try {
        if (!u) {
           
          console.warn('Sign in first');
          return;
        }
        const token = await u.getIdToken(true); // 強制更新
        const payload = JSON.parse(atob(token.split('.')[1])); // JWTデコード
        const appPid = String(getApp().options.projectId || '');
         
        console.log('projectId:', appPid);
         
        console.log('aud      :', payload.aud);
         
        console.log('iss      :', payload.iss);
         
        console.log('MATCH?   :', appPid === payload.aud);
      } catch (e) {
         
        console.warn('[firebase] token inspect failed:', e);
      } finally {
        try { unsub(); } catch {}
      }
    });
  } catch {
    // noop
  }
}
