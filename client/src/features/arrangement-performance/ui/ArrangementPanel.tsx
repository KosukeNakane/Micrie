// [UI] features/ui - ArrangementPanel.tsx
// 役割: アレンジメントスロットの設定と制御を提供
import { keyframes } from '@emotion/react';
import { Box, Button, Flex, Text } from '@chakra-ui/react';
import { useMemo, type ChangeEvent } from 'react';

import { useArrangementStore, ARRANGEMENT_SLOT_COUNT } from '@/entities/pattern/model/arrangementStore';
import { useSavedPatternStore } from '@/entities/pattern/model/savedPatternStore';
import { useProjectState } from '@/features/project-save-load';

import { useArrangementPerformer } from '../model/useArrangementPerformer';
import { ArrangementPlaybackToggle } from './ArrangementPlaybackToggle';

const slotGlow = keyframes`
  0% { opacity: 0.25; transform: scale(0.96); }
  50% { opacity: 0.75; transform: scale(1); }
  100% { opacity: 0.25; transform: scale(0.96); }
`;

export const ArrangementPanel = () => {
  const slots = useArrangementStore((state) => state.slots);
  const setSlot = useArrangementStore((state) => state.setSlot);
  const clearSlot = useArrangementStore((state) => state.clearSlot);
  const swapSlots = useArrangementStore((state) => state.swapSlots);

  const savedPatterns = useSavedPatternStore((state) => state.patterns);
  const availablePatterns = useMemo(
    () =>
      savedPatterns
        .map((slot) => (slot.pattern ? { id: slot.pattern.id, name: slot.name } : null))
        .filter((entry): entry is { id: string; name: string } => Boolean(entry)),
    [savedPatterns],
  );

  const { arrangementInfo } = useArrangementPerformer();

  return (
    <Box
      mt={8}
      px={8}
      display="flex"
      flexDirection="column"
      gap={4}
      alignItems="center"
    >
      <ArrangementPlaybackToggle />
      <Flex
        width="100%"
        maxW="820px"
        justifyContent="center"
        gap={4}
        flexDirection="row"
      >
        {Array.from({ length: ARRANGEMENT_SLOT_COUNT }).map((_, visualIndex) => {
          const info = arrangementInfo[visualIndex];
          const isActive = info?.isActive;
          const currentPatternId = slots[visualIndex]?.patternId ?? null;

          const handleSelect = (event: ChangeEvent<HTMLSelectElement>) => {
            const value = event.target.value;
            setSlot(visualIndex, value || null);
            markProjectDirty();
          };

          const moveSlot = (delta: number) => {
            const target = visualIndex + delta;
            if (target < 0 || target >= ARRANGEMENT_SLOT_COUNT) return;
            swapSlots(visualIndex, target);
            markProjectDirty();
          };

          return (
            <Box
              key={visualIndex}
              flex="1 1 0"
              minW="150px"
              maxW="200px"
              border="1px solid"
              borderColor={isActive ? 'rgba(76, 106, 255, 0.85)' : 'rgba(76, 106, 255, 0.4)'}
              borderRadius="12px"
              padding="16px"
              textAlign="center"
              background={
                isActive
                  ? 'linear-gradient(135deg, rgba(81, 113, 255, 0.4), rgba(44, 86, 196, 0.35))'
                  : 'rgba(255, 255, 255, 0.24)'
              }
              boxShadow={
                isActive
                  ? '0 0 18px rgba(76, 106, 255, 0.45), inset 0 0 0 1px rgba(255,255,255,0.35)'
                  : 'inset 0 0 0 1px rgba(255,255,255,0.2)'
              }
              transition="background 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease"
              position="relative"
              overflow="visible"
              _after={
                isActive
                  ? {
                      content: '""',
                      position: 'absolute',
                      inset: '-10px',
                      borderRadius: 'inherit',
                      background: 'radial-gradient(circle, rgba(76,106,255,0.32) 0%, rgba(76,106,255,0) 70%)',
                      filter: 'blur(6px)',
                      animation: `${slotGlow} 1.6s ease-in-out infinite`,
                      pointerEvents: 'none',
                      zIndex: -1,
                    }
                  : undefined
              }
            >
              <Text fontSize="13px" fontWeight="600" color="rgba(5,4,69,0.65)">
                SLOT {visualIndex + 1}
              </Text>
              <Text
                fontSize="15px"
                fontWeight="700"
                color="rgba(5,4,69,0.85)"
                mt={1}
                css={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
              >
                {info?.name ?? 'EMPTY'}
              </Text>
              <Flex justifyContent="center" gap={2} mt={4} alignItems="center">
                <select
                  value={currentPatternId ?? ''}
                  onChange={handleSelect}
                  style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid rgba(5,4,69,0.25)', width: '100%' }}
                >
                  <option value="">-- None --</option>
                  {availablePatterns.map((pattern, idx) => (
                    <option key={`${pattern.id}-${idx}`} value={pattern.id}>
                      {pattern.name}
                    </option>
                  ))}
                </select>
              </Flex>
              <Flex justifyContent="center" gap={2} mt={3}>
                <Button size="xs" variant="ghost" disabled={visualIndex === 0} onClick={() => moveSlot(-1)}>
                  ↑
                </Button>
                <Button size="xs" variant="ghost" disabled={visualIndex === ARRANGEMENT_SLOT_COUNT - 1} onClick={() => moveSlot(1)}>
                  ↓
                </Button>
                <Button size="xs" variant="ghost" onClick={() => { clearSlot(visualIndex); markProjectDirty(); }}>
                  Reset
                </Button>
              </Flex>
              <Text fontSize="11px" color="rgba(5,4,69,0.45)" mt={3}>
                再生順: 左→右
              </Text>
            </Box>
          );
        })}
      </Flex>
    </Box>
  );
};
  const markProjectDirty = () => {
    try { useProjectState.getState().setLastSavedHash(null); } catch {}
  };
