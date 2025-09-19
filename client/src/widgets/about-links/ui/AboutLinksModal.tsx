// [UI] widgets/ui - AboutLinksModal.tsx
// 役割: About & Links 専用のガラス調モーダル（より白い背景）
import { Box, Text } from '@chakra-ui/react';
import { createPortal } from 'react-dom';

import { usePortalRoot } from '@/app/providers/PortalRootContext';
import { StyledArea } from '@shared/ui';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  widthPx?: number;
  heightPx?: number;
  title?: string;
  children: React.ReactNode;
};

export const AboutLinksModal = ({ isOpen, onClose, widthPx = 300, heightPx = 380, title = 'About & Links', children }: Props) => {
  const portalRoot = usePortalRoot();
  if (!isOpen) return null;
  return createPortal(
    <Box position="fixed" inset={0} zIndex={1200} display="grid" placeItems="center" bg="blackAlpha.600" onClick={onClose}>
      <Box width={`min(95vw, ${widthPx}px)`} onClick={(event) => event.stopPropagation()}>
        <StyledArea
          style={{
            padding: 16,
            width: '100%',
            display: 'block',
            // 固定高さ（必要な場合のみ適用）+ スクロール
            height: typeof heightPx === 'number' ? `${heightPx}px` : undefined,
            maxHeight: '90vh',
            overflowY: 'auto',
            // より白い背景に上書き
            background: 'rgba(255, 255, 255, 0.45)',
          }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Text fontWeight="bold" color={'white'}>{title}</Text>
            <button onClick={onClose} style={{ background: 'transparent', color: 'white', border: 'none', cursor: 'pointer' }}>Close</button>
          </Box>
          {children}
        </StyledArea>
      </Box>
    </Box>,
    portalRoot ?? document.body
  );
};
