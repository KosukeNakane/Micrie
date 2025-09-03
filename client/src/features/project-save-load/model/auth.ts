import { getFirebaseAuth } from "@/shared/api/firebase";
import { GoogleAuthProvider, signInWithPopup, signInWithRedirect, signInAnonymously } from "firebase/auth";

export async function ensureAuth(): Promise<string> {
  const auth = await getFirebaseAuth();
  if (import.meta.env.DEV) console.log('[save] ensureAuth: start, currentUser?', !!auth.currentUser);
  if (auth.currentUser) return auth.currentUser.uid;
  const provider = new GoogleAuthProvider();
  try {
    if (import.meta.env.DEV) console.log('[save] ensureAuth: trying signInWithPopup');
    const cred = await signInWithPopup(auth, provider);
    if (import.meta.env.DEV) console.log('[save] ensureAuth: popup success');
    return cred.user.uid;
  } catch (e: any) {
    const code = String(e?.code || e?.message || e);
    const popupIssues = [
      'auth/popup-blocked',
      'auth/popup-closed-by-user',
      'auth/cancelled-popup-request',
      'auth/operation-not-supported-in-this-environment',
    ];
    if (popupIssues.some((k) => code.includes(k))) {
      if (import.meta.env.DEV) console.warn('[save] ensureAuth: popup failed -> redirect fallback', code);
      await signInWithRedirect(auth, provider);
      throw new Error('REDIRECTING_FOR_AUTH');
    }
    // 最後の手段: 匿名認証（コンソールで Anonymous を有効化してください）
    try {
      if (import.meta.env.DEV) console.warn('[save] ensureAuth: trying anonymous sign-in');
      const anon = await signInAnonymously(auth);
      if (import.meta.env.DEV) console.log('[save] ensureAuth: anonymous success');
      return anon.user.uid;
    } catch (anonErr) {
      if (import.meta.env.DEV) console.error('[save] ensureAuth: anonymous failed', anonErr);
      throw e;
    }
  }
}
