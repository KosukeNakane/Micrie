// [UI] widgets/ui - UserProfileModal.tsx
// 役割: 表示・入力のUIコンポーネント
import { Box, Button, Input, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { useAuthStore } from "@/entities/user";
import { updateDisplayName, linkCurrentUserWithProvider, linkCurrentUserWithPassword, unlinkCurrentUserProvider } from "@/features/auth";
import { SmallModal } from "@/shared/ui";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export const UserProfileModal = ({ isOpen, onClose }: Props) => {
  const { user } = useAuthStore();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [okOpen, setOkOpen] = useState<{open: boolean; message: string}>({open: false, message: ''});
  const [confirm, setConfirm] = useState<{ open: boolean; provider: 'google'|'github'|'password' | null }>(
    { open: false, provider: null }
  );

  // providerData は reload() によりインプレース更新される可能性があるため、
  // メモ化せず毎レンダーで評価して最新状態を反映する
  const providers = new Set((user?.providerData ?? []).map(p => p.providerId));
  const hasGoogle = providers.has('google.com');
  const hasGithub = providers.has('github.com');
  const hasPassword = providers.has('password');
  const methodCount = (hasGoogle ? 1 : 0) + (hasGithub ? 1 : 0) + (hasPassword ? 1 : 0);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    setName(user?.displayName ?? "");
    setError(null);
    setNewPassword("");
    setConfirmPassword("");
  }, [user, isOpen]);

  if (!isOpen || !user) return null;

  const handleSaveName = async () => {
    setError(null);
    setSaving(true);
    try {
      await updateDisplayName(name.trim());
    } catch {
      setError('ユーザーネームの更新に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const handleLinkProvider = async (provider: 'google' | 'github') => {
    setError(null);
    try {
      await linkCurrentUserWithProvider(provider);
      setOkOpen({ open: true, message: `${provider === 'google' ? 'Google' : 'GitHub'} をリンクしました` });
    } catch (e: any) {
      if (e?.message === 'emails_mismatch') {
        setError('リンク先のプロバイダのメールアドレスが一致しません');
      } else {
        setError('リンクに失敗しました。再度お試しください。');
      }
    }
  };

  const handleUnlinkProvider = async (provider: 'google' | 'github' | 'password') => {
    setError(null);
    try {
      await unlinkCurrentUserProvider(provider);
      const disp = provider === 'google' ? 'Google' : provider === 'github' ? 'GitHub' : 'Password';
      setOkOpen({ open: true, message: `${disp} のリンクを解除しました` });
    } catch (e: any) {
      if (e?.message === 'cannot_unlink_last_provider') {
        setError('最後のサインイン方法は解除できません');
      } else if (e?.code === 'auth/requires-recent-login') {
        setError('リンク解除には再ログインが必要です');
      } else {
        setError('リンク解除に失敗しました');
      }
    }
  };

  const handleAddPassword = async () => {
    setError(null);
    if (!user.email) { setError('メールアドレスが取得できません'); return; }
    // パスワード強度チェック: 8文字以上、英字と数字を含む
    const isStrong = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(newPassword);
    if (!isStrong) { setError('パスワードは8文字以上で英字と数字を含めてください'); return; }
    if (newPassword !== confirmPassword) { setError('パスワードが一致しません'); return; }
    try {
      await linkCurrentUserWithPassword(user.email, newPassword);
      setNewPassword(""); setConfirmPassword("");
      setOkOpen({ open: true, message: 'パスワードを追加しました' });
    } catch (e: any) {
      if (e?.message === 'emails_mismatch') {
        setError('メールアドレスが一致しないためパスワードを追加できません');
      } else {
        setError('パスワードの追加に失敗しました');
      }
    }
  };

  return createPortal(
    <Box position="fixed" inset={0} zIndex={1000}>
      <Box position="absolute" inset={0} bg="blackAlpha.600" onClick={onClose} />
      <Box
        position="absolute"
        left="50%"
        top="50%"
        transform="translate(-50%, -50%)"
        bg="white"
        borderRadius="md"
        boxShadow="xl"
        width="min(92vw, 540px)"
        p={5}
      >
        <Text fontSize="lg" fontWeight="bold" mb={4}>Account</Text>

        <Box mb={4}>
          <Text fontSize="sm" color="gray.600">Email</Text>
          <Text>{user.email ?? '-'}</Text>
        </Box>

        <Box mb={4}>
          <Text fontSize="sm" color="gray.600" mb={1}>Username</Text>
          <Box display="flex" gap={2}>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="your name" />
            <Button onClick={handleSaveName} disabled={saving}>Save</Button>
          </Box>
        </Box>

        <Box mb={2}>
          <Text fontSize="sm" color="gray.600">Linked methods</Text>
          <Box display="flex" gap={2} mt={1}>
            <Box as="span" px={2} py={0.5} borderRadius="md" bg={hasGoogle ? 'green.100' : 'blackAlpha.200'} color={hasGoogle ? 'green.800' : 'gray.700'}>
              Google
            </Box>
            <Box as="span" px={2} py={0.5} borderRadius="md" bg={hasGithub ? 'green.100' : 'blackAlpha.200'} color={hasGithub ? 'green.800' : 'gray.700'}>
              GitHub
            </Box>
            <Box as="span" px={2} py={0.5} borderRadius="md" bg={hasPassword ? 'green.100' : 'blackAlpha.200'} color={hasPassword ? 'green.800' : 'gray.700'}>
              Password
            </Box>
          </Box>
        </Box>

        <Box display="flex" gap={2} flexWrap="wrap" mb={3}>
          {!hasGoogle ? (
            <Button onClick={() => handleLinkProvider('google')}>Link Google</Button>
          ) : (
            <Button variant="outline" onClick={() => setConfirm({ open: true, provider: 'google' })} disabled={methodCount === 1}>Unlink Google</Button>
          )}
          {!hasGithub ? (
            <Button onClick={() => handleLinkProvider('github')}>Link GitHub</Button>
          ) : (
            <Button variant="outline" onClick={() => setConfirm({ open: true, provider: 'github' })} disabled={methodCount === 1}>Unlink GitHub</Button>
          )}
          {hasPassword && (
            <Button variant="outline" onClick={() => setConfirm({ open: true, provider: 'password' })} disabled={methodCount === 1}>Remove password</Button>
          )}
        </Box>

        {!hasPassword ? (
          <Box mt={2}>
            <Text fontSize="sm" color="gray.600" mb={1}>Add password</Text>
            <Box display="flex" flexDir="column" gap={2}>
              <Input type="password" placeholder="New password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
              <Input type="password" placeholder="Confirm password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
              <Box display="flex" justifyContent="flex-end">
                <Button onClick={handleAddPassword}>Add password</Button>
              </Box>
            </Box>
          </Box>
        ) : null}

        {error && <Text color="red.500" fontSize="sm" mt={3}>{error}</Text>}

        <Box display="flex" justifyContent="flex-end" mt={5}>
          <Button variant="ghost" onClick={onClose}>Close</Button>
        </Box>
      </Box>
      <SmallModal isOpen={okOpen.open} message={okOpen.message} onClose={() => setOkOpen({ open: false, message: '' })} />

      {confirm.open && (
        <Box position="fixed" inset={0} zIndex={1100}>
          <Box position="absolute" inset={0} bg="blackAlpha.600" onClick={() => setConfirm({ open: false, provider: null })} />
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
            <Text fontSize="md" fontWeight="bold" mb={3}>リンクを解除しますか？</Text>
            <Text fontSize="sm" color="gray.700" mb={4}>この操作はいつでも再度リンクできます。</Text>
            <Box display="flex" justifyContent="flex-end" gap={2}>
              <Button variant="ghost" onClick={() => setConfirm({ open: false, provider: null })}>キャンセル</Button>
              <Button colorPalette="red" onClick={async () => {
                const p = confirm.provider!;
                setConfirm({ open: false, provider: null });
                await handleUnlinkProvider(p);
              }}>解除する</Button>
            </Box>
          </Box>
        </Box>
      )}
    </Box>,
    document.body
  );
};
