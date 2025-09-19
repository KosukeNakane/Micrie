// [UI] widgets/ui - LoginModal.tsx
// 役割: 表示・入力のUIコンポーネント
import { Box, Button, Input, Text } from "@chakra-ui/react";
import { useState } from "react";

import {
  startOAuthSignInWithLinking,
  linkAccountsWithPassword,
  linkAccountsWithProviders,
} from '@/features/auth';
import { GlassModal } from "@shared/ui";

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

  const isValidEmail = (v: string) => /^(?:[a-zA-Z0-9_\'\'^&\/+-])+(?:\.(?:[a-zA-Z0-9_\'\'^&\/+-])+)*@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/.test(v);
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

  const inputStyles = {
    bg: "rgba(255, 255, 255, 0.1)",
    borderColor: "rgba(255, 255, 255, 0.3)",
    color: "white",
    _placeholder: { color: 'rgba(255, 255, 255, 0.5)' },
  };

  return (
    <GlassModal isOpen={isOpen} onClose={onClose} title={mode === 'login' ? 'Login' : 'Create account'} widthPx={420}>
        <Box display="flex" flexDir="column" gap={3}>
          {mode === 'signup' && (
            <Box>
              <Text fontSize="sm" mb={1} color="white">Username</Text>
              {(() => {
                const borderColor = showValidation && !username.trim() ? 'red.500' : inputStyles.borderColor;
                return (
                  <Input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="your name"
                    {...inputStyles}
                    borderColor={borderColor}
                  />
                );
              })()}
            </Box>
          )}
          <Box>
            <Text fontSize="sm" mb={1} color="white">
              Email
            </Text>
            {(() => {
              const borderColor = (mode==='signup' && showValidation && (!email.trim() || !isValidEmail(email))) ? 'red.500' : inputStyles.borderColor;
              return (
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  {...inputStyles}
                  borderColor={borderColor}
                />
              );
            })()}
          </Box>
          <Box>
            <Text fontSize="sm" mb={1} color="white">
              Password
            </Text>
            {(() => {
              const borderColor = (mode==='signup' && showValidation && (!password.trim() || !isStrongPassword(password))) ? 'red.500' : inputStyles.borderColor;
              return (
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  {...inputStyles}
                  borderColor={borderColor}
                />
              );
            })()}
          </Box>
          {mode === 'signup' && (
            <Box>
              <Text fontSize="sm" mb={1} color="white">Confirm Password</Text>
              {(() => {
                const borderColor = (showValidation && (!passwordConfirm.trim() || passwordConfirm !== password)) ? 'red.500' : inputStyles.borderColor;
                return (
                  <Input
                    type="password"
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    placeholder="••••••••"
                    {...inputStyles}
                    borderColor={borderColor}
                  />
                );
              })()}
            </Box>
          )}
        </Box>
        {error && (
          <Text color="red.300" fontSize="sm" mt={2}>{error}</Text>
        )}
        <Box display="flex" justifyContent="space-between" alignItems="center" mt={4}>
          {mode === 'login' ? (
            <Button
              variant="ghost"
              bg="transparent"
              px={0}
              color="rgba(255, 255, 255, 0.7)"
              _hover={{ bg: 'transparent', textDecoration: 'underline' }}
              onClick={() => email && onForgotPassword?.(email)}
            >
              Forgot password?
            </Button>
          ) : (
            <Button
              variant="ghost"
              bg="transparent"
              px={0}
              color="rgba(255, 255, 255, 0.7)"
              _hover={{ bg: 'transparent', textDecoration: 'underline' }}
              onClick={() => setMode('login')}
            > 
              Have an account? Log in
            </Button>
          )}
          <Box display="flex" gap={2}>
            <Button
              variant="ghost"
              onClick={onClose}
              color="white"
              _hover={{ bg: 'rgba(255, 255, 255, 0.1)' }}
            >
              Cancel
            </Button>
            <Button
              bg="transparent"
              color="white"
              _hover={{ bg: 'rgba(255, 255, 255, 0.1)' }}
              borderColor="rgba(255, 255, 255, 0.3)"
              onClick={handleSubmit}
            >
              {mode === 'login' ? 'Login' : 'Sign up'}
            </Button>
          </Box>
        </Box>

        {mode === 'login' && (
          <Box mt={2}>
            <Button
              variant="ghost"
              bg="transparent"
              px={0}
              color="rgba(255, 255, 255, 0.7)"
              _hover={{ bg: 'transparent', textDecoration: 'underline' }}
              onClick={() => setMode('signup')}
            > 
              Create an account
            </Button>
          </Box>
        )}

        {/* OAuth */}
        <Box mt={4} display="flex" flexDir="column" gap={2}>
          <Text fontSize="sm" color="rgba(255, 255, 255, 0.6)">Or continue with</Text>
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
              }}
              bg={'linear-gradient(135deg,rgba(49, 130, 206, 0.9),rgba(94, 153, 208, 0.9))'}
              color={'white'}
              _hover={{
                bg: 'linear-gradient(135deg,rgba(41, 109, 173, 0.9),rgba(71, 123, 172, 0.9))',
              }}
              >Google</Button>
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
              }}
              bg={'linear-gradient(135deg,rgba(56, 161, 105, 0.8),rgba(71, 184, 124, 0.8))'}
              color={'white'}
              _hover={{
                bg: 'linear-gradient(135deg,rgba(44, 136, 87, 0.8),rgba(58, 161, 106, 0.8))',
              }}
              >GitHub</Button>
            )}
          </Box>
        </Box>

        {/* サインアップ時の既存メールのリンク誘導 UI は削除（仕様変更） */}

        {linkInfo && (
          <Box mt={4} p={3} borderWidth="1px" borderRadius="md" bg="rgba(0,0,0,0.1)">
            <Text fontSize="sm" fontWeight="bold" mb={2} color="white">アカウントのリンク</Text>
            <Text fontSize="sm" mb={2} color="white">同じメールの既存アカウントが見つかりました。次のいずれかでリンクできます。</Text>
            {linkInfo.methods.includes('password') && (
              <Box display="flex" alignItems="center" gap={2} mt={2}>
                <Input
                  type="password"
                  placeholder="既存アカウントのパスワード"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  {...inputStyles}
                />
                <Button onClick={async () => {
                  setError(null);
                  try {
                    await linkAccountsWithPassword(linkInfo.email, password, linkInfo.pendingCredential);
                    onClose();
                  } catch (e) {
                    setError('リンクに失敗しました。パスワードを確認してください。');
                  }
                }}
                  bg="transparent"
                  color="white"
                  _hover={{ bg: 'rgba(255, 255, 255, 0.1)' }}
                  borderColor="rgba(255, 255, 255, 0.3)"
                >パスワードでリンク</Button>
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
                }}
                bg={'linear-gradient(135deg,rgba(49, 130, 206, 0.9),rgba(94, 153, 208, 0.9))'}
                color={'white'}
                _hover={{
                  bg: 'linear-gradient(135deg,rgba(41, 109, 173, 0.9),rgba(71, 123, 172, 0.9))',
                }}
                >Googleでリンク</Button>
              )}
              {linkInfo.methods.includes('github.com') && linkInfo.attempted !== 'github' && (
                <Button onClick={async () => {
                  setError(null);
                  try { await linkAccountsWithProviders('github', linkInfo.attempted); onClose(); } 
                  catch (e: any) {
                    if (e?.message === 'emails_mismatch') setError('GitHubのメールアドレスが一致しないためリンクできません');
                    else setError('GitHubアカウントとのリンクに失敗しました');
                  }
                }}
                bg={'linear-gradient(135deg,rgba(56, 161, 105, 0.8),rgba(71, 184, 124, 0.8))'}
                color={'white'}
                _hover={{
                  bg: 'linear-gradient(135deg,rgba(44, 136, 87, 0.8),rgba(58, 161, 106, 0.8))',
                }}
                >GitHubでリンク</Button>
              )}
            </Box>
          </Box>
        )}
    </GlassModal>
  );
};
