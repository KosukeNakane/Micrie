import { Box, Button, Text } from "@chakra-ui/react";
import { createPortal } from "react-dom";

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
        <Text fontSize="md" mb={4}>
          {message ?? "この機能を使用するにはログインしてください。"}
        </Text>
        <Box display="flex" justifyContent="flex-end" gap={2}>
          <Button variant="ghost" onClick={onClose}>キャンセル</Button>
          <Button colorPalette="blue" onClick={onLogin}>ログイン</Button>
        </Box>
      </Box>
    </Box>,
    document.body
  );
};

