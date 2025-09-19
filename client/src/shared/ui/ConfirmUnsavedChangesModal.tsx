// [UI] shared/ui - ConfirmUnsavedChangesModal.tsx
// 役割: 表示・入力のUIコンポーネント
import { Box, Button, Text } from "@chakra-ui/react";
import { createPortal } from "react-dom";

import { usePortalRoot } from "@/app/providers/PortalRootContext";

import { StyledArea } from "./StyledArea";

type Props = {
  isOpen: boolean;
  projectName?: string | null;
  onSaveAndContinue: () => void | Promise<void>;
  onDiscardAndContinue: () => void;
  onCancel: () => void;
};

export function ConfirmUnsavedChangesModal({ isOpen, projectName, onSaveAndContinue, onDiscardAndContinue, onCancel }: Props) {
  const portalRoot = usePortalRoot();
  if (!isOpen) return null;
  const name = (projectName?.trim() ? projectName!.trim() : 'Untitled');
  const content = (
    <Box position="fixed" inset={0} zIndex={1000}>
      <Box position="absolute" inset={0} bg="blackAlpha.600" onClick={onCancel} />
      <StyledArea
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'min(92vw, 390px)',
          padding: '20px',
          margin: 0,
          display: 'block',
        }}
      >
        <Text fontSize="lg" fontWeight="bold" mb={2} color="white">変更を保存しますか？</Text>
        <Text fontSize="sm" color="white" mb={4}>{name} への変更を保存しますか？</Text>
        <Box display="flex" justifyContent="flex-end" gap={2}>
          <Button
            variant="ghost"
            onClick={onCancel}
            border={'1px solid rgba(255, 255, 255, 0.3)'}
            color="white"
            _hover={{ bg: 'rgba(255, 255, 255, 0.1)' }}
          >Cancel</Button>
          <Button
            bg="transparent"
            border={'1px solid rgba(255, 255, 255, 0.3)'}
            color="white"
            _hover={{ bg: 'rgba(255, 255, 255, 0.1)' }}
            onClick={onDiscardAndContinue}
          >保存しない</Button>
          <Button
            bg='linear-gradient(135deg,rgba(41, 109, 173, 0.9),rgba(71, 123, 172, 0.9))'
            border={'1px solid rgba(255, 255, 255, 0.3)'}
            color="white"
            _hover={{ bg: 'linear-gradient(135deg,rgba(41, 109, 173, 0.9),rgba(71, 123, 172, 0.9))' }}
            onClick={onSaveAndContinue}
          >保存して続行</Button>
        </Box>
      </StyledArea>
    </Box>
  );
  return createPortal(content, portalRoot ?? document.body);
}
