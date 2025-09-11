import { Box, Button, Text } from "@chakra-ui/react";
import { createPortal } from "react-dom";

type Props = {
  isOpen: boolean;
  projectName?: string | null;
  onCancel: () => void;
  onConfirm: () => void | Promise<void>;
};

export function ConfirmDeleteModal({ isOpen, projectName, onCancel, onConfirm }: Props) {
  if (!isOpen) return null;
  const name = (projectName?.trim() ? projectName!.trim() : 'Untitled');
  const content = (
    <Box position="fixed" inset={0} zIndex={1100}>
      <Box position="absolute" inset={0} bg="blackAlpha.600" onClick={onCancel} />
      <Box position="absolute" left="50%" top="50%" transform="translate(-50%, -50%)" bg="white" borderRadius="md" boxShadow="xl" width="min(92vw, 390px)" p={5}>
        <Text fontSize="lg" fontWeight="bold" mb={2}>削除の確認</Text>
        <Text fontSize="sm" color="gray.700" mb={4}>{name} を削除しますか？</Text>
        <Box display="flex" justifyContent="flex-end" gap={2}>
          <Button variant="outline" onClick={onCancel}>キャンセル</Button>
          <Button colorPalette="red" onClick={onConfirm}>削除する</Button>
        </Box>
      </Box>
    </Box>
  );
  return createPortal(content, document.body);
}
