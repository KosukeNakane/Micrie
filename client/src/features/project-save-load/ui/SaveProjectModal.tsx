// [UI] features/ui - SaveProjectModal.tsx
// 役割: 表示・入力のUIコンポーネント
import { Box, Button, Input, Text } from "@chakra-ui/react";
import { useState } from "react";
import { createPortal } from "react-dom";

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
        <Text fontSize="lg" fontWeight="bold" mb={4}>Save Project</Text>
        <Box display="flex" gap={2} mb={3}>
          <Button
            variant={mode === 'cloud' ? 'solid' : 'outline'}
            colorPalette={mode === 'cloud' ? 'blue' : undefined}
            onClick={() => setMode('cloud')}
          >
            Cloud
          </Button>
          <Button
            variant={mode === 'local' ? 'solid' : 'outline'}
            colorPalette={mode === 'local' ? 'green' : undefined}
            onClick={() => setMode('local')}
          >
            Local
          </Button>
        </Box>
        <Input
          autoFocus
          placeholder="Project name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }}
        />
        <Box display="flex" justifyContent="flex-end" gap={2} mt={4}>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button colorPalette="blue" loading={loading} onClick={handleSubmit}>Save</Button>
        </Box>
      </Box>
    </Box>,
    document.body
  );
}
