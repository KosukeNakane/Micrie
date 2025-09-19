// [UI] shared/ui - LoginRequiredModal.tsx
// 役割: 表示・入力のUIコンポーネント
import { Box, Button, Text } from "@chakra-ui/react";
import { createPortal } from "react-dom";

import { StyledArea } from "./StyledArea";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
  message?: string;
};

export const LoginRequiredModal = ({ isOpen, onClose, onLogin, message }: Props) => {
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
          width: 'min(92vw, 315px)',
          padding: '20px',
          margin: 0,
          display: 'block',
        }}
      >
        <Text fontSize="md" mb={4} color="white">
          {message ?? "この機能を使用するにはログインしてください。"}
        </Text>
        <Box display="flex" justifyContent="flex-end" gap={2}>
          <Button
            variant="ghost"
            onClick={onClose}
            color="white"
            _hover={{ bg: 'rgba(255, 255, 255, 0.1)' }}
          >キャンセル</Button>
          <Button
            bg="linear-gradient(135deg,rgba(49, 130, 206, 0.9),rgba(94, 153, 208, 0.9))"
            color="white"
            _hover={{ bg: 'linear-gradient(135deg,rgba(41, 109, 173, 0.9),rgba(71, 123, 172, 0.9))' }}
            onClick={onLogin}
          >ログイン</Button>
        </Box>
      </StyledArea>
    </Box>,
    document.body
  );
};
