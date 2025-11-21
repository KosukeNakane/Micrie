// [UI] shared/ui - GlassModal.tsx
// 役割: ガラス風の共通モーダルコンテナ（オーバーレイ + StyledArea）
import { Box, Button, Text } from '@chakra-ui/react';
import React from 'react';
import { createPortal } from 'react-dom';

import { usePortalRoot } from '@/app/providers/PortalRootContext';

import { StyledArea } from './StyledArea';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  widthPx?: number; // コンテンツ最大幅（px）
  children: React.ReactNode;
};

export const GlassModal = ({ isOpen, onClose, title, widthPx = 960, children }: Props) => {
  const portalRoot = usePortalRoot();
  if (!isOpen) return null;
  const content = (
    <Box position="fixed" inset={0} zIndex={1200}>
      <Box position="absolute" inset={0} bg="blackAlpha.600" onClick={onClose} />
      <Box position="absolute" left="50%" top="50%" transform="translate(-50%, -50%)" width={`min(95vw, ${widthPx}px)`}>
        <StyledArea style={{ padding: 16, width: '100%', display: 'block' }}>
          {title && (
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Text fontWeight="bold" color="white">{title}</Text>
              <Button variant="ghost" onClick={onClose} color="white">Close</Button>
            </Box>
          )}
          {children}
        </StyledArea>
      </Box>
    </Box>
  );
  return createPortal(content, portalRoot ?? document.body);
};
