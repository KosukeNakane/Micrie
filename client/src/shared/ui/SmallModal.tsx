// [UI] shared/ui - SmallModal.tsx
// 役割: 表示・入力のUIコンポーネント
import { Box, Button, Text } from '@chakra-ui/react';
import { createPortal } from 'react-dom';

import { StyledArea } from './StyledArea';

type Props = {
  isOpen: boolean;
  title?: string;
  message: string;
  onClose: () => void;
};

export const SmallModal = ({ isOpen, title, message, onClose }: Props) => {
  if (!isOpen) return null;
  return createPortal(
    <Box position="fixed" inset={0} zIndex={1100}>
      <Box position="absolute" inset={0} bg="blackAlpha.500" onClick={onClose} />
      <StyledArea
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'min(92vw, 270px)',
          padding: '20px',
          margin: 0,
          display: 'block',
        }}
      >
        {title && (
          <Text fontWeight="bold" mb={2} color="white">{title}</Text>
        )}
        <Text mb={4} color="white">{message}</Text>
        <Box display="flex" justifyContent="flex-end">
          <Button 
            onClick={onClose}
            bg="transparent"
            color="white"
            _hover={{ bg: 'rgba(255, 255, 255, 0.1)' }}
            borderColor="rgba(255, 255, 255, 0.3)"
          >OK</Button>
        </Box>
      </StyledArea>
    </Box>,
    document.body
  );
};
