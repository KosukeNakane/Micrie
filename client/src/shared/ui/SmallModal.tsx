import { Box, Button, Text } from '@chakra-ui/react';
import { createPortal } from 'react-dom';

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
      <Box
        position="absolute"
        left="50%"
        top="50%"
        transform="translate(-50%, -50%)"
        bg="white"
        borderRadius="md"
        boxShadow="xl"
        width="min(92vw, 270px)"
        p={5}
      >
        {title && (
          <Text fontWeight="bold" mb={2}>{title}</Text>
        )}
        <Text mb={4}>{message}</Text>
        <Box display="flex" justifyContent="flex-end">
          <Button onClick={onClose}>OK</Button>
        </Box>
      </Box>
    </Box>,
    document.body
  );
};
