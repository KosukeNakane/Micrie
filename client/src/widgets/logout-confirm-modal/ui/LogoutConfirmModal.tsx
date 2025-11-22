// [UI] widgets/logout-confirm-modal/ui/LogoutConfirmModal.tsx
import { Box, Button, Text } from "@chakra-ui/react";

import { GlassModal } from "@shared/ui";

import { signOut } from "@/features/auth"; // signOut 関数をインポート

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export function LogoutConfirmModal({ isOpen, onClose }: Props) {
  if (!isOpen) return null;
  return (
    <GlassModal isOpen={isOpen} onClose={onClose} title="ログアウトしますか？" widthPx={420}>
      <Text fontSize="sm" color="rgba(255, 255, 255, 0.7)" mb={4}>作業内容の保存を確認してください。</Text>
      <Box display="flex" justifyContent="flex-end" gap={2}>
        <Button variant="ghost" onClick={onClose} color="white" _hover={{ bg: 'rgba(255, 255, 255, 0.1)' }}>キャンセル</Button>
        <Button
          bg="linear-gradient(135deg, rgba(226, 86, 86, 0.9), rgba(235, 116, 116, 0.9))"
          color="white"
          _hover={{ bg: 'linear-gradient(135deg, rgba(206, 76, 76, 0.9), rgba(215, 96, 96, 0.9))' }}
          onClick={async () => { onClose(); try { await signOut(); } catch (e) { console.error(e); } }}
        >ログアウト</Button>
      </Box>
    </GlassModal>
  );
}
