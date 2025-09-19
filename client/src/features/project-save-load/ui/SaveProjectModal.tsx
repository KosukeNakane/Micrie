// [UI] features/ui - SaveProjectModal.tsx
// 役割: 表示・入力のUIコンポーネント
import { Box, Button, Input, Text } from "@chakra-ui/react";
import { useState } from "react";
import { createPortal } from "react-dom";

import { StyledArea } from "@/shared/ui/StyledArea";

type Props = {
  isOpen: boolean;
  initialName?: string | null;
  onClose: () => void;
  onSubmit: (args: { name: string; mode: 'cloud' | 'local' }) => Promise<void> | void;
};

export function SaveProjectModal({ isOpen, initialName, onClose, onSubmit }: Props) {
  const [name, setName] = useState(initialName ?? "");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'cloud' | 'local'>('cloud');

  const handleSubmit = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      await onSubmit({ name: name.trim(), mode });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;
  return createPortal(
    <Box position="fixed" inset={0} zIndex={1000}>
      <Box position="absolute" inset={0} bg="blackAlpha.600" onClick={onClose} />
      <StyledArea
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'min(92vw, 420px)',
          padding: '20px',
          margin: 0,
          display: 'block',
        }}
      >

        <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={3}>
          <Text fontSize="lg" fontWeight="bold" m="1" color="rgba(255, 255, 255, 0.8)">Save Project</Text>
          <Box display="flex" gap={2}>
            <Button
              variant={mode === 'cloud' ? 'solid' : 'outline'}
              onClick={() => setMode('cloud')}
              bg={mode === 'cloud' ? 'linear-gradient(135deg,rgba(49, 130, 206, 0.9),rgba(94, 153, 208, 0.9))' : 'transparent'}
              color={mode === 'cloud' ? 'white' : 'rgba(255, 255, 255, 0.8)'}
              borderColor="rgba(255, 255, 255, 0.4)"
              _hover={{
                bg: mode === 'cloud' ? 'linear-gradient(135deg,rgba(41, 109, 173, 0.9),rgba(71, 123, 172, 0.9))' : 'rgba(255, 255, 255, 0.1)',
              }}
            >
              Cloud
            </Button>
            <Button
              variant={mode === 'local' ? 'solid' : 'outline'}
              onClick={() => setMode('local')}
              bg={mode === 'local' ? 'linear-gradient(135deg,rgba(56, 161, 105, 0.8),rgba(71, 184, 124, 0.8))' : 'transparent'}
              color={mode === 'local' ? 'white' : 'rgba(255, 255, 255, 0.8)'}
              borderColor="rgba(255, 255, 255, 0.4)"
              _hover={{
                bg: mode === 'local' ? 'linear-gradient(135deg,rgba(44, 136, 87, 0.8),rgba(58, 161, 106, 0.8))' : 'rgba(255, 255, 255, 0.1)',
              }}
            >
              Local
            </Button>
          </Box>
        </Box>
        <Input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }}
          bg="rgba(255, 255, 255, 0.1)"
          borderColor="rgba(255, 255, 255, 0.3)"
          color="white"
          placeholder="Project name"
          _placeholder={{ color: 'rgba(255, 255, 255, 0.379)' }}
        />
        <Box display="flex" justifyContent="flex-end" gap={2} mt={3} mb={-1}>
          <Button
            variant="ghost"
            onClick={onClose}
            color="white"
            _hover={{ bg: 'rgba(255, 255, 255, 0.1)' }}
            borderColor="rgba(255, 255, 255, 0.3)"
          >
            Cancel
          </Button>
          <Button
            bg="transparent"
            color="white"
            _hover={{ bg: 'rgba(255, 255, 255, 0.1)' }}
            borderColor="rgba(255, 255, 255, 0.3)"
            loading={loading}
            onClick={() => { void handleSubmit(); }}
          >
            Save
          </Button>
        </Box>
      </StyledArea>
    </Box>,
    document.body
  );
}
