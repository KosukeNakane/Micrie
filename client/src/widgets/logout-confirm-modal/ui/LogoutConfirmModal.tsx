// [UI] widgets/logout-confirm-modal/ui/LogoutConfirmModal.tsx
import { Box, Button, Text } from "@chakra-ui/react";
import { createPortal } from "react-dom";

import { StyledArea } from "@/shared/ui/StyledArea";
import { signOut } from "@/features/auth"; // signOut 関数をインポート

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export function LogoutConfirmModal({ isOpen, onClose }: Props) {
  if (!isOpen) return null;

  return createPortal(
    <Box position="fixed" inset={0} zIndex={1100}>
      <Box position="absolute" inset={0} bg="blackAlpha.600" onClick={onClose} />
      <StyledArea
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'min(92vw, 420px)',
          padding: '20px',
          margin: 0,
          display: 'block',
        }}
      >
        <Text fontSize="md" fontWeight="bold" mb={3} color="white">ログアウトしますか？</Text>
        <Text fontSize="sm" color="rgba(255, 255, 255, 0.7)" mb={4}>作業内容の保存を確認してください。</Text>
        <Box display="flex" justifyContent="flex-end" gap={2}>
          <Button
            variant="ghost"
            onClick={onClose}
            color="white"
            _hover={{ bg: 'rgba(255, 255, 255, 0.1)' }}
          >キャンセル</Button>
          <Button
            bg="linear-gradient(135deg, rgba(226, 86, 86, 0.9), rgba(235, 116, 116, 0.9))"
            color="white"
            _hover={{ bg: 'linear-gradient(135deg, rgba(206, 76, 76, 0.9), rgba(215, 96, 96, 0.9))' }}
            onClick={async () => {
              onClose();
              try { await signOut(); } catch (e) { console.error(e); }
            }}
          >ログアウト</Button>
        </Box>
      </StyledArea>
    </Box>,
    document.body
  );
}
