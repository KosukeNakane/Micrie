// [UI] features/ui - OpenProjectModal.tsx
// 役割: 表示・入力のUIコンポーネント
import { Box, Button, Text, Spinner, Input } from '@chakra-ui/react';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';

import { ensureAuth, deleteProject } from '@/features/project-save-load';
import { ConfirmDeleteModal } from '@/shared/ui/ConfirmDeleteModal';
import { StyledArea } from '@/shared/ui/StyledArea';
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
      ? <Box display="flex" alignItems="center" gap={2} color="rgba(255, 255, 255, 0.8)"><Spinner size="sm" /><Text>Loading…</Text></Box>
      : error
        ? <Text color="red.300" fontSize="sm">{error}</Text>
        : (
          <>
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <Text fontSize="sm" color="rgba(255, 255, 255, 0.7)">並び替え:</Text>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as any)}
                style={{
                  padding: '6px 8px',
                  borderRadius: 6,
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                }}
              >
                <option value="updatedDesc">最終更新日(新しい順)</option>
                <option value="nameAsc">名前(昇順)</option>
                <option value="createdDesc">作成日(新しい順)</option>
              </select>
            </Box>
            <Box display="grid" gap={2} maxH="50vh" overflow="auto" p={1}>
              {sortedItems.length === 0 && <Text color="rgba(255, 255, 255, 0.6)">No projects found.</Text>}
              {sortedItems.map((it) => (
                <Box key={it.id} position="relative">
                  <Button
                    justifyContent="space-between"
                    width="100%"
                    onClick={() => onSelect(it.id)}
                    variant="outline"
                    borderColor="rgba(255, 255, 255, 0.2)"
                    color="rgba(255, 255, 255, 0.8)"
                    _hover={{ bg: 'rgba(255, 255, 255, 0.1)' }}
                  >
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
        <Text mb={2} fontSize="sm" color="rgba(255, 255, 255, 0.7)">ローカルの .mip ファイルを選択してください。</Text>
        <Box position="relative" as="label" cursor="pointer" display="block">
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
              } catch {
                toaster.error({ title: '無効なプロジェクトファイルです' });
              } finally {
                onClose();
              }
            }}
            position="absolute"
            width="100%"
            height="100%"
            top={0}
            left={0}
            opacity={0}
            cursor="pointer"
          />
          <Button as="div" width="100%" variant="outline" borderColor="rgba(255, 255, 255, 0.3)" color="rgba(255, 255, 255, 0.8)" _hover={{ bg: 'rgba(255, 255, 255, 0.1)' }}>
            ファイルを選択
          </Button>
        </Box>
      </Box>
    );

  return createPortal(
    <Box position="fixed" inset={0} zIndex={1000}>
      <Box position="absolute" inset={0} bg="blackAlpha.600" onClick={onClose} />
      <StyledArea
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'min(92vw, 560px)',
          padding: '20px',
          margin: 0,
          display: 'block',
        }}
      >

        <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={3}>
          <Text fontSize="lg" fontWeight="bold" m="1" color="white">Open Project</Text>
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
        {content}
        <Box display="flex" justifyContent="flex-end" gap={2} mt={4}>
          <Button
            variant="ghost"
            onClick={onClose}
            color="white"
            _hover={{ bg: 'rgba(255, 255, 255, 0.1)' }}
          >Close</Button>
        </Box>
      </StyledArea>
      {/* Global floating menu rendered above modal, positioned under icon */}
      {menuFor && (
        <Box position="fixed" inset={0} zIndex={2000} onClick={() => setMenuFor(null)}>
          <StyledArea
            style={{
              position: 'fixed',
              left: menuFor.x,
              top: menuFor.y + 4,
              padding: '8px',
              margin: 0,
              display: 'block',
            }}
          >
            <Button
              variant="ghost"
              p={0}
              height={'auto'}
              width="100%"
              onClick={() => { setMenuFor(null); setConfirmDelete({ id: menuFor.id, name: menuFor.name }); }}
              color="white"
              _hover={{ bg: 'rgba(255, 255, 255, 0.1)' }}
            >
              Delete
            </Button>
          </StyledArea>
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
