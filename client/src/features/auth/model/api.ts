import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  signInWithPopup,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  fetchSignInMethodsForEmail,
  linkWithCredential,
  linkWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
  type OAuthCredential,
  EmailAuthProvider,
  unlink,
} from 'firebase/auth';

import { useAuthStore } from '@/entities/user';
import { getFirebaseAuth, providers } from '@/shared/api/firebase';

export const signInWithEmailPassword = async (email: string, password: string) => {
  const auth = await getFirebaseAuth();
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
};

export const registerWithEmailPassword = async (email: string, password: string, displayName?: string) => {
  const auth = await getFirebaseAuth();
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  if (displayName) {
    try {
      await updateProfile(cred.user, { displayName });
      useAuthStore.getState().set({ user: cred.user });
    } catch {}
  }
  // 任意: メール認証を送る
  try { await sendEmailVerification(cred.user); } catch {}
  return cred.user;
};

export const signOut = async () => {
  const auth = await getFirebaseAuth();
  await fbSignOut(auth);
};

export const signInWithGoogle = async () => {
  const auth = await getFirebaseAuth();
  const userCred = await signInWithPopup(auth, providers.google());
  return userCred.user;
};

export const signInWithGithub = async () => {
  const auth = await getFirebaseAuth();
  const userCred = await signInWithPopup(auth, providers.github());
  return userCred.user;
};

export const requestPasswordReset = async (email: string) => {
  const auth = await getFirebaseAuth();
  await sendPasswordResetEmail(auth, email);
};

export const updateDisplayName = async (displayName: string) => {
  const auth = await getFirebaseAuth();
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');
  await updateProfile(user, { displayName });
  useAuthStore.getState().set({ user });
  return user;
};

export type OAuthProviderKey = 'google' | 'github';
export type AccountExistsLinkInfo = {
  email: string;
  methods: string[];
  attempted: OAuthProviderKey;
  pendingCredential: OAuthCredential | null;
};

export const startOAuthSignInWithLinking = async (
  attempted: OAuthProviderKey
): Promise<{ ok: true } | { ok: false; link: AccountExistsLinkInfo }> => {
  const auth = await getFirebaseAuth();
  try {
    await signInWithPopup(auth, providers[attempted]());
    return { ok: true };
  } catch (e: any) {
    if (e?.code === 'auth/account-exists-with-different-credential') {
      const email: string | undefined = e?.customData?.email;
      const methods = email ? await fetchSignInMethodsForEmail(auth, email) : [];
      const pendingCredential = attempted === 'google'
        ? GoogleAuthProvider.credentialFromError(e)
        : GithubAuthProvider.credentialFromError(e);
      return {
        ok: false,
        link: {
          email: email ?? '',
          methods,
          attempted,
          pendingCredential: pendingCredential ?? null,
        },
      };
    }
    throw e;
  }
};

export const linkAccountsWithPassword = async (
  email: string,
  password: string,
  pendingCredential: OAuthCredential | null
) => {
  const auth = await getFirebaseAuth();
  // 既存の方法（password）でログイン
  const cred = await signInWithEmailAndPassword(auth, email, password);
  // 新しいプロバイダをリンク
  if (pendingCredential) {
    await linkWithCredential(cred.user, pendingCredential);
    // 最新の providerData を反映させるためリロードし、ストアを更新
    try { await auth.currentUser?.reload(); } catch {}
    useAuthStore.getState().set({ user: auth.currentUser });
  }
  return auth.currentUser;
};

