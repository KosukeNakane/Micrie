// [UI] shared/ui - ConfirmDeleteModal.tsx
// 役割: 表示・入力のUIコンポーネント
import { Box, Button, Text } from "@chakra-ui/react";
import { createPortal } from "react-dom";

import { usePortalRoot } from "@/app/providers/PortalRootContext";

import { StyledArea } from "./StyledArea";

type Props = {
  isOpen: boolean;
  projectName?: string | null;
  onCancel: () => void;
  onConfirm: () => void | Promise<void>;
};

export function ConfirmDeleteModal({ isOpen, projectName, onCancel, onConfirm }: Props) {
  const portalRoot = usePortalRoot();
  if (!isOpen) return null;
  const name = (projectName?.trim() ? projectName!.trim() : 'Untitled');
  const content = (
    <Box position="fixed" inset={0} zIndex={1100}>
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
        <Text fontSize="lg" fontWeight="bold" mb={2} color="white">削除の確認</Text>
        <Text fontSize="sm" color="white" mb={4}>{name} を削除しますか？</Text>
        <Box display="flex" justifyContent="flex-end" gap={2}>
          <Button
            variant="ghost"
            onClick={onCancel}
            color="white"
            _hover={{ bg: 'rgba(255, 255, 255, 0.1)' }}
          >キャンセル</Button>
          <Button
            bg="linear-gradient(135deg, rgba(226, 86, 86, 0.9), rgba(235, 116, 116, 0.9))"
            color="white"
            _hover={{ bg: 'linear-gradient(135deg, rgba(206, 76, 76, 0.9), rgba(215, 96, 96, 0.9))' }}
            onClick={onConfirm}
          >削除する</Button>
        </Box>
      </StyledArea>
    </Box>
  );
  return createPortal(content, portalRoot ?? document.body);
}
