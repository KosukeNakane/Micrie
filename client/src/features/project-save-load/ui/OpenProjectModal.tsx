import { useEffect, useState } from 'react';
import { Box, Button, Text, Spinner, Input } from '@chakra-ui/react';
import { createPortal } from 'react-dom';

type Item = { id: string; name: string; updatedAt?: number };

type Props = {
  isOpen: boolean;
  onClose: () => void;
  fetchItems: () => Promise<Item[]>;
  onSelect: (id: string) => Promise<void> | void;
  onSelectLocal?: (doc: { data: any }) => Promise<void> | void;
};

export function OpenProjectModal({ isOpen, onClose, fetchItems, onSelect, onSelectLocal }: Props) {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'cloud' | 'local'>('cloud');

  useEffect(() => {
    if (!isOpen) return;
    if (mode !== 'cloud') return;
    setLoading(true); setError(null);
    fetchItems().then(setItems).catch((e) => setError(String(e))).finally(() => setLoading(false));
  }, [isOpen, mode]);

  if (!isOpen) return null;

  const content = mode === 'cloud'
    ? (loading
        ? <Box display="flex" alignItems="center" gap={2}><Spinner size="sm" /><Text>Loading…</Text></Box>
        : error
          ? <Text color="red.600" fontSize="sm">{error}</Text>
          : (
            <Box display="grid" gap={2} maxH="50vh" overflow="auto">
              {items.length === 0 && <Text color="gray.600">No projects found.</Text>}
              {items.map((it) => (
                <Button key={it.id} justifyContent="space-between" onClick={() => onSelect(it.id)}>
                  <span>{it.name || it.id}</span>
                  <span style={{ opacity: 0.6, fontSize: 12 }}>{it.updatedAt ? new Date(it.updatedAt).toLocaleString() : ''}</span>
                </Button>
              ))}
            </Box>
          )
      )
    : (
      <Box>
        <Text mb={2} fontSize="sm" color="gray.700">ローカルの .mip ファイルを選択してください。</Text>
        <Input
          type="file"
          accept=".mip,application/json"
          onChange={async (e) => {
            const file = e.currentTarget.files?.[0];
            if (!file) return;
            try {
              const text = await file.text();
              const obj = JSON.parse(text);
              await onSelectLocal?.(obj);
            } catch (err) {
              alert('無効なプロジェクトファイルです');
            } finally {
              onClose();
            }
          }}
        />
      </Box>
    );

  return createPortal(
    <Box position="fixed" inset={0} zIndex={1000}>
      <Box position="absolute" inset={0} bg="blackAlpha.600" onClick={onClose} />
      <Box position="absolute" left="50%" top="50%" transform="translate(-50%, -50%)" bg="white" borderRadius="md" boxShadow="xl" width="min(92vw, 560px)" p={5}>
        <Text fontSize="lg" fontWeight="bold" mb={4}>Open Project</Text>
        <Box display="flex" gap={2} mb={3}>
          <Button
            variant={mode === 'cloud' ? 'solid' : 'outline'}
            colorPalette={mode === 'cloud' ? 'blue' : undefined}
            onClick={() => setMode('cloud')}
          >Cloud</Button>
          <Button
            variant={mode === 'local' ? 'solid' : 'outline'}
            colorPalette={mode === 'local' ? 'green' : undefined}
            onClick={() => setMode('local')}
          >Local</Button>
        </Box>
        {content}
        <Box display="flex" justifyContent="flex-end" gap={2} mt={4}>
          <Button variant="ghost" onClick={onClose}>Close</Button>
        </Box>
      </Box>
    </Box>,
    document.body
  );
}