export const linkAccountsWithProviders = async (
  existing: OAuthProviderKey,
  newProvider: OAuthProviderKey
) => {
  const auth = await getFirebaseAuth();
  // 既存のプロバイダでログイン
  await signInWithPopup(auth, providers[existing]());
  // 新しいプロバイダをリンク（ポップアップで再認証）
  if (!auth.currentUser) throw new Error('Not authenticated');
  await linkWithPopup(auth.currentUser, providers[newProvider]());
  // メール一致チェック（provider 側のメールが取得できる場合のみ）
  const linkedInfo = (auth.currentUser.providerData || []).find((p) => p.providerId === `${newProvider}.com`);
  const linkedEmail = linkedInfo?.email as string | undefined;
  const currentEmail = auth.currentUser.email as string | undefined;
  if (linkedEmail && currentEmail && linkedEmail !== currentEmail) {
    // 即時にアンリンクして整合性を保つ
    await unlink(auth.currentUser, `${newProvider}.com`);
    throw new Error('emails_mismatch');
  }
  try { await auth.currentUser.reload(); } catch {}
  // 状態更新（成功）
  useAuthStore.getState().set({ user: auth.currentUser });
  return auth.currentUser;
};

export const getSignInMethods = async (email: string) => {
  const auth = await getFirebaseAuth();
  return fetchSignInMethodsForEmail(auth, email);
};

export const addPasswordAfterProviderSignIn = async (
  provider: OAuthProviderKey,
  email: string,
  password: string
) => {
  const auth = await getFirebaseAuth();
  // 既存のプロバイダでサインイン
  await signInWithPopup(auth, providers[provider]());
  if (!auth.currentUser) throw new Error('Not authenticated');
  // メール一致チェック
  if (!auth.currentUser.email || auth.currentUser.email !== email) {
    throw new Error('emails_mismatch');
  }
  // Email/Password をリンク
  const credential = EmailAuthProvider.credential(email, password);
  await linkWithCredential(auth.currentUser, credential);
  try { await auth.currentUser.reload(); } catch {}
  useAuthStore.getState().set({ user: auth.currentUser });
  return auth.currentUser;
};

export const linkCurrentUserWithProvider = async (
  provider: OAuthProviderKey
) => {
  const auth = await getFirebaseAuth();
  if (!auth.currentUser) throw new Error('Not authenticated');
  await linkWithPopup(auth.currentUser, providers[provider]());
  // メール一致チェック（provider 側のメールが取得できる場合のみ）
  const linkedInfo = (auth.currentUser.providerData || []).find((p) => p.providerId === `${provider}.com`);
  const linkedEmail = linkedInfo?.email as string | undefined;
  const currentEmail = auth.currentUser.email as string | undefined;
  if (linkedEmail && currentEmail && linkedEmail !== currentEmail) {
    await unlink(auth.currentUser, `${provider}.com`);
    throw new Error('emails_mismatch');
  }
  try { await auth.currentUser.reload(); } catch {}
  useAuthStore.getState().set({ user: auth.currentUser });
  return auth.currentUser;
};

export const linkCurrentUserWithPassword = async (
  email: string,
  password: string
) => {
  const auth = await getFirebaseAuth();
  if (!auth.currentUser) throw new Error('Not authenticated');
  if (!auth.currentUser.email || auth.currentUser.email !== email) {
    throw new Error('emails_mismatch');
  }
  const credential = EmailAuthProvider.credential(email, password);
  await linkWithCredential(auth.currentUser, credential);
  try { await auth.currentUser.reload(); } catch {}
  useAuthStore.getState().set({ user: auth.currentUser });
  return auth.currentUser;
};

export const unlinkCurrentUserProvider = async (
  provider: 'google' | 'github' | 'password'
) => {
  const auth = await getFirebaseAuth();
  if (!auth.currentUser) throw new Error('Not authenticated');
  const currentProviders = auth.currentUser.providerData ?? [];
  if (currentProviders.length <= 1) {
    // 最後のサインイン方法は解除不可
    throw new Error('cannot_unlink_last_provider');
  }
  const providerId = provider === 'google' ? 'google.com' : provider === 'github' ? 'github.com' : 'password';
  await unlink(auth.currentUser, providerId);
  try { await auth.currentUser.reload(); } catch {}
  useAuthStore.getState().set({ user: auth.currentUser });
  return auth.currentUser;
};
