// [UI] features/ui - OpenProjectModal.tsx
// 役割: 表示・入力のUIコンポーネント
import { Box, Button, Text, Spinner, Input } from '@chakra-ui/react';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';

import { ensureAuth, deleteProject } from '@/features/project-save-load';
import { ConfirmDeleteModal } from '@/shared/ui/ConfirmDeleteModal';
import { toaster } from '@/shared/ui/toaster';

type Item = { id: string; name: string; updatedAt?: number; createdAt?: number };

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
  const [sort, setSort] = useState<'updatedDesc' | 'nameAsc' | 'createdDesc'>('updatedDesc');
  const [menuFor, setMenuFor] = useState<null | { id: string; name: string; x: number; y: number }>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    if (mode !== 'cloud') return;
    setLoading(true); setError(null);
    fetchItems().then(setItems).catch((e) => setError(String(e))).finally(() => setLoading(false));
  }, [isOpen, mode]);

  const sortedItems = useMemo(() => {
    const arr = [...items];
    switch (sort) {
      case 'nameAsc':
        arr.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        break;
      case 'createdDesc':
        arr.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        break;
      case 'updatedDesc':
      default:
        arr.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
        break;
    }
    return arr;
  }, [items, sort]);

  if (!isOpen) return null;

  const content = mode === 'cloud'
    ? (loading
        ? <Box display="flex" alignItems="center" gap={2}><Spinner size="sm" /><Text>Loading…</Text></Box>
        : error
          ? <Text color="red.600" fontSize="sm">{error}</Text>
          : (
            <>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <Text fontSize="sm" color="gray.700">並び替え:</Text>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as any)}
                  style={{ padding: '6px 8px', borderRadius: 6, border: '1px solid #CBD5E0', background: 'white' }}
                >
                  <option value="updatedDesc">最終更新日(新しい順)</option>
                  <option value="nameAsc">名前(昇順)</option>
                  <option value="createdDesc">作成日(新しい順)</option>
                </select>
              </Box>
              <Box display="grid" gap={2} maxH="50vh" overflow="auto">
                {sortedItems.length === 0 && <Text color="gray.600">No projects found.</Text>}
                {sortedItems.map((it) => (
                  <Box key={it.id} position="relative">
                    <Button justifyContent="space-between" width="100%" onClick={() => onSelect(it.id)}>
                      <span>{it.name || it.id}</span>
                      <span style={{ opacity: 0.6, fontSize: 12 }}>{it.updatedAt ? new Date(it.updatedAt).toLocaleString() : ''}</span>
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          const rect = (e.currentTarget as HTMLSpanElement).getBoundingClientRect();
                          setMenuFor({ id: it.id, name: it.name, x: rect.left, y: rect.bottom });
                        }}
                        style={{ marginLeft: 8, display: 'inline-flex', alignItems: 'center', padding: 4, borderRadius: 6 }}
                      >
                        <MoreHorizIcon fontSize="small" />
                      </span>
                    </Button>
                  </Box>
                ))}
              </Box>
            </>
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
              toaster.error({ title: '無効なプロジェクトファイルです' });
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
      {/* Global floating menu rendered above modal, positioned under icon */}
      {menuFor && (
        <Box position="fixed" inset={0} zIndex={2000} onClick={() => setMenuFor(null)}>
          <Box
            position="fixed"
            left={menuFor.x}
            top={menuFor.y + 4}
            bg="white"
            borderWidth="1px"
            borderRadius="md"
            boxShadow="xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              variant="ghost"
              width="100%"
              onClick={() => { setMenuFor(null); setConfirmDelete({ id: menuFor.id, name: menuFor.name }); }}
            >
              Delete
            </Button>
          </Box>
        </Box>
      )}
      <ConfirmDeleteModal
        isOpen={!!confirmDelete}
        projectName={confirmDelete?.name}
        onCancel={() => setConfirmDelete(null)}
        onConfirm={async () => {
          if (!confirmDelete) return;
          try {
            const uid = await ensureAuth();
            await deleteProject(uid, confirmDelete.id);
            setItems((prev) => prev.filter((x) => x.id !== confirmDelete.id));
            setConfirmDelete(null);
            toaster.success({ title: '削除しました' });
          } catch (e) {
            console.error(e);
            toaster.error({ title: '削除に失敗しました' });
          }
        }}
      />
    </Box>,
    document.body
  );
}
