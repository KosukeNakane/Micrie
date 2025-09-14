import { Box, Button, Input, Text } from "@chakra-ui/react";
import { useState } from "react";
import { createPortal } from "react-dom";

import {
  startOAuthSignInWithLinking,
  linkAccountsWithPassword,
  linkAccountsWithProviders,
} from '@/features/auth';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (payload: { email: string; password: string }) => void;
  onRegister?: (payload: { email: string; password: string; username: string }) => void;
  onForgotPassword?: (email: string) => void;
  onOAuth?: {
    google?: () => Promise<unknown> | void;
    github?: () => Promise<unknown> | void;
  };
};

export const LoginModal = ({ isOpen, onClose, onSubmit, onRegister, onForgotPassword, onOAuth }: Props) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [linkInfo, setLinkInfo] = useState<
    { email: string; methods: string[]; attempted: 'google' | 'github'; pendingCredential: any } | null
  >(null);
  // signup時の未入力ハイライト制御
  const [showValidation, setShowValidation] = useState(false);

  const isValidEmail = (v: string) => /^(?:[a-zA-Z0-9_'^&\/+-])+(?:\.(?:[a-zA-Z0-9_'^&\/+-])+)*@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/.test(v);
  const isStrongPassword = (v: string) => /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(v);

  const parseAuthError = (e: unknown): string => {
    // FirebaseError であれば code を使用
    const code = (e as any)?.code as string | undefined;
    if (code === 'auth/email-already-in-use' || code === 'auth/account-exists-with-different-credential') {
      return 'すでにアカウントが存在しています。ログインしてください。';
    }
    return mode === 'signup' ? '登録に失敗しました' : 'ログインに失敗しました';
  };

  const handleSubmit = async () => {
    setError(null);
    if (mode === 'signup') {
      setShowValidation(true);
      const missingUsername = !username.trim();
      const missingEmail = !email.trim();
      const missingPassword = !password.trim();
      const missingConfirm = !passwordConfirm.trim();
      if (missingUsername || missingEmail || missingPassword || missingConfirm) {
        setError('未入力の項目があります');
        return;
      }
      if (!isValidEmail(email)) {
        setError('メールアドレスの形式が正しくありません');
        return;
      }
      if (!isStrongPassword(password)) {
        setError('パスワードは8文字以上で英字と数字を含めてください');
        return;
      }
      if (!username.trim()) {
        setError('ユーザーネームを入力してください');
        return;
      }
      if (password !== passwordConfirm) {
        setError('パスワードが一致しません');
        return;
      }
      try {
        await onRegister?.({ email, password, username: username.trim() });
        onClose();
      } catch (e: any) {
        setError(parseAuthError(e));
      }
      return;
    }
    try {
      await onSubmit?.({ email, password });
      onClose();
    } catch (e) {
      setError(parseAuthError(e));
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <Box position="fixed" inset={0} zIndex={1000}>
      {/* Overlay */}
      <Box position="absolute" inset={0} bg="blackAlpha.600" onClick={onClose} />
      {/* Content */}
      <Box
        position="absolute"
        left="50%"
        top="50%"
        transform="translate(-50%, -50%)"
        bg="white"
        borderRadius="md"
        boxShadow="xl"
        width="min(92vw, 420px)"
        p={5}
      >
        <Text fontSize="lg" fontWeight="bold" mb={4}>
          {mode === 'login' ? 'Login' : 'Create account'}
        </Text>
        <Box display="flex" flexDir="column" gap={3}>
          {mode === 'signup' && (
            <Box>
              <Text fontSize="sm" mb={1}>Username</Text>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="your name"
                borderColor={showValidation && !username.trim() ? 'red.500' : undefined}
              />
            </Box>
          )}
          <Box>
            <Text fontSize="sm" mb={1}>
              Email
            </Text>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              borderColor={mode==='signup' && showValidation && (!email.trim() || !isValidEmail(email)) ? 'red.500' : undefined}
            />
          </Box>
          <Box>
            <Text fontSize="sm" mb={1}>
              Password
            </Text>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              borderColor={mode==='signup' && showValidation && (!password.trim() || !isStrongPassword(password)) ? 'red.500' : undefined}
            />
          </Box>
          {mode === 'signup' && (
            <Box>
              <Text fontSize="sm" mb={1}>Confirm Password</Text>
              <Input
                type="password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                placeholder="••••••••"
                borderColor={showValidation && (!passwordConfirm.trim() || passwordConfirm !== password) ? 'red.500' : undefined}
              />
            </Box>
          )}
        </Box>
        {error && (
          <Text color="red.500" fontSize="sm" mt={2}>{error}</Text>
        )}
        <Box display="flex" justifyContent="space-between" alignItems="center" mt={4}>
          {mode === 'login' ? (
            <Button variant="plain" colorPalette="blue" onClick={() => email && onForgotPassword?.(email)}>
              Forgot password?
            </Button>
          ) : (
            <Button variant="plain" colorPalette="blue" onClick={() => setMode('login')}>
              Have an account? Log in
            </Button>
          )}
          <Box display="flex" gap={2}>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button colorPalette="blue" onClick={handleSubmit}>
              {mode === 'login' ? 'Login' : 'Sign up'}
            </Button>
          </Box>
        </Box>

        {mode === 'login' && (
          <Box mt={2}>
            <Button variant="plain" colorPalette="blue" onClick={() => setMode('signup')}>
              Create an account
            </Button>
          </Box>
        )}

        {/* OAuth */}
        <Box mt={4} display="flex" flexDir="column" gap={2}>
          <Text fontSize="sm" color="gray.600">Or continue with</Text>
          <Box display="flex" flexWrap="wrap" gap={2}>
            {onOAuth?.google && (
              <Button onClick={async () => {
                setError(null);
                const res = await startOAuthSignInWithLinking('google');
                if ((res as any).ok) { onClose(); return; }
                const { link } = res as any;
                setLinkInfo(link);
                if (link.email) setEmail(link.email);
                setError('すでにアカウントが存在しています。ログインしてリンクできます。');
              }}>Google</Button>
            )}
            {onOAuth?.github && (
              <Button onClick={async () => {
                setError(null);
                const res = await startOAuthSignInWithLinking('github');
                if ((res as any).ok) { onClose(); return; }
                const { link } = res as any;
                setLinkInfo(link);
                if (link.email) setEmail(link.email);
                setError('すでにアカウントが存在しています。ログインしてリンクできます。');
              }}>GitHub</Button>
            )}
          </Box>
        </Box>

        {/* サインアップ時の既存メールのリンク誘導 UI は削除（仕様変更） */}

        {linkInfo && (
          <Box mt={4} p={3} borderWidth="1px" borderRadius="md" bg="whiteAlpha.700">
            <Text fontSize="sm" fontWeight="bold" mb={2}>アカウントのリンク</Text>
            <Text fontSize="sm" mb={2}>同じメールの既存アカウントが見つかりました。次のいずれかでリンクできます。</Text>
            {linkInfo.methods.includes('password') && (
              <Box display="flex" alignItems="center" gap={2} mt={2}>
                <Input
                  type="password"
                  placeholder="既存アカウントのパスワード"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Button onClick={async () => {
                  setError(null);
                  try {
                    await linkAccountsWithPassword(linkInfo.email, password, linkInfo.pendingCredential);
                    onClose();
                  } catch (e) {
                    setError('リンクに失敗しました。パスワードを確認してください。');
                  }
                }}>パスワードでリンク</Button>
              </Box>
            )}
            <Box display="flex" gap={2} mt={3} flexWrap="wrap">
              {linkInfo.methods.includes('google.com') && linkInfo.attempted !== 'google' && (
                <Button onClick={async () => {
                  setError(null);
                  try { await linkAccountsWithProviders('google', linkInfo.attempted); onClose(); }
                  catch (e: any) {
                    if (e?.message === 'emails_mismatch') setError('Googleのメールアドレスが一致しないためリンクできません');
                    else setError('Googleアカウントとのリンクに失敗しました');
                  }
                }}>Googleでリンク</Button>
              )}
              {linkInfo.methods.includes('github.com') && linkInfo.attempted !== 'github' && (
                <Button onClick={async () => {
                  setError(null);
                  try { await linkAccountsWithProviders('github', linkInfo.attempted); onClose(); }
                  catch (e: any) {
                    if (e?.message === 'emails_mismatch') setError('GitHubのメールアドレスが一致しないためリンクできません');
                    else setError('GitHubアカウントとのリンクに失敗しました');
                  }
                }}>GitHubでリンク</Button>
              )}
            </Box>
          </Box>
        )}
      </Box>
    </Box>,
    document.body
  );
};
