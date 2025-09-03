import { getFirebaseAuth } from "@/shared/api/firebase";

export async function ensureAuth(): Promise<string> {
  const auth = await getFirebaseAuth();
  if (import.meta.env.DEV) console.log('[保存処理] 認証確認: 開始。現在サインイン中?', !!auth.currentUser);
  if (auth.currentUser) return auth.currentUser.uid;
  // 変更: ポップアップ/リダイレクトは行わず、呼び出し元にモーダル表示を委ねる
  throw new Error('OPEN_LOGIN_MODAL');
}
