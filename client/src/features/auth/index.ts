// [Model] features - index.ts
// 役割: ビジネスロジック/状態操作
export {
  signInWithEmailPassword,
  registerWithEmailPassword,
  signOut,
  signInWithGoogle,
  signInWithGithub,
  requestPasswordReset,
  updateDisplayName,
  startOAuthSignInWithLinking,
  linkAccountsWithPassword,
  linkAccountsWithProviders,
  getSignInMethods,
  addPasswordAfterProviderSignIn,
  linkCurrentUserWithProvider,
  linkCurrentUserWithPassword,
  unlinkCurrentUserProvider,
} from './model/api';
export type { OAuthProviderKey, AccountExistsLinkInfo } from './model/api';
export { useAuthUiStore, openLoginModal, closeLoginModal } from './model/uiStore';
