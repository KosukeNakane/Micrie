import { Box, Button, Text } from "@chakra-ui/react";
import { createPortal } from "react-dom";

type Props = {
  isOpen: boolean;
  projectName?: string | null;
  onSaveAndContinue: () => void | Promise<void>;
  onDiscardAndContinue: () => void;
  onCancel: () => void;
};

export function ConfirmUnsavedChangesModal({ isOpen, projectName, onSaveAndContinue, onDiscardAndContinue, onCancel }: Props) {
  if (!isOpen) return null;
  const name = (projectName?.trim() ? projectName!.trim() : 'Untitled');
  const content = (
    <Box position="fixed" inset={0} zIndex={1000}>
      <Box position="absolute" inset={0} bg="blackAlpha.600" onClick={onCancel} />
      <Box position="absolute" left="50%" top="50%" transform="translate(-50%, -50%)" bg="white" borderRadius="md" boxShadow="xl" width="min(92vw, 520px)" p={5}>
        <Text fontSize="lg" fontWeight="bold" mb={2}>変更を保存しますか？</Text>
        <Text fontSize="sm" color="gray.700" mb={4}>{name} への変更を保存しますか？</Text>
        <Box display="flex" justifyContent="flex-end" gap={2}>
          <Button variant="outline" onClick={onCancel}>キャンセル</Button>
          <Button colorPalette="gray" variant="subtle" onClick={onDiscardAndContinue}>保存しない</Button>
          <Button colorPalette="blue" onClick={onSaveAndContinue}>保存して続行</Button>
        </Box>
      </Box>
    </Box>
  );
  return createPortal(content, document.body);
}

